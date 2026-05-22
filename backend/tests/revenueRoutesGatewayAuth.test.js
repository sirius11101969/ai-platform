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
    require.resolve('../src/routes/revenueRoutes'),
    require.resolve('../src/controllers/revenueController'),
    require.resolve('../src/services/revenueService'),
    require.resolve('../src/middleware/aiControlGateway'),
    require.resolve('../src/middleware/authMiddleware'),
    require.resolve('../src/middleware/workspaceMiddleware'),
  ]) delete require.cache[p]
}

async function request(baseUrl, method, path, { headers, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, body: await response.json() }
}

async function run() {
  const originalAdminKey = process.env.AI_EXECUTION_ADMIN_KEY
  process.env.AI_EXECUTION_ADMIN_KEY = 'revenue-admin-key'

  const restore = [
    installMockModule(authServicePath, {
      verifyToken: async (token) => {
        if (token === 'valid.jwt') return { id: 'u1' }
        const error = new Error('invalid token')
        error.statusCode = 401
        throw error
      },
    }),
    installMockModule(workspaceModelPath, {
      getWorkspaceForUser: async (_userId, workspaceId) => (workspaceId === 'ws-ok' ? { id: workspaceId, userId: 'u1' } : null),
    }),
    installMockModule(dbPoolPath, {
      query: async (sql, params) => {
        if (sql.includes('FROM workspaces')) {
          if (params?.[0] === '11111111-1111-1111-1111-111111111111') {
            return { rows: [{ id: params[0], name: 'Revenue WS', owner_user_id: 'owner-1', plan: 'pro' }] }
          }
          return { rows: [] }
        }
        return { rows: [] }
      },
      connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }),
    }),
  ]

  clearModules()
  const { app } = require('../src/index')
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })

  try {
    const base = `http://127.0.0.1:${server.address().port}`

    const keyAuth = await request(base, 'GET', '/api/revenue/overview', {
      headers: { 'x-ai-execution-key': 'revenue-admin-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' },
    })
    assert.strictEqual(keyAuth.status, 200)

    const missingWorkspace = await request(base, 'GET', '/api/revenue/overview', {
      headers: { 'x-ai-execution-key': 'revenue-admin-key' },
    })
    assert.strictEqual(missingWorkspace.status, 400)
    assert.deepStrictEqual(missingWorkspace.body, { error: 'workspaceId is required for revenue routes' })

    const unauthorized = await request(base, 'GET', '/api/revenue/overview', {
      headers: { 'x-ai-execution-key': 'wrong-key', 'x-workspace-id': '11111111-1111-1111-1111-111111111111' },
    })
    assert.strictEqual(unauthorized.status, 401)

    const jwtAuth = await request(base, 'GET', '/api/revenue/overview', {
      headers: { authorization: 'Bearer valid.jwt', 'x-workspace-id': 'ws-ok' },
    })
    assert.strictEqual(jwtAuth.status, 200)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    clearModules()
    restore.reverse().forEach((fn) => fn())
    if (originalAdminKey === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = originalAdminKey
  }
}

run().then(() => console.log('revenueRoutesGatewayAuth.test.js passed')).catch((error) => {
  console.error(error)
  process.exit(1)
})
