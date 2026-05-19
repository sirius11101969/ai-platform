const assert = require('assert')
const service = require('../src/services/openaiRealtime/ephemeralSessionService')
const tokenService = require('../src/services/openaiRealtime/realtimeSessionTokenService')

function run() {
  const base = service.createSession({ workspaceId: 'w1', userId: 'u1', origin: 'http://localhost:5173' })
  assert.ok(base.id)
  const fetched = service.getSession({ workspaceId: 'w1', sessionId: base.id })
  assert.equal(fetched.validSigned, true)

  const refreshed = service.refreshSession({ workspaceId: 'w1', sessionId: base.id, replayNonce: 'r1', origin: 'http://localhost:5173' })
  assert.equal(refreshed.state, 'session_refresh')
  assert.equal(refreshed.refreshCount, 1)

  let replayBlocked = false
  try { service.refreshSession({ workspaceId: 'w1', sessionId: base.id, replayNonce: 'r1', origin: 'http://localhost:5173' }) } catch (_e) { replayBlocked = true }
  assert.equal(replayBlocked, true)

  const valid = tokenService.validateBrowserToken(base.browserToken)
  assert.equal(valid.valid, true)

  console.log('openaiRealtimeEphemeralSession.test.js passed')
}

run()
