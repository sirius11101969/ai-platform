const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const poolPath = require.resolve('../src/db/pool')
const gatewayPath = require.resolve('../src/services/realtimeTransport/realtimeTransportGateway')
const indexPath = require.resolve('../src/index')

function installMockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = { id: modulePath, filename: modulePath, loaded: true, exports }
  return () => {
    if (original) require.cache[modulePath] = original
    else delete require.cache[modulePath]
  }
}

function clearAppModules() {
  for (const modulePath of [
    indexPath,
    require.resolve('../src/routes/realtimeTransportRoutes'),
    require.resolve('../src/controllers/realtimeTransportController'),
    require.resolve('../src/middleware/aiExecutionWorkspaceAuthMiddleware'),
    require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
  ]) delete require.cache[modulePath]
}

async function listen(app) {
  return await new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1')
    server.once('listening', () => resolve(server))
    server.once('error', reject)
  })
}

async function close(server) { await new Promise((resolve, reject) => server.close((e) => e ? reject(e) : resolve())) }

async function request(baseUrl, method, path, { headers = {}, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
  const payload = await response.json()
  return { status: response.status, body: payload }
}

async function runWithApp(fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'transport-admin-key'

  const calls = []
  const restoreMocks = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token !== 'valid.jwt') {
          const error = new Error('bad token')
          error.statusCode = 401
          throw error
        }
        return { id: 'user-1' }
      },
    }),
    installMockModule(workspaceModelPath, {
      getWorkspaceForUser: async (userId, workspaceId) => ({ id: workspaceId || 'workspace-jwt', userId, role: 'owner' }),
    }),
    installMockModule(poolPath, {
      query: async () => ({ rows: [{ id: '11111111-1111-1111-1111-111111111111', name: 'WS', owner_user_id: 'owner-1', plan: 'pro' }] }),
    }),
    installMockModule(gatewayPath, {
      startSimulation: async ({ workspaceId }) => {
        calls.push(['start', workspaceId])
        return { id: 's1', workspaceId, state: 'connected', lifecycle: ['session_started', 'negotiation_started', 'sdp_exchange', 'transcript_chunk', 'ai_response_chunk', 'interruption', 'resume', 'completed'] }
      },
      listSessions: async ({ workspaceId }) => {
        calls.push(['list', workspaceId])
        return [{ id: 's1', workspaceId }]
      },
      getSession: async ({ workspaceId, sessionId }) => {
        calls.push(['get', workspaceId, sessionId])
        return { id: sessionId, workspaceId, events: [{ event_type: 'completed' }] }
      },
    }),
  ]

  clearAppModules()
  const { app } = require('../src/index')
  const server = await listen(app)
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  try { await fn({ baseUrl, calls }) } finally {
    await close(server)
    clearAppModules()
    restoreMocks.reverse().forEach((restore) => restore())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function testAdminKeyWorksAcrossTransportEndpoints() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const logs = []
    const originalInfo = console.info
    console.info = (...args) => logs.push(args)
    try {
      const headers = { 'x-ai-execution-key': 'transport-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
      const created = await request(baseUrl, 'POST', '/api/ai/live-realtime/session', { headers, body: {} })
      const listed = await request(baseUrl, 'GET', '/api/ai/live-realtime/sessions', { headers })
      const fetched = await request(baseUrl, 'GET', '/api/ai/live-realtime/sessions/s1', { headers })
      assert.strictEqual(created.status, 201)
      assert.strictEqual(listed.status, 200)
      assert.strictEqual(fetched.status, 200)
      assert.ok(logs.some(([event]) => event === 'realtime_transport_admin_key_accepted'))
      assert.deepStrictEqual(calls.map((v) => v[0]), ['start', 'list', 'get'])
    } finally {
      console.info = originalInfo
    }
  })
}

async function testJwtStillWorksForTransportEndpoints() {
  await runWithApp(async ({ baseUrl }) => {
    const res = await request(baseUrl, 'GET', '/api/ai/live-realtime/sessions', { headers: { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'workspace-jwt' } })
    assert.strictEqual(res.status, 200)
  })
}

async function testInvalidAdminKeyRejected() {
  await runWithApp(async ({ baseUrl }) => {
    const res = await request(baseUrl, 'GET', '/api/ai/live-realtime/sessions', { headers: { 'x-ai-execution-key': 'wrong', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' } })
    assert.strictEqual(res.status, 401)
    assert.deepStrictEqual(res.body, { error: 'Unauthorized' })
  })
}

Promise.resolve()
  .then(testAdminKeyWorksAcrossTransportEndpoints)
  .then(testJwtStillWorksForTransportEndpoints)
  .then(testInvalidAdminKeyRejected)
  .then(() => console.log('realtimeTransportRoutesAuth tests passed'))
