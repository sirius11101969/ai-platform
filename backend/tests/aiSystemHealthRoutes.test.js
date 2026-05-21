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

Promise.resolve()
  .then(testAllReady)
  .then(testMissingTableNo500)
  .then(testWorkspaceIsolation)
  .then(testGatewayAuth)
  .then(testMissingWorkspaceForAdminKey)
  .then(testDegradedSummary)
  .then(() => console.log('aiSystemHealthRoutes.test.js passed'))
  .catch((e) => { console.error(e); process.exit(1) })
