const assert = require('assert')

const pool = require('../src/db/pool')
const tokenService = require('../src/services/openaiRealtime/realtimeSessionTokenService')
const service = require('../src/services/openaiRealtime/ephemeralSessionService')

async function run() {
  const queries = []
  const fakeClient = {
    async query(sql, params) {
      queries.push({ sql, params })
      if (/RETURNING id/.test(sql)) return { rows: [{ id: '11111111-1111-1111-1111-111111111111' }] }
      return { rows: [] }
    },
    release() {},
  }

  const originalConnect = pool.connect
  const originalFetch = global.fetch
  const env = { ...process.env }
  pool.connect = async () => fakeClient

  try {
    process.env.OPENAI_REALTIME_ENABLED = 'false'
    delete process.env.OPENAI_API_KEY
    const base = await service.createSession({ workspaceId: '00000000-0000-0000-0000-000000000001', userId: 'u1', origin: 'http://localhost:5173' })
    assert.equal(base.providerMode, 'simulation')
    assert.ok(base.id)

    const fetched = service.getSession({ workspaceId: '00000000-0000-0000-0000-000000000001', sessionId: base.id })
    assert.equal(fetched.validSigned, true)

    process.env.OPENAI_REALTIME_ENABLED = 'true'
    delete process.env.OPENAI_API_KEY
    const noKey = await service.createSession({ workspaceId: '00000000-0000-0000-0000-000000000001', userId: 'u1', origin: 'http://localhost:5173' })
    assert.equal(noKey.providerMode, 'simulation')

    process.env.OPENAI_API_KEY = 'sk-test'
    global.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) })
    const providerError = await service.createSession({ workspaceId: '00000000-0000-0000-0000-000000000001', userId: 'u1', origin: 'http://localhost:5173' })
    assert.equal(providerError.providerMode, 'simulation')
    assert.equal(providerError.state, 'provider_error_fallback')

    const refreshed = service.refreshSession({ workspaceId: '00000000-0000-0000-0000-000000000001', sessionId: base.id, replayNonce: 'r1', origin: 'http://localhost:5173' })
    assert.equal(refreshed.state, 'session_refresh')

    const valid = tokenService.validateBrowserToken(base.clientSecret)
    assert.equal(valid.valid, true)

    const sessionInsert = queries.find((q) => q.sql.includes('INSERT INTO ai_openai_realtime_sessions'))
    assert.ok(sessionInsert)
    assert.notEqual(sessionInsert.params[2], base.clientSecret)
    assert.ok(!JSON.stringify(sessionInsert).includes('sk-test'))

    console.log('openaiRealtimeEphemeralSession.test.js passed')
  } finally {
    pool.connect = originalConnect
    global.fetch = originalFetch
    process.env = env
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
