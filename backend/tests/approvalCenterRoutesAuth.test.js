const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const workspaceModelPath = require.resolve('../src/models/workspaceModel')
const approvalServicePath = require.resolve('../src/services/approvalCenter/approvalCenterService')
const dbPoolPath = require.resolve('../src/db/pool')
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
    require.resolve('../src/routes/approvalCenterRoutes'),
    require.resolve('../src/controllers/approvalCenterController'),
    require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
    require.resolve('../src/middleware/authMiddleware'),
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
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
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
  process.env.AI_EXECUTION_ADMIN_KEY = 'approval-admin-key'

  const calls = []
  const restoreMocks = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token !== 'valid.jwt') {
          const error = new Error('bad token')
          error.statusCode = 401
          throw error
        }
        return { id: 'user-jwt', email: 'jwt@example.com' }
      },
    }),
    installMockModule(workspaceModelPath, {
      getWorkspaceForUser: async (userId, workspaceId) => ({ id: workspaceId, userId, role: 'owner' }),
    }),
    installMockModule(dbPoolPath, {
      query: async (_sql, params) => {
        if (params?.[0] === '11111111-1111-1111-1111-111111111111') {
          return { rows: [{ id: '11111111-1111-1111-1111-111111111111', name: 'Admin Workspace', owner_user_id: 'owner-user-id', plan: 'pro' }] }
        }
        return { rows: [] }
      },
    }),
    installMockModule(approvalServicePath, {
      listQueue: async (workspaceId, filters) => {
        calls.push(['listQueue', { workspaceId, filters }])
        return { items: [], metrics: { total: 0 } }
      },
      updateDecision: async (args) => {
        calls.push(['updateDecision', args])
        return { id: args.id, workspaceId: args.workspaceId, approvalStatus: 'approved' }
      },
    }),
  ]

  clearAppModules()
  const { app } = require('../src/index')
  const server = await listen(app)
  const baseUrl = `http://127.0.0.1:${server.address().port}`

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

async function testAdminKeyQueueAndDecisionActions() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const originalInfo = console.info
    const logs = []
    console.info = (...args) => logs.push(args)
    try {
      const headers = { 'x-ai-execution-key': 'approval-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }
      const queue = await request(baseUrl, 'GET', '/api/ai/approval-center/queue?status=pending_approval', { headers })
      assert.strictEqual(queue.status, 200)

      const approve = await request(baseUrl, 'POST', '/api/ai/approval-center/item-1/approve', {
        headers,
        body: { reason: 'looks good' },
      })
      assert.strictEqual(approve.status, 200)
      assert.strictEqual(approve.body.item.workspaceId, '11111111-1111-1111-1111-111111111111')

      const reject = await request(baseUrl, 'POST', '/api/ai/approval-center/item-2/reject', {
        headers,
        body: { reason: 'not enough context' },
      })
      assert.strictEqual(reject.status, 200)

      const snooze = await request(baseUrl, 'POST', '/api/ai/approval-center/item-3/snooze', {
        headers,
        body: { reason: 'awaiting customer data', snoozeUntil: '2026-05-20T00:00:00.000Z' },
      })
      assert.strictEqual(snooze.status, 200)

      const escalate = await request(baseUrl, 'POST', '/api/ai/approval-center/item-4/escalate', {
        headers,
        body: { reason: 'manager review needed' },
      })
      assert.strictEqual(escalate.status, 200)

      assert.strictEqual(calls[0][0], 'listQueue')
      assert.strictEqual(calls[0][1].workspaceId, '11111111-1111-1111-1111-111111111111')
      assert.strictEqual(calls[1][0], 'updateDecision')
      assert.strictEqual(calls[1][1].action, 'approve')
      assert.strictEqual(calls[2][1].action, 'reject')
      assert.strictEqual(calls[3][1].action, 'snooze')
      assert.strictEqual(calls[4][1].action, 'escalate')
      assert.strictEqual(calls[1][1].workspaceId, '11111111-1111-1111-1111-111111111111')
      assert.strictEqual(calls[1][1].userId, 'owner-user-id')
      assert.ok(logs.some(([message]) => message === 'ai_control_gateway_auth_success'))
    } finally {
      console.info = originalInfo
    }
  })
}

async function testJwtStillWorks() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const originalInfo = console.info
    const logs = []
    console.info = (...args) => logs.push(args)
    try {
      const queue = await request(baseUrl, 'GET', '/api/ai/approval-center/queue', {
        headers: { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'workspace-jwt' },
      })

      assert.strictEqual(queue.status, 200)
      assert.strictEqual(calls[0][1].workspaceId, 'workspace-jwt')
      assert.ok(logs.some(([message]) => message === 'ai_control_gateway_auth_success'))
    } finally {
      console.info = originalInfo
    }
  })
}

async function testAdminKeyWorkspaceIsolationRejectsUnknownWorkspace() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const response = await request(baseUrl, 'GET', '/api/ai/approval-center/queue', {
      headers: { 'x-ai-execution-key': 'approval-admin-key', 'x-workspace-id': '22222222-2222-2222-2222-222222222222' },
    })

    assert.strictEqual(response.status, 404)
    assert.deepStrictEqual(response.body, { error: 'Рабочее пространство не найдено' })
    assert.strictEqual(calls.length, 0)
  })
}


async function testAdminKeyMissingWorkspaceDenied() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const response = await request(baseUrl, 'GET', '/api/ai/approval-center/queue', {
      headers: { 'x-ai-execution-key': 'approval-admin-key' },
    })

    assert.strictEqual(response.status, 400)
    assert.deepStrictEqual(response.body, { error: 'workspaceId is required for admin key approval center access' })
    assert.strictEqual(calls.length, 0)
  })
}

async function testWrongAdminKeyDenied() {
  await runWithApp(async ({ baseUrl, calls }) => {
    const response = await request(baseUrl, 'GET', '/api/ai/approval-center/queue', {
      headers: {
        'x-ai-execution-key': 'wrong-admin-key',
        'x-workspace-id': '11111111-1111-1111-1111-111111111111',
      },
    })

    assert.strictEqual(response.status, 401)
    assert.deepStrictEqual(response.body, { error: 'Unauthorized' })
    assert.strictEqual(calls.length, 0)
  })
}

async function testAdminKeyApproveAndSnoozeActions() {
  await runWithApp(async ({ baseUrl }) => {
    const headers = { 'x-ai-execution-key': 'approval-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' }

    const approve = await request(baseUrl, 'POST', '/api/ai/approval-center/item-admin-1/approve', {
      headers,
      body: { reason: 'approved by admin key' },
    })
    assert.strictEqual(approve.status, 200)

    const snooze = await request(baseUrl, 'POST', '/api/ai/approval-center/item-admin-2/snooze', {
      headers,
      body: { reason: 'snooze by admin key', snoozeUntil: '2026-05-21T00:00:00.000Z' },
    })
    assert.strictEqual(snooze.status, 200)
  })
}

Promise.resolve()
  .then(testAdminKeyQueueAndDecisionActions)
  .then(testAdminKeyApproveAndSnoozeActions)
  .then(testJwtStillWorks)
  .then(testAdminKeyMissingWorkspaceDenied)
  .then(testWrongAdminKeyDenied)
  .then(testAdminKeyWorkspaceIsolationRejectsUnknownWorkspace)
  .then(() => console.log('approvalCenterRoutesAuth tests passed'))
