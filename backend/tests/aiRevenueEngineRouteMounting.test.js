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
        if (sql.includes('SELECT * FROM ai_revenue_engine_snapshots')) return { rows: [] }
        if (sql.includes('SELECT * FROM ai_revenue_strategy_recommendations')) return { rows: [] }
        if (sql.includes('SELECT * FROM ai_revenue_risk_events')) return { rows: [] }
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
    const res = await fetch(`${base}/api/ai/revenue-engine/snapshot`, {
      method: 'GET',
      headers: { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' },
    })
    const body = await res.json()

    assert.strictEqual(res.status, 200)
    assert.notStrictEqual(body?.error, 'Не найден токен авторизации')
    assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_gateway_middleware_active'))
    assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_request_debug'))
    assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_auth_context_attached'))

    const requestDebug = logs.find(([event]) => event === 'ai_revenue_engine_request_debug')
    const authAttached = logs.find(([event]) => event === 'ai_revenue_engine_auth_context_attached')
    assert.ok(requestDebug && authAttached)
    assert.strictEqual(Boolean(authAttached[1]?.authContextAttached), true)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    console.info = originalInfo
    clearModules(); restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

run().then(() => console.log('aiRevenueEngineRouteMounting.test.js passed')).catch((error) => { console.error(error); process.exit(1) })
