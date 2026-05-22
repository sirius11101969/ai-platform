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
      getPlanning: async (args) => { calls.push({ ...args, reportType: 'planning' }); return { planningHorizon: 'weekly_monthly' } },
      getPlanningWeekly: async (args) => { calls.push({ ...args, reportType: 'planning_weekly' }); return { planningHorizon: 'weekly' } },
      getPlanningMonthly: async (args) => { calls.push({ ...args, reportType: 'planning_monthly' }); return { planningHorizon: 'monthly' } },
      getReview: async (args) => { calls.push({ ...args, reportType: 'review' }); return { review: { totalOpenDecisions: 1 } } },
      getStability: async (args) => { calls.push({ ...args, reportType: 'stability' }); return { stability: { staleApprovals: 0 } } },
      getReadiness: async (args) => { calls.push({ ...args, reportType: 'readiness' }); return { readiness: { governanceOk: true } } },
      getQuality: async (args) => { calls.push({ ...args, reportType: 'quality' }); return { quality: { duplicatedRecommendations: 0, emptyReports: 0 }, governance: { governanceScore: 84 }, readiness: { governanceOk: true } } },
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

    const planning = await request(baseUrl, '/api/ai/command-center/planning', headers)
    assert.strictEqual(planning.status, 200)
    assert.strictEqual(planning.body.planningHorizon, 'weekly_monthly')

    const planningWeekly = await request(baseUrl, '/api/ai/command-center/planning/weekly', headers)
    assert.strictEqual(planningWeekly.status, 200)
    assert.strictEqual(planningWeekly.body.planningHorizon, 'weekly')

    const planningMonthly = await request(baseUrl, '/api/ai/command-center/planning/monthly', headers)
    assert.strictEqual(planningMonthly.status, 200)
    assert.strictEqual(planningMonthly.body.planningHorizon, 'monthly')

    const review = await request(baseUrl, '/api/ai/command-center/review', headers)
    assert.strictEqual(review.status, 200)
    assert.strictEqual(review.body.review.totalOpenDecisions, 1)

    const stability = await request(baseUrl, '/api/ai/command-center/stability', headers)
    assert.strictEqual(stability.status, 200)
    assert.strictEqual(stability.body.stability.staleApprovals, 0)

    const readiness = await request(baseUrl, '/api/ai/command-center/readiness', headers)
    assert.strictEqual(readiness.status, 200)
    assert.strictEqual(readiness.body.readiness.governanceOk, true)

    const quality = await request(baseUrl, '/api/ai/command-center/quality', headers)
    assert.strictEqual(quality.status, 200)
    assert.strictEqual(quality.body.quality.duplicatedRecommendations, 0)

    assert.strictEqual(calls[0].workspaceId, 'ws-1')
    assert.strictEqual(calls[1].workspaceId, 'ws-1')
    assert.strictEqual(calls[2].workspaceId, 'ws-1')
    assert.strictEqual(calls[3].workspaceId, 'ws-1')
    assert.strictEqual(calls[4].workspaceId, 'ws-1')
    assert.strictEqual(calls[5].workspaceId, 'ws-1')
  })

  await runWithApp(async ({ baseUrl }) => {
    const unauthorized = await request(baseUrl, '/api/ai/command-center/report/daily', { 'x-workspace-id': 'ws-1' })
    assert.strictEqual(unauthorized.status, 401)
  })

  console.log('aiCommandCenterReportsRoutes tests passed')
})
