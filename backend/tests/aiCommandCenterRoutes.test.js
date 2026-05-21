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
  for (const p of [indexPath, require.resolve('../src/routes/aiCommandCenterRoutes'), require.resolve('../src/controllers/aiCommandCenterController'), require.resolve('../src/services/aiCommandCenterService')]) delete require.cache[p]
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

async function request(base, path, headers) {
  const res = await fetch(`${base}${path}`, { headers })
  return { status: res.status, body: await res.json() }
}

async function testOverview200() {
  await runWithApp(async () => ({ rows: [{ id: 'x', created_at: new Date().toISOString() }] }), async (base) => {
    const r = await request(base, '/api/ai/command-center/overview', { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.commandCenterVersion, 'v1.1')
  })
}

async function testGatewayAuth() {
  await runWithApp(async () => ({ rows: [{ id: 'x' }] }), async (base) => {
    const r = await request(base, '/api/ai/command-center/overview', { 'x-ai-execution-key': 'wrong-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' })
    assert.strictEqual(r.status, 401)
  })
}

async function testWorkspaceIsolation() {
  await runWithApp(async () => ({ rows: [{ id: 'x' }] }), async (base) => {
    const r = await request(base, '/api/ai/command-center/overview', { 'x-ai-execution-key': 'health-admin-key', 'x-workspace-id': 'bad-ws' })
    assert.strictEqual(r.status, 404)
  })
}

async function testDegradedModules() {
  await runWithApp(async (sql) => {
    if (sql.includes('ai_enterprise_coordination_runs')) throw new Error('temporary timeout')
    return { rows: [{ id: 'x' }] }
  }, async (base) => {
    const r = await request(base, '/api/ai/command-center/overview', { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.ok(r.body.health.DEGRADED >= 1)
  })
}

async function testTimelineAggregation() {
  await runWithApp(async () => ({ rows: [{ id: 'x', created_at: new Date().toISOString() }] }), async (base) => {
    const r = await request(base, '/api/ai/command-center/timeline', { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' })
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.body.version, 'v1.1')
    assert.ok(Array.isArray(r.body.timeline))
    assert.ok(r.body.timeline.length >= 4)
    assert.ok(Array.isArray(r.body.recentEvents))
  })
}

async function testOperationsHubAggregationAndFocusOrdering() {
  await runWithApp(async (sql) => {
    if (sql.includes('FROM ai_command_center_actions')) {
      return {
        rows: [
          { id: 'a1', action_type: 'revenue_review', status: 'requested', created_at: '2026-01-02T00:00:00.000Z' },
          { id: 'a2', action_type: 'workforce_review', status: 'approved', created_at: '2026-01-01T00:00:00.000Z' },
        ],
      }
    }
    return { rows: [{ id: 'x', created_at: new Date().toISOString() }] }
  }, async (base) => {
    const headers = { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' }
    const brief = await request(base, '/api/ai/command-center/brief', headers)
    assert.strictEqual(brief.status, 200)
    assert.ok(brief.body.executiveBrief)
    assert.ok(Array.isArray(brief.body.checklist))

    const operations = await request(base, '/api/ai/command-center/operations', headers)
    assert.strictEqual(operations.status, 200)
    assert.ok(typeof operations.body.operations.healthy === 'number')

    const focus = await request(base, '/api/ai/command-center/focus', headers)
    assert.strictEqual(focus.status, 200)
    assert.ok(Array.isArray(focus.body.focusQueue))
    const priorities = focus.body.focusQueue.map((item) => item.priority)
    const firstMedium = priorities.indexOf('medium')
    const firstHigh = priorities.indexOf('high')
    if (firstMedium >= 0 && firstHigh >= 0) assert.ok(firstHigh < firstMedium)
  })
}

Promise.resolve()
  .then(testGatewayAuth)
  .then(testWorkspaceIsolation)
  .then(testDegradedModules)
  .then(testOverview200)
  .then(testTimelineAggregation)
  .then(testOperationsHubAggregationAndFocusOrdering)
  .then(() => console.log('ok'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
