const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const dbPoolPath = require.resolve('../src/db/pool')
const indexPath = require.resolve('../src/index')

function installMockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => (original ? (require.cache[modulePath] = original) : delete require.cache[modulePath])
}

function clearModules() {
  for (const p of [
    indexPath,
    require.resolve('../src/routes/aiWorkforceRoutes'),
    require.resolve('../src/controllers/aiWorkforceController'),
    require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
    require.resolve('../src/middleware/authMiddleware'),
  ]) delete require.cache[p]
}

async function request(baseUrl, path, headers) {
  const res = await fetch(`${baseUrl}${path}`, { headers })
  return { status: res.status, body: await res.json() }
}

async function runWithApp(fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'workforce-admin-key'

  const restore = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token !== 'valid.jwt') {
          const error = new Error('bad token')
          error.statusCode = 401
          throw error
        }
        return { id: 'u1' }
      },
    }),
    installMockModule(workspaceModelPath, {
      getWorkspaceForUser: async (_u, wid) => (wid === 'ws-ok' ? { id: wid, userId: 'u1' } : null),
    }),
    installMockModule(dbPoolPath, {
      query: async (sql, params) => {
        if (sql.includes('FROM workspaces')) {
          if (params?.[0] === '11111111-1111-1111-1111-111111111111') {
            return { rows: [{ id: params[0], name: 'Admin Workspace', owner_user_id: 'owner-user-id', plan: 'pro' }] }
          }
          return { rows: [] }
        }
        if (sql.includes('FROM ai_workforce_agents')) return { rows: [{ id: 'a1', role: 'SDR', status: 'assigned', workload: 3, collaboration_state: 'active', metadata: {} }] }
        if (sql.includes('FROM ai_workforce_tasks')) return { rows: [{ id: 't1', task_type: 'lead_qualification', status: 'queued', execution_dependencies: ['approval_center'] }] }
        if (sql.includes('FROM ai_workforce_assignments')) return { rows: [{ id: 'as1', task_id: 't1', agent_id: 'a1', status: 'assigned' }] }
        if (sql.includes('FROM ai_workforce_execution_plans')) return { rows: [{ id: 'p1', task_type: 'lead_qualification', status: 'waiting_approval' }] }
        if (sql.includes('FROM ai_workforce_collaboration_events')) return { rows: [{ count: 2 }] }
        if (sql.includes('FROM ai_worker_queue')) return { rows: [{ count: 4 }] }
        return { rows: [] }
      },
    }),
  ]

  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })

  try {
    await fn(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    clearModules(); restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function testWorkforceMetricsViaAdminKey() {
  await runWithApp(async (base) => {
    const logs = []
    const originalInfo = console.info
    console.info = (...args) => logs.push(args)
    try {
      const headers = { 'x-ai-execution-key': 'workforce-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
      const metrics = await request(base, '/api/ai/workforce/metrics', headers)

      assert.strictEqual(metrics.status, 200)
      assert.strictEqual(metrics.body.metrics.pendingApprovals, 4)
      assert.notStrictEqual(metrics.body?.error, 'Не найден токен авторизации')
      assert.ok(logs.some(([event]) => event === 'ai_workforce_gateway_auth_success'))
      assert.ok(logs.some(([event]) => event === 'ai_workforce_workspace_resolved'))
    } finally {
      console.info = originalInfo
    }
  })
}

async function testWorkforceAgentsViaAdminKey() {
  await runWithApp(async (base) => {
    const headers = { 'x-ai-execution-key': 'workforce-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
    const agents = await request(base, '/api/ai/workforce/agents', headers)
    assert.strictEqual(agents.status, 200)
    assert.strictEqual(agents.body.items[0].id, 'a1')
    assert.notStrictEqual(agents.body?.error, 'Не найден токен авторизации')
  })
}

async function testJwtStillWorks() {
  await runWithApp(async (base) => {
    const headers = { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' }
    const assignments = await request(base, '/api/ai/workforce/assignments', headers)
    assert.strictEqual(assignments.status, 200)
  })
}

async function testUnauthorizedWorkspaceDenied() {
  await runWithApp(async (base) => {
    const headers = { 'x-ai-execution-key': 'workforce-admin-key', 'x-workspace-id': '22222222-2222-2222-2222-222222222222' }
    const agents = await request(base, '/api/ai/workforce/agents', headers)
    assert.strictEqual(agents.status, 404)
    assert.deepStrictEqual(agents.body, { error: 'Рабочее пространство не найдено' })
  })
}

Promise.resolve()
  .then(testWorkforceMetricsViaAdminKey)
  .then(testWorkforceAgentsViaAdminKey)
  .then(testJwtStillWorks)
  .then(testUnauthorizedWorkspaceDenied)
  .then(() => console.log('aiWorkforceRoutes.test.js passed'))
  .catch((error) => { console.error(error); process.exit(1) })
