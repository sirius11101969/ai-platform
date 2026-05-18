const assert = require('assert')

const authServicePath = require.resolve('../src/services/authService')
const middlewarePath = require.resolve('../src/middleware/aiExecutionRunnerAuthMiddleware')

function loadMiddleware(verifyToken = async () => ({ id: 'user-1' })) {
  const originalAuthService = require.cache[authServicePath]
  delete require.cache[middlewarePath]
  require.cache[authServicePath] = {
    id: authServicePath,
    filename: authServicePath,
    loaded: true,
    exports: { verifyToken },
  }

  const middleware = require('../src/middleware/aiExecutionRunnerAuthMiddleware')

  return {
    middleware,
    restore() {
      delete require.cache[middlewarePath]
      if (originalAuthService) require.cache[authServicePath] = originalAuthService
      else delete require.cache[authServicePath]
    },
  }
}

function makeReq(headers = {}) {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  )
  return {
    get: (name) => normalizedHeaders[String(name).toLowerCase()],
  }
}

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

async function withAdminKey(value, fn) {
  const original = process.env.AI_EXECUTION_ADMIN_KEY
  if (value === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
  else process.env.AI_EXECUTION_ADMIN_KEY = value

  try {
    return await fn()
  } finally {
    if (original === undefined) delete process.env.AI_EXECUTION_ADMIN_KEY
    else process.env.AI_EXECUTION_ADMIN_KEY = original
  }
}

async function testInternalAdminKeyAccepted() {
  const { middleware, restore } = loadMiddleware()
  const { requireAiExecutionRunnerAuth } = middleware

  try {
    await withAdminKey('internal-smoke-test-key', async () => {
      const req = makeReq({ 'x-ai-execution-key': 'internal-smoke-test-key' })
      const res = makeRes()
      let nextCalled = false
      const originalInfo = console.info
      const logs = []
      console.info = (...args) => logs.push(args.join(' '))

      try {
        await requireAiExecutionRunnerAuth(req, res, () => {
          nextCalled = true
        })
      } finally {
        console.info = originalInfo
      }

      assert.strictEqual(nextCalled, true)
      assert.deepStrictEqual(req.aiExecutionAuth, { type: 'internal_admin_key' })
      assert.strictEqual(res.statusCode, null)
      assert.ok(logs.some((line) => line.includes('[ai-execution-runner] internal admin key accepted')))
    })
  } finally {
    restore()
  }
}

async function testAuthenticatedJwtAccepted() {
  let observedToken = null
  const { middleware, restore } = loadMiddleware(async (token) => {
    observedToken = token
    return { id: 'user-1', email: 'smoke@example.com' }
  })
  const { requireAiExecutionRunnerAuth } = middleware

  try {
    await withAdminKey('internal-smoke-test-key', async () => {
      const req = makeReq({ authorization: 'Bearer valid.jwt' })
      const res = makeRes()
      let nextCalled = false

      await requireAiExecutionRunnerAuth(req, res, () => {
        nextCalled = true
      })

      assert.strictEqual(nextCalled, true)
      assert.strictEqual(observedToken, 'valid.jwt')
      assert.deepStrictEqual(req.user, { id: 'user-1', email: 'smoke@example.com' })
      assert.deepStrictEqual(req.aiExecutionAuth, { type: 'user_jwt' })
      assert.strictEqual(res.statusCode, null)
    })
  } finally {
    restore()
  }
}

async function testInvalidInternalAdminKeyRejectedWithoutJwt() {
  const { middleware, restore } = loadMiddleware(async () => {
    throw new Error('verifyToken should not run without a bearer token')
  })
  const { requireAiExecutionRunnerAuth } = middleware

  try {
    await withAdminKey('internal-smoke-test-key', async () => {
      const req = makeReq({ 'x-ai-execution-key': 'wrong-key' })
      const res = makeRes()
      let nextCalled = false

      await requireAiExecutionRunnerAuth(req, res, () => {
        nextCalled = true
      })

      assert.strictEqual(nextCalled, false)
      assert.strictEqual(res.statusCode, 401)
      assert.deepStrictEqual(res.body, { error: 'Unauthorized' })
    })
  } finally {
    restore()
  }
}

async function testMissingConfiguredKeyRejectedWithoutJwt() {
  const { middleware, restore } = loadMiddleware(async () => {
    throw new Error('verifyToken should not run without a bearer token')
  })
  const { requireAiExecutionRunnerAuth } = middleware

  try {
    await withAdminKey(undefined, async () => {
      const req = makeReq({ 'x-ai-execution-key': 'internal-smoke-test-key' })
      const res = makeRes()
      let nextCalled = false

      await requireAiExecutionRunnerAuth(req, res, () => {
        nextCalled = true
      })

      assert.strictEqual(nextCalled, false)
      assert.strictEqual(res.statusCode, 401)
      assert.deepStrictEqual(res.body, { error: 'Unauthorized' })
    })
  } finally {
    restore()
  }
}

const { middleware, restore } = loadMiddleware()
try {
  assert.strictEqual(middleware._private.safeEquals('same', 'same'), true)
  assert.strictEqual(middleware._private.safeEquals('same', 'different'), false)
  assert.strictEqual(middleware._private.safeEquals('', ''), false)
} finally {
  restore()
}

Promise.resolve()
  .then(testInternalAdminKeyAccepted)
  .then(testAuthenticatedJwtAccepted)
  .then(testInvalidInternalAdminKeyRejectedWithoutJwt)
  .then(testMissingConfiguredKeyRejectedWithoutJwt)
  .then(() => console.log('aiExecutionRunnerAuthMiddleware tests passed'))
