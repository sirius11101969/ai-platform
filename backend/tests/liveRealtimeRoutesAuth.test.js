const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const poolPath = require.resolve('../src/db/pool')
const gatewayPath = require.resolve('../src/services/liveRealtime/liveRealtimeGateway')
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
    require.resolve('../src/routes/liveRealtimeRoutes'),
    require.resolve('../src/controllers/liveRealtimeController'),
    require.resolve('../src/middleware/aiExecutionWorkspaceAuthMiddleware'),
    require.resolve('../src/middleware/allowLiveStreamSseAuth'),
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

async function runWithApp(fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'stream-admin-key'

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
      getWorkspaceForUser: async (_userId, workspaceId) => ({ id: workspaceId || 'workspace-jwt', role: 'owner' }),
    }),
    installMockModule(poolPath, {
      query: async () => ({ rows: [{ id: '11111111-1111-1111-1111-111111111111', name: 'WS', owner_user_id: 'owner-1', plan: 'pro' }] }),
    }),
    installMockModule(gatewayPath, {
      createSession: async () => ({ id: 's1', workspaceId: 'ws-1' }),
      listSessions: async () => [],
      getSession: async ({ workspaceId, sessionId }) => ({ id: sessionId, workspaceId, status: 'completed', events: [{ id: 'e1', eventType: 'session_started', payload: {} }] }),
      getSessionById: async ({ sessionId }) => ({ id: sessionId, workspaceId: 'ws-from-session', status: 'completed', events: [{ id: 'e1', eventType: 'session_started', payload: {} }] }),
      getSessionEvents: async () => [],
      liveRealtimeStreamBus: { subscribe: () => () => {} },
    }),
  ]

  clearAppModules()
  const { app } = require('../src/index')
  const server = await listen(app)
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  try { await fn({ baseUrl }) } finally {
    await close(server)
    clearAppModules()
    restoreMocks.reverse().forEach((restore) => restore())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function testSseRouteAllowsAdminKeyWithoutWorkspaceId() {
  await runWithApp(async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/api/ai/live-stream/sessions/session-1/stream?key=stream-admin-key`)
    const body = await response.text()
    assert.strictEqual(response.status, 200)
    assert.ok(body.includes('event: live_stream_event'))
    assert.ok(body.includes('"eventType":"session_started"'))
  })
}

async function run() {
  await testSseRouteAllowsAdminKeyWithoutWorkspaceId()
  console.log('liveRealtimeRoutesAuth tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
