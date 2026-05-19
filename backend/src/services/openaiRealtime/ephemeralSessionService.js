const crypto = require('crypto')
const registry = require('./realtimeBrowserSessionRegistry')
const security = require('./realtimeSecurityManager')
const tokens = require('./realtimeSessionTokenService')

const SESSION_TTL_SECONDS = Number(process.env.REALTIME_EPHEMERAL_SESSION_TTL || 180)

function capabilities() {
  return { simulationMode: true, openaiRealtimeEnabled: false, browserOnlyAudio: true, supportsWebRtcNegotiation: true, supportsSseFallback: true }
}

function createSession({ workspaceId, userId, origin, transport = 'webrtc' }) {
  if (!security.validateOrigin(origin)) throw Object.assign(new Error('Origin not allowed for realtime session'), { statusCode: 403 })
  const createdAt = new Date().toISOString()
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const id = security.createSignedSessionId({ workspaceId, nonce, createdAt })
  const browserToken = tokens.mintBrowserToken({ sessionId: id, workspaceId, ttlSeconds: SESSION_TTL_SECONDS })
  return registry.create({
    id, workspaceId, userId, createdAt, expiresAt: new Date(browserToken.expiresAt * 1000).toISOString(),
    transport, state: 'session_created', reconnectCount: 0, refreshCount: 0, events: [{ state: 'session_created', at: createdAt }],
    capabilities: capabilities(), tokenIssuedAt: browserToken.issuedAt, browserToken: browserToken.token,
    metrics: { transportLatencyMs: 0, browserCapabilities: { microphone: 'local_only', webRtc: 'prepared', sse: 'ready' } }
  })
}

function getSession({ workspaceId, sessionId }) {
  const session = registry.get(sessionId)
  if (!session || session.workspaceId !== workspaceId) return null
  const validSigned = security.verifySignedSessionId({ sessionId: session.id, workspaceId: session.workspaceId, createdAt: session.createdAt })
  const expired = new Date(session.expiresAt).getTime() <= Date.now()
  return { ...session, validSigned, expired }
}

function refreshSession({ workspaceId, sessionId, replayNonce, origin }) {
  const session = getSession({ workspaceId, sessionId })
  if (!session) return null
  if (!security.validateOrigin(origin)) throw Object.assign(new Error('Origin not allowed for realtime session'), { statusCode: 403 })
  if (!registry.consumeReplayNonce(replayNonce)) throw Object.assign(new Error('Replay nonce already used'), { statusCode: 409 })
  registry.markReplayNonce(sessionId, replayNonce)
  const browserToken = tokens.mintBrowserToken({ sessionId, workspaceId, ttlSeconds: SESSION_TTL_SECONDS })
  return registry.update(sessionId, {
    browserToken: browserToken.token,
    tokenIssuedAt: browserToken.issuedAt,
    expiresAt: new Date(browserToken.expiresAt * 1000).toISOString(),
    refreshCount: (session.refreshCount || 0) + 1,
    state: 'session_refresh',
    events: [...(session.events || []), { state: 'session_refresh', at: new Date().toISOString() }],
  })
}

module.exports = { createSession, getSession, refreshSession }
