const assert = require('assert')
const fs = require('fs')
const path = require('path')

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
  for (const p of [indexPath, require.resolve('../src/routes/aiRevenueEngineRoutes'), require.resolve('../src/controllers/aiRevenueEngineController'), require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'), require.resolve('../src/middleware/workspaceMiddleware'), require.resolve('../src/middleware/authMiddleware')]) delete require.cache[p]
}

async function request(baseUrl, path, method = 'GET', headers = {}) {
  const res = await fetch(`${baseUrl}${path}`, { method, headers })
  return { status: res.status, body: await res.json() }
}

async function runWithApp(fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'revenue-admin-key'
  const restore = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token !== 'valid.jwt') { const error = new Error('bad token'); error.statusCode = 401; throw error }
        return { id: 'u1' }
      },
    }),
    installMockModule(workspaceModelPath, {
      getWorkspaceForUser: async (_u, wid) => (wid === 'ws-ok' ? { id: wid, userId: 'u1' } : null),
    }),
    installMockModule(dbPoolPath, {
      query: async (sql, params) => {
        if (sql.includes('FROM workspaces')) return params?.[0] === '11111111-1111-1111-1111-111111111111' ? { rows: [{ id: params[0], name: 'Admin Workspace', owner_user_id: 'owner-user-id', plan: 'pro' }] } : { rows: [] }
        if (sql.includes('INSERT INTO ai_revenue_engine_snapshots')) return { rows: [{ id: 'snap-1', created_at: new Date().toISOString() }] }
        if (sql.includes('INSERT INTO ai_revenue_strategy_recommendations')) return { rows: [] }
        if (sql.includes('INSERT INTO ai_revenue_risk_events')) return { rows: [] }
        if (sql.includes('INSERT INTO ai_revenue_optimization_memory')) return { rows: [] }
        if (sql.includes('FROM crm_leads')) return { rows: [{ status: 'won', value: 1000, estimated_revenue: 1000 }] }
        if (sql.includes('FROM ai_approval_queue')) return { rows: [{ pending: 1 }] }
        if (sql.includes('FROM ai_workforce_realtime_metrics') && sql.includes('AVG(queue_pressure)')) return { rows: [{ pressure: 55 }] }
        if (sql.includes('FROM ai_workforce_realtime_metrics') && sql.includes('AVG(utilization_pct)')) return { rows: [{ utilization: 67 }] }
        if (sql.includes('SELECT * FROM ai_revenue_engine_snapshots')) return { rows: [{ id: 'snap-last', workspace_id: params?.[0] }] }
        if (sql.includes('SELECT * FROM ai_revenue_strategy_recommendations')) return { rows: [{ id: 'rec-1', workspace_id: params?.[0] }] }
        if (sql.includes('SELECT * FROM ai_revenue_risk_events')) return { rows: [{ id: 'risk-1', workspace_id: params?.[0] }] }
        return { rows: [] }
      },
      connect: async () => ({ query: async (sql, params) => module.exports.__db.query(sql, params), release: () => {} }),
    }),
  ]
  // keep connect/query shared for transaction codepath
  module.exports.__db = require(dbPoolPath)

  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })
  try { await fn(`http://127.0.0.1:${server.address().port}`) } finally {
    await new Promise((resolve) => server.close(resolve))
    clearModules(); restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function testRevenueEngineEndpointsViaAdminKey() {
  await runWithApp(async (base) => {
    const logs = []
    const originalInfo = console.info
    console.info = (...args) => logs.push(args)
    try {
      const headers = { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
      const snapshot = await request(base, '/api/ai/revenue-engine/snapshot', 'GET', headers)
      const recommendations = await request(base, '/api/ai/revenue-engine/recommendations', 'GET', headers)
      const risks = await request(base, '/api/ai/revenue-engine/risks', 'GET', headers)
      const analysis = await request(base, '/api/ai/revenue-engine/run-analysis', 'POST', headers)
      assert.strictEqual(snapshot.status, 200)
      assert.strictEqual(recommendations.status, 200)
      assert.strictEqual(risks.status, 200)
      assert.strictEqual(analysis.status, 200)
      assert.strictEqual(analysis.body.workspaceId, '11111111-1111-1111-1111-111111111111')
      assert.notStrictEqual(snapshot.body?.error, 'Не найден токен авторизации')
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_gateway_middleware_active'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_routes_registered'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_request_debug'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_auth_context_attached'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_workspace_resolved'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_context_resolved'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_analysis_started'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_analysis_completed'))
    } finally { console.info = originalInfo }
  })
}

async function testGatewayConfigParityWithWorkforce() {
  const revenueRoutesPath = path.join(__dirname, '../src/routes/aiRevenueEngineRoutes.js')
  const workforceRoutesPath = path.join(__dirname, '../src/routes/aiWorkforceRoutes.js')
  const revenueSource = fs.readFileSync(revenueRoutesPath, 'utf8')
  const workforceSource = fs.readFileSync(workforceRoutesPath, 'utf8')

  assert.match(revenueSource, /missingWorkspaceError:\s*'workspaceId is required for admin key revenue engine access'/)
  assert.match(workforceSource, /missingWorkspaceError:\s*'workspaceId is required for admin key workforce access'/)
  assert.ok(!revenueSource.includes('requireWorkspaceForAdminKey: true'))
}

async function testRevenueEngineJwtStillWorks() {
  await runWithApp(async (base) => {
    const headers = { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' }
    const snapshot = await request(base, '/api/ai/revenue-engine/snapshot', 'GET', headers)
    assert.strictEqual(snapshot.status, 200)
  })
}

Promise.resolve()
  .then(testRevenueEngineEndpointsViaAdminKey)
  .then(testRevenueEngineJwtStillWorks)
  .then(testGatewayConfigParityWithWorkforce)
  .then(() => console.log('aiRevenueEngineRoutes.test.js passed'))
  .catch((error) => { console.error(error); process.exit(1) })
