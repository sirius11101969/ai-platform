const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const sequenceServicePath = require.resolve('../src/services/aiSequenceOrchestratorService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const indexPath = require.resolve('../src/index')

function installMockModule(modulePath, exports) {
  const original = require.cache[modulePath]
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports,
  }
  return () => {
    if (original) require.cache[modulePath] = original
    else delete require.cache[modulePath]
  }
}

function clearAppModules() {
  for (const modulePath of [
    indexPath,
    require.resolve('../src/routes/aiSequenceRoutes'),
    require.resolve('../src/controllers/aiSequenceController'),
    require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
  ]) {
    delete require.cache[modulePath]
  }
}

async function listen(app) {
  return await new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1')
    server.once('listening', () => resolve(server))
    server.once('error', reject)
  })
}

async function close(server) {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}

async function request(baseUrl, method, path, { headers = {}, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json()
  return { status: response.status, body: payload }
}

async function runWithApp(fn) {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'sequence-admin-key'

  const calls = []
  const restoreMocks = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token !== 'valid.jwt') {
          const error = new Error('bad token')
          error.statusCode = 401
          throw error
        }
        return { id: 'user-1', email: 'user@example.com' }
      },
    }),
    installMockModule(workspaceModelPath, {
      getWorkspaceForUser: async (userId, workspaceId) => ({ id: workspaceId || 'workspace-from-jwt', userId, role: 'owner' }),
    }),
    installMockModule(sequenceServicePath, {
      startSequence: async (args) => {
        calls.push(['startSequence', args])
        return { id: 'sequence-1', status: 'active', workspaceId: args.workspaceId, userId: args.userId }
      },
      pauseSequence: async (args) => {
        calls.push(['pauseSequence', args])
        return { updatedCount: 1, sequences: [] }
      },
      stopSequence: async (args) => {
        calls.push(['stopSequence', args])
        return { updatedCount: 1, sequences: [] }
      },
      getSequenceDashboard: async (args) => {
        calls.push(['getSequenceDashboard', args])
        return { active: [], workspaceId: args.workspaceId }
      },
    }),
  ]

  clearAppModules()
  const { app } = require('../src/index')
  const server = await listen(app)
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    await fn({ baseUrl, calls })
  } finally {
    await close(server)
    clearAppModules()
    restoreMocks.reverse().forEach((restore) => restore())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

async function testAdminKeyWorksForAllSequenceEndpoints() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const originalInfo = console.info
    const logs = []
    console.info = (...args) => logs.push(args)

    try {
      const commonHeaders = { 'x-ai-execution-key': 'sequence-admin-key', 'x-workspace-id': 'workspace-admin' }

      const start = await request(baseUrl, 'POST', '/api/ai/sequences/start', {
        headers: commonHeaders,
        body: { leadId: 'lead-1' },
      })
      assert.strictEqual(start.status, 201)
      assert.strictEqual(start.body.sequence.workspaceId, 'workspace-admin')

      const pause = await request(baseUrl, 'POST', '/api/ai/sequences/pause', {
        headers: commonHeaders,
        body: { leadSequenceId: 'sequence-1' },
      })
      assert.strictEqual(pause.status, 200)
      assert.strictEqual(pause.body.updatedCount, 1)

      const stop = await request(baseUrl, 'POST', '/api/ai/sequences/stop', {
        headers: commonHeaders,
        body: { leadSequenceId: 'sequence-1' },
      })
      assert.strictEqual(stop.status, 200)
      assert.strictEqual(stop.body.updatedCount, 1)

      const active = await request(baseUrl, 'GET', '/api/ai/sequences/active', { headers: commonHeaders })
      assert.strictEqual(active.status, 200)
      assert.strictEqual(active.body.workspaceId, 'workspace-admin')

      assert.deepStrictEqual(calls.map(([name]) => name), [
        'startSequence',
        'pauseSequence',
        'stopSequence',
        'getSequenceDashboard',
      ])
      assert.ok(logs.some(([message]) => message === 'sequence_admin_key_accepted'))
    } finally {
      console.info = originalInfo
    }
  })
}

async function testJwtStillWorksForSequenceEndpoints() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const start = await request(baseUrl, 'POST', '/api/ai/sequences/start', {
      headers: { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'workspace-jwt' },
      body: { leadId: 'lead-1' },
    })

    assert.strictEqual(start.status, 201)
    assert.strictEqual(start.body.sequence.workspaceId, 'workspace-jwt')
    assert.strictEqual(start.body.sequence.userId, 'user-1')
    assert.strictEqual(calls[0][0], 'startSequence')
    assert.strictEqual(calls[0][1].userId, 'user-1')
  })
}

async function testInvalidAdminKeyRejected() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const active = await request(baseUrl, 'GET', '/api/ai/sequences/active', {
      headers: { 'x-ai-execution-key': 'wrong-key', 'x-workspace-id': 'workspace-admin' },
    })

    assert.strictEqual(active.status, 401)
    assert.deepStrictEqual(active.body, { error: 'Unauthorized' })
    assert.strictEqual(calls.length, 0)
  })
}

Promise.resolve()
  .then(testAdminKeyWorksForAllSequenceEndpoints)
  .then(testJwtStillWorksForSequenceEndpoints)
  .then(testInvalidAdminKeyRejected)
  .then(() => console.log('aiSequenceRoutesAuth tests passed'))
