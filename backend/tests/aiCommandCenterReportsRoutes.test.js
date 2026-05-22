const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const commandCenterServicePath = require.resolve('../src/services/aiCommandCenterService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const indexPath = require.resolve('../src/index')

function installMockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => { if (original) require.cache[modulePath] = original; else delete require.cache[modulePath] }
}

function clearModules() {
  for (const modulePath of [indexPath, require.resolve('../src/routes/aiCommandCenterRoutes'), require.resolve('../src/controllers/aiCommandCenterController'), require.resolve('../src/middleware/aiControlGateway'), require.resolve('../src/middleware/workspaceMiddleware')]) {
    delete require.cache[modulePath]
  }
}

async function listen(app) { return await new Promise((resolve, reject) => { const server = app.listen(0, '127.0.0.1'); server.once('listening', () => resolve(server)); server.once('error', reject) }) }
async function close(server) { await new Promise((resolve, reject) => server.close((e) => e ? reject(e) : resolve())) }

async function request(baseUrl, path, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, { headers })
  return { status: response.status, body: await response.json() }
}

async function runWithApp(fn) {
  const calls = []
  const restore = [
    installMockModule(authServicePath, { verifyToken: async () => ({ id: 'user-1', email: 'user@example.com' }) }),
    installMockModule(workspaceModelPath, { getWorkspaceForUser: async (_u, workspaceId) => ({ id: workspaceId, role: 'owner' }) }),
    installMockModule(commandCenterServicePath, {
      getOverview: async () => ({}), getTimeline: async () => ({}), getBrief: async () => ({}), getOperations: async () => ({}), getFocus: async () => ({}),
      requestAction: async () => ({}), getActions: async () => ({}), reviewAction: async () => ({}), getActionAudit: async () => ({}),
      getReport: async (args) => { calls.push(args); return { reportType: args.reportType, kpis: { readiness: 9 } } },
      getKpi: async (args) => { calls.push({ ...args, reportType: 'kpi' }); return { reportType: 'kpi', kpis: { approvalQueueOpen: 2 } } },
    }),
  ]

  clearModules()
  const { app } = require('../src/index')
  const server = await listen(app)
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  try { await fn({ baseUrl, calls }) } finally { await close(server); clearModules(); restore.reverse().forEach((f) => f()) }
}

Promise.resolve().then(async () => {
  await runWithApp(async ({ baseUrl, calls }) => {
    const headers = { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-1' }
    const daily = await request(baseUrl, '/api/ai/command-center/report/daily', headers)
    assert.strictEqual(daily.status, 200)
    assert.strictEqual(daily.body.reportType, 'daily')

    const weekly = await request(baseUrl, '/api/ai/command-center/report/weekly', headers)
    assert.strictEqual(weekly.status, 200)
    assert.strictEqual(weekly.body.reportType, 'weekly')

    const kpi = await request(baseUrl, '/api/ai/command-center/kpi', headers)
    assert.strictEqual(kpi.status, 200)
    assert.strictEqual(kpi.body.kpis.approvalQueueOpen, 2)

    assert.strictEqual(calls[0].workspaceId, 'ws-1')
    assert.strictEqual(calls[1].workspaceId, 'ws-1')
    assert.strictEqual(calls[2].workspaceId, 'ws-1')
  })

  await runWithApp(async ({ baseUrl }) => {
    const unauthorized = await request(baseUrl, '/api/ai/command-center/report/daily', { 'x-workspace-id': 'ws-1' })
    assert.strictEqual(unauthorized.status, 401)
  })

  console.log('aiCommandCenterReportsRoutes tests passed')
})
