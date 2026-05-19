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
  pool.connect = async () => fakeClient

  try {
    const base = await service.createSession({ workspaceId: '00000000-0000-0000-0000-000000000001', userId: 'u1', origin: 'http://localhost:5173' })
    assert.ok(base.id)
    const fetched = service.getSession({ workspaceId: '00000000-0000-0000-0000-000000000001', sessionId: base.id })
    assert.equal(fetched.validSigned, true)

    const refreshed = service.refreshSession({ workspaceId: '00000000-0000-0000-0000-000000000001', sessionId: base.id, replayNonce: 'r1', origin: 'http://localhost:5173' })
    assert.equal(refreshed.state, 'session_refresh')
    assert.equal(refreshed.refreshCount, 1)

    let replayBlocked = false
    try { service.refreshSession({ workspaceId: '00000000-0000-0000-0000-000000000001', sessionId: base.id, replayNonce: 'r1', origin: 'http://localhost:5173' }) } catch (_e) { replayBlocked = true }
    assert.equal(replayBlocked, true)

    const valid = tokenService.validateBrowserToken(base.browserToken)
    assert.equal(valid.valid, true)

    const sessionInsert = queries.find((q) => q.sql.includes('INSERT INTO ai_openai_realtime_sessions'))
    assert.ok(sessionInsert, 'expected session insert query')
    assert.equal(sessionInsert.params[1], base.id, 'signed_session_id should equal signed session id')
    assert.notEqual(sessionInsert.params[2], base.browserToken, 'raw browser token must not be stored in DB')

    const eventInserts = queries.filter((q) => q.sql.includes('INSERT INTO ai_openai_realtime_session_events'))
    assert.equal(eventInserts.length, 3, 'expected exactly three persisted events')
    assert.deepEqual(eventInserts.map((q) => q.params[1]), ['session_created', 'negotiation_prepared', 'browser_ready'])

    console.log('openaiRealtimeEphemeralSession.test.js passed')
  } finally {
    pool.connect = originalConnect
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
