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
  for (const p of [indexPath, require.resolve('../src/routes/aiSystemHealthRoutes'), require.resolve('../src/controllers/aiSystemHealthController'), require.resolve('../src/services/aiSystemHealthService')]) delete require.cache[p]
}

const authMiddlewarePath = require.resolve('../src/middleware/authMiddleware')


async function testRouteRegistrationOrder() {
  const source = require('fs').readFileSync(require.resolve('../src/index'), 'utf8')
  const mountPos = source.indexOf("app.use('/api/ai', aiSystemHealthRoutes)")
  const protectedLeadPos = source.indexOf("app.post('/api/lead', requireAuth")
  assert.ok(mountPos !== -1, 'system health route mount not found')
  assert.ok(protectedLeadPos !== -1, 'protected /api route not found')
  assert.ok(mountPos < protectedLeadPos, 'system health route must register before protected /api handlers')
}

async function testNoAuthInterceptionForExecutionKey() {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'health-admin-key'

  const restore = [
    installMockModule(authMiddlewarePath, {
      requireAuth: (_req, _res, _next) => {
        throw new Error('requireAuth_should_not_be_called_for_execution_key')
      }
    }),
    installMockModule(authServicePath, { verifyToken: async () => ({ id: 'u1' }) }),
    installMockModule(workspaceModelPath, { getWorkspaceForUser: async () => ({ id: '11111111-1111-1111-1111-111111111111', userId: 'u1' }) }),
    installMockModule(dbPoolPath, { query: async () => ({ rows: [{ id: 'x' }] }) }),
  ]

  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })

  try {
    const r = await request(`http://127.0.0.1:${server.address().port}`, {
      'x-ai-execution-key': 'health-admin-key',
      'x-workspace-id': '11111111-1111-1111-1111-111111111111'
    })
    assert.strictEqual(r.status, 200)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    clearModules()
    restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function runWithApp(dbQuery, fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'health-admin-key'
  const restore = [
    installMockModule(authServicePath, { verifyToken: async (t) => { if (t !== 'valid.jwt') { const e = new Error('bad'); e.statusCode = 401; throw e } return { id: 'u1' } } }),
    installMockModule(workspaceModelPath, { getWorkspaceForUser: async (_u, wid) => (wid === 'ws-ok' || wid === '11111111-1111-1111-1111-111111111111' ? { id: wid, userId: 'u1' } : null) }),
    installMockModule(dbPoolPath, { query: dbQuery }),
  ]
  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)) })
  try { await fn(`http://127.0.0.1:${server.address().port}`) } finally {
    await new Promise((resolve) => server.close(resolve)); clearModules(); restore.reverse().forEach((r) => r())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function request(base, headers) {
  const res = await fetch(`${base}/api/ai/system-health`, { headers })
  return { status: res.status, body: await res.json() }
}

function buildSchemaAwareQuery({ workforceTs = [], approvalTs = [], approvalStatus = [], fallbackRow = { id: 'x' }, throwOnSql } = {}) {
  return async (sql) => {
    if (throwOnSql) return throwOnSql(sql)
    if (sql.includes('FROM information_schema.columns')) {
      const [tableName, candidates] = arguments[1] || []
      if (tableName === 'ai_workforce_realtime_metrics') return { rows: workforceTs.filter((c) => candidates.includes(c)).map((column_name) => ({ column_name })) }
      if (tableName === 'ai_approval_queue' && candidates.includes('status')) return { rows: approvalStatus.filter((c) => candidates.includes(c)).map((column_name) => ({ column_name })) }
      if (tableName === 'ai_approval_queue') return { rows: approvalTs.filter((c) => candidates.includes(c)).map((column_name) => ({ column_name })) }
      return { rows: [] }
    }
    return { rows: [fallbackRow] }
  }
}

async function testAllReady() {
  await runWithApp(async () => ({ rows: [{ id: 'x', created_at: new Date().toISOString() }] }), async (base) => {
    const r = await request(base, { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.status, 'ready')
    assert.strictEqual(r.body.summary.readyCount, 9)
  })
}

async function testMissingTableNo500() {
  await runWithApp(async (sql) => {
    if (sql.includes('ai_strategic_plans')) { const e = new Error('relation does not exist'); e.code = '42P01'; throw e }
    return { rows: [{ id: 'x', created_at: new Date().toISOString() }] }
  }, async (base) => {
    const r = await request(base, { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.status, 'missing')
    assert.ok(r.body.summary.missingCount >= 1)
  })
}

async function testInternalKeyWorks() {
  await runWithApp(async () => ({ rows: [{ id: 'x', created_at: new Date().toISOString() }] }), async (base) => {
    const r = await request(base, { 'x-ai-execution-key': 'health-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' })
    assert.strictEqual(r.status, 200)
    assert.ok(r.body.summary.readyCount >= 1)
  })
}

async function testWorkspaceIsolation() {
  await runWithApp(async () => ({ rows: [{ id: 'x' }] }), async (base) => {
    const r = await request(base, { 'x-ai-execution-key': 'health-admin-key', 'x-workspace-id': 'bad-ws' })
    assert.strictEqual(r.status, 404)
  })
}

async function testGatewayAuth() {
  await runWithApp(async () => ({ rows: [{ id: 'x' }] }), async (base) => {
    const r = await request(base, { 'x-ai-execution-key': 'wrong-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' })
    assert.strictEqual(r.status, 401)
  })
}

async function testMissingWorkspaceForAdminKey() {
  await runWithApp(async () => ({ rows: [{ id: 'x' }] }), async (base) => {
    const r = await request(base, { 'x-ai-execution-key': 'health-admin-key' })
    assert.strictEqual(r.status, 400)
    assert.deepStrictEqual(r.body, { error: 'workspaceId is required for system health' })
  })
}

async function testDegradedSummary() {
  await runWithApp(async (sql) => {
    if (sql.includes('ai_enterprise_coordination_runs')) throw new Error('temporary timeout')
    return { rows: [{ id: 'x' }] }
  }, async (base) => {
    const r = await request(base, { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.status, 'degraded')
    assert.ok(r.body.summary.degradedCount >= 1)
  })
}


async function testCreatedAtAbsentComputedAtExists() {
  const seen = []
  await runWithApp(async (sql, params) => {
    seen.push(sql)
    if (sql.includes('FROM information_schema.columns')) {
      const [tableName, candidates] = params
      if (tableName === 'ai_workforce_realtime_metrics') return { rows: [{ column_name: 'computed_at' }] }
      if (tableName === 'ai_approval_queue' && candidates.includes('status')) return { rows: [{ column_name: 'status' }] }
      if (tableName === 'ai_approval_queue') return { rows: [{ column_name: 'created_at' }] }
      return { rows: [] }
    }
    return { rows: [{ id: 'x', computed_at: new Date().toISOString() }] }
  }, async (base) => {
    const r = await request(base, { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.ok(seen.some((q) => q.includes('ORDER BY computed_at DESC')), 'expected workforce query to order by computed_at')
  })
}

async function testStatusAbsentQueueStatusExists() {
  const seen = []
  await runWithApp(async (sql, params) => {
    seen.push(sql)
    if (sql.includes('FROM information_schema.columns')) {
      const [tableName, candidates] = params
      if (tableName === 'ai_workforce_realtime_metrics') return { rows: [{ column_name: 'created_at' }] }
      if (tableName === 'ai_approval_queue' && candidates.includes('status')) return { rows: [{ column_name: 'queue_status' }] }
      if (tableName === 'ai_approval_queue') return { rows: [{ column_name: 'created_at' }] }
      return { rows: [] }
    }
    return { rows: [{ id: 'x', created_at: new Date().toISOString() }] }
  }, async (base) => {
    const r = await request(base, { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.ok(seen.some((q) => q.includes("queue_status='pending_approval'")), 'expected approval query to use queue_status')
  })
}

Promise.resolve()
  .then(testRouteRegistrationOrder)
  .then(testAllReady)
  .then(testCreatedAtAbsentComputedAtExists)
  .then(testStatusAbsentQueueStatusExists)
  .then(testMissingTableNo500)
  .then(testInternalKeyWorks)
  .then(testWorkspaceIsolation)
  .then(testGatewayAuth)
  .then(testMissingWorkspaceForAdminKey)
  .then(testNoAuthInterceptionForExecutionKey)
  .then(testDegradedSummary)
  .then(() => console.log('aiSystemHealthRoutes.test.js passed'))
  .catch((e) => { console.error(e); process.exit(1) })
