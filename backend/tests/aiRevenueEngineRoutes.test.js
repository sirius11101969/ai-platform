const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const dbPoolPath = require.resolve('../src/db/pool')
const enginePath = require.resolve('../src/services/aiRevenueEngine/autonomousRevenueEngine')
const indexPath = require.resolve('../src/index')

function installMockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => (original ? (require.cache[modulePath] = original) : delete require.cache[modulePath])
}

function clearModules() {
  for (const p of [
    indexPath,
    require.resolve('../src/routes/aiRevenueEngineRoutes'),
    require.resolve('../src/controllers/aiRevenueEngineController'),
    require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
    require.resolve('../src/middleware/authMiddleware'),
  ]) delete require.cache[p]
}

async function request(baseUrl, path, headers, method = 'GET') {
  const res = await fetch(`${baseUrl}${path}`, { method, headers })
  return { status: res.status, body: await res.json() }
}

async function runWithApp(fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'revenue-admin-key'

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
    installMockModule(enginePath, {
      getLatestSnapshot: async ({ workspaceId }) => ({ workspaceId, score: 81 }),
      getRecommendations: async ({ workspaceId }) => ([{ id: 'rec-1', workspaceId }]),
      getRisks: async ({ workspaceId }) => ([{ id: 'risk-1', workspaceId }]),
      runAnalysis: async ({ workspaceId }) => ({ ok: true, workspaceId, analysisId: 'analysis-1' }),
    }),
    installMockModule(dbPoolPath, {
      query: async (sql, params) => {
        if (sql.includes('FROM workspaces')) {
          if (params?.[0] === '11111111-1111-1111-1111-111111111111') {
            return { rows: [{ id: params[0], name: 'Revenue Workspace', owner_user_id: 'owner-user-id', plan: 'pro' }] }
          }
          return { rows: [] }
        }
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

async function testAdminKeyAuthAndLogs() {
  await runWithApp(async (base) => {
    const logs = []
    const originalInfo = console.info
    console.info = (...args) => logs.push(args)
    try {
      const headers = { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
      const snapshot = await request(base, '/api/ai/revenue-engine/snapshot', headers)

      assert.strictEqual(snapshot.status, 200)
      assert.strictEqual(snapshot.body.snapshot.workspaceId, '11111111-1111-1111-1111-111111111111')
      assert.notStrictEqual(snapshot.body?.error, 'Не найден токен авторизации')
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_gateway_auth_success'))
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_workspace_resolved'))

      const run = await request(base, '/api/ai/revenue-engine/run-analysis', headers, 'POST')
      assert.strictEqual(run.status, 201)
      assert.strictEqual(run.body.analysisId, 'analysis-1')
      assert.ok(logs.some(([event]) => event === 'ai_revenue_engine_analysis_started'))
    } finally {
      console.info = originalInfo
    }
  })
}

async function testWorkspaceIsolation() {
  await runWithApp(async (base) => {
    const headers = { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '22222222-2222-2222-2222-222222222222' }
    const snapshot = await request(base, '/api/ai/revenue-engine/snapshot', headers)
    assert.strictEqual(snapshot.status, 404)
    assert.deepStrictEqual(snapshot.body, { error: 'Рабочее пространство не найдено' })
  })
}

async function testGatewayAuthJwtMode() {
  await runWithApp(async (base) => {
    const headers = { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' }
    const recommendations = await request(base, '/api/ai/revenue-engine/recommendations', headers)
    assert.strictEqual(recommendations.status, 200)
    assert.strictEqual(recommendations.body.recommendations[0].workspaceId, 'ws-ok')
  })
}

async function testRecommendationsAndRisksEndpointAdminKey() {
  await runWithApp(async (base) => {
    const headers = { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
    const recommendations = await request(base, '/api/ai/revenue-engine/recommendations', headers)
    assert.strictEqual(recommendations.status, 200)
    assert.strictEqual(recommendations.body.recommendations[0].id, 'rec-1')

    const risks = await request(base, '/api/ai/revenue-engine/risks', headers)
    assert.strictEqual(risks.status, 200)
    assert.strictEqual(risks.body.risks[0].id, 'risk-1')
  })
}

async function testSnapshotAndRunAnalysisEndpointAdminKey() {
  await runWithApp(async (base) => {
    const headers = { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
    const snapshot = await request(base, '/api/ai/revenue-engine/snapshot', headers)
    assert.strictEqual(snapshot.status, 200)
    assert.strictEqual(snapshot.body.snapshot.score, 81)

    const run = await request(base, '/api/ai/revenue-engine/run-analysis', headers, 'POST')
    assert.strictEqual(run.status, 201)
    assert.strictEqual(run.body.ok, true)
  })
}

Promise.resolve()
  .then(testAdminKeyAuthAndLogs)
  .then(testWorkspaceIsolation)
  .then(testGatewayAuthJwtMode)
  .then(testRecommendationsAndRisksEndpointAdminKey)
  .then(testSnapshotAndRunAnalysisEndpointAdminKey)
  .then(() => console.log('aiRevenueEngineRoutes.test.js passed'))
  .catch((error) => { console.error(error); process.exit(1) })
