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
  for (const p of [indexPath, require.resolve('../src/routes/aiRevenueEngineRoutes'), require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'), require.resolve('../src/middleware/workspaceMiddleware'), require.resolve('../src/middleware/authMiddleware')]) delete require.cache[p]
}

async function run() {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'revenue-admin-key'

  const restore = [
    installMockModule(authServicePath, { verifyToken: async () => ({ id: 'u1' }) }),
    installMockModule(workspaceModelPath, { getWorkspaceForUser: async () => ({ id: 'ws-ok', userId: 'u1' }) }),
    installMockModule(dbPoolPath, {
      query: async (sql, params) => {
        if (sql.includes('FROM workspaces')) return { rows: [{ id: params[0], name: 'WS', owner_user_id: 'owner-user-id', plan: 'pro' }] }
        if (sql.includes('FROM crm_leads')) return { rows: [] }
        if (sql.includes('FROM ai_approval_queue')) return { rows: [{ pending: 0 }] }
        if (sql.includes('FROM ai_workforce_realtime_metrics')) return { rows: [{ pressure: 10, utilization: 20 }] }
        if (sql.includes('INSERT INTO ai_revenue_engine_snapshots')) return { rows: [{ id: 'snap-1' }] }
        return { rows: [] }
      },
      connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
    }),
  ]

  clearModules()
  const logs = []
  const originalInfo = console.info
  console.info = (...args) => logs.push(args)

  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })

  try {
    const base = `http://127.0.0.1:${server.address().port}`

    const revenueRes = await fetch(`${base}/api/ai/revenue-engine/run-analysis`, {
      method: 'POST',
      headers: { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' },
    })
    const revenueBody = await revenueRes.json()

    assert.strictEqual(revenueRes.status, 201)
    assert.notStrictEqual(revenueBody?.error, 'Не найден токен авторизации')
    assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_context_resolved'))
    assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_analysis_started'))

    const executionRes = await fetch(`${base}/api/execution/materials`, {
      method: 'GET',
      headers: { authorization: 'Bearer jwt', 'x-workspace-id': 'ws-ok' },
    })
    assert.strictEqual(executionRes.status, 200)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    console.info = originalInfo
    clearModules(); restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

run().then(() => console.log('aiExecutionRoutesScoping.test.js passed')).catch((error) => { console.error(error); process.exit(1) })
