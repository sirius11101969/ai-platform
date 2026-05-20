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
    require.resolve('../src/routes/aiExecutionLayerRoutes'),
    require.resolve('../src/routes/aiRevenueEngineRoutes'),
    require.resolve('../src/routes/aiWorkforceRoutes'),
    require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
    require.resolve('../src/middleware/authMiddleware'),
  ]) delete require.cache[p]
}

async function request(baseUrl, path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options)
  const body = await res.json()
  return { status: res.status, body }
}

async function run() {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'admin-key'

  const restore = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token === 'valid.jwt') return { id: 'u1' }
        const error = new Error('bad token')
        error.statusCode = 401
        throw error
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
        if (sql.includes('FROM crm_leads')) return { rows: [] }
        if (sql.includes('FROM ai_approval_queue')) return { rows: [{ pending: 0 }] }
        if (sql.includes('FROM ai_workforce_realtime_metrics')) return { rows: [{ pressure: 10, utilization: 20 }] }
        if (sql.includes('SELECT * FROM ai_revenue_engine_snapshots')) return { rows: [] }
        if (sql.includes('SELECT * FROM ai_revenue_strategy_recommendations')) return { rows: [] }
        if (sql.includes('SELECT * FROM ai_revenue_risk_events')) return { rows: [] }
        if (sql.includes('FROM ai_workforce_agents')) return { rows: [{ id: 'a1' }] }
        if (sql.includes('FROM ai_conversation_memory')) return { rows: [] }
        if (sql.includes('FROM ai_sdr_lead_states')) return { rows: [] }
        if (sql.includes('FROM ai_next_best_actions')) return { rows: [] }
        if (sql.includes('FROM ai_action_queue')) return { rows: [] }
        if (sql.includes('FROM ai_workforce_tasks')) return { rows: [] }
        if (sql.includes('FROM ai_workforce_assignments')) return { rows: [] }
        if (sql.includes('FROM ai_workforce_execution_plans')) return { rows: [] }
        if (sql.includes('FROM ai_workforce_events')) return { rows: [] }
        return { rows: [] }
      },
      connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
    }),
  ]

  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })

  try {
    const base = `http://127.0.0.1:${server.address().port}`
    const adminHeaders = { 'x-ai-execution-key': 'admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }

    const revenue = await request(base, '/api/ai/revenue-engine/snapshot', { headers: adminHeaders })
    assert.strictEqual(revenue.status, 200, 'revenue endpoint should not be intercepted by /execution auth middleware')
    assert.notStrictEqual(revenue.body?.error, 'Не найден токен авторизации')

    const executionNoAuth = await request(base, '/api/ai/execution/queue')
    assert.strictEqual(executionNoAuth.status, 401, 'execution layer must still require auth')
    assert.strictEqual(executionNoAuth.body.error, 'Не найден токен авторизации')

    const executionAuth = await request(base, '/api/ai/execution/queue', { headers: { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' } })
    assert.strictEqual(executionAuth.status, 200)

    const workforce = await request(base, '/api/ai/workforce/agents', { headers: adminHeaders })
    assert.strictEqual(workforce.status, 200, 'workforce route should keep working')

    const commandGraph = await request(base, '/api/ai/workforce/command-graph', { headers: adminHeaders })
    assert.strictEqual(commandGraph.status, 200, 'command graph route should keep working')
  } finally {
    await new Promise((resolve) => server.close(resolve))
    clearModules(); restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

run().then(() => console.log('aiApiAuthScopingRegression.test.js passed')).catch((error) => { console.error(error); process.exit(1) })
