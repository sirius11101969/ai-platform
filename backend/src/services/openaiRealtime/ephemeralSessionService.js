const crypto = require('crypto')
const registry = require('./realtimeBrowserSessionRegistry')
const security = require('./realtimeSecurityManager')
const tokens = require('./realtimeSessionTokenService')
const pool = require('../../db/pool')

const SESSION_TTL_SECONDS = Number(process.env.REALTIME_EPHEMERAL_SESSION_TTL || 180)



function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

function buildSafeSessionMetadata({ userId, capabilities, tokenIssuedAt }) {
  return { userId: userId || null, capabilities, tokenIssuedAt }
}

async function persistSessionAndEvents(session) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const insertSession = await client.query(
      `INSERT INTO ai_openai_realtime_sessions (workspace_id, signed_session_id, browser_token_hash, state, transport, reconnect_count, refresh_count, expires_at, session_metadata, metrics)
       VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::jsonb, $10::jsonb)
       RETURNING id`,
      [
        session.workspaceId,
        session.id,
        hashToken(session.browserToken),
        session.state,
        session.transport,
        session.reconnectCount || 0,
        session.refreshCount || 0,
        session.expiresAt,
        JSON.stringify(buildSafeSessionMetadata({ userId: session.userId, capabilities: session.capabilities, tokenIssuedAt: session.tokenIssuedAt })),
        JSON.stringify(session.metrics || {}),
      ]
    )
    const dbSessionId = insertSession.rows[0].id
    const eventRows = [
      ['session_created', { at: session.createdAt }],
      ['negotiation_prepared', { transport: session.transport }],
      ['browser_ready', { capabilities: session.capabilities }],
    ]
    for (const [eventType, payload] of eventRows) {
      await client.query(
        'INSERT INTO ai_openai_realtime_session_events (session_id, event_type, payload) VALUES ($1::uuid, $2, $3::jsonb)',
        [dbSessionId, eventType, JSON.stringify(payload)]
      )
    }
    await client.query('COMMIT')
    console.info('openai_realtime_ephemeral_session_persisted', { workspaceId: session.workspaceId, signedSessionId: session.id, sessionDbId: dbSessionId, eventCount: eventRows.length })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

function capabilities() {
  return { simulationMode: true, openaiRealtimeEnabled: false, browserOnlyAudio: true, supportsWebRtcNegotiation: true, supportsSseFallback: true }
}

async function createSession({ workspaceId, userId, origin, transport = 'webrtc' }) {
  if (!security.validateOrigin(origin)) throw Object.assign(new Error('Origin not allowed for realtime session'), { statusCode: 403 })
  const createdAt = new Date().toISOString()
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const id = security.createSignedSessionId({ workspaceId, nonce, createdAt })
  const browserToken = tokens.mintBrowserToken({ sessionId: id, workspaceId, ttlSeconds: SESSION_TTL_SECONDS })
  const session = registry.create({
    id, workspaceId, userId, createdAt, expiresAt: new Date(browserToken.expiresAt * 1000).toISOString(),
    transport, state: 'session_created', reconnectCount: 0, refreshCount: 0, events: [{ state: 'session_created', at: createdAt }],
    capabilities: capabilities(), tokenIssuedAt: browserToken.issuedAt, browserToken: browserToken.token,
    metrics: { transportLatencyMs: 0, browserCapabilities: { microphone: 'local_only', webRtc: 'prepared', sse: 'ready' } }
  })
  await persistSessionAndEvents(session)
  return session
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

module.exports = { createSession, getSession, refreshSession, hashToken, buildSafeSessionMetadata }
