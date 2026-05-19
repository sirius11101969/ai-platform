const crypto = require('crypto')
const registry = require('./realtimeBrowserSessionRegistry')
const security = require('./realtimeSecurityManager')
const tokens = require('./realtimeSessionTokenService')
const pool = require('../../db/pool')

const SESSION_TTL_SECONDS = Number(process.env.REALTIME_EPHEMERAL_SESSION_TTL || 180)
const OPENAI_REALTIME_API_URL = 'https://api.openai.com/v1/realtime/sessions'

function isOpenAiRealtimeEnabled() {
  return String(process.env.OPENAI_REALTIME_ENABLED || '').toLowerCase() === 'true'
}

function isRealtimeAudioPilotEnabled() {
  return String(process.env.OPENAI_REALTIME_AUDIO_PILOT_ENABLED || '').toLowerCase() === 'true'
}

function defaultModel() {
  return process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview'
}

function defaultVoice() {
  return process.env.OPENAI_REALTIME_VOICE || 'alloy'
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex')
}

function buildSafeSessionMetadata({ userId, capabilities, tokenIssuedAt, providerMode, model, voice, providerError }) {
  return { userId: userId || null, capabilities, tokenIssuedAt, providerMode, model, voice, providerError: providerError || null }
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
        hashToken(session.clientSecret),
        session.state,
        session.transport,
        session.reconnectCount || 0,
        session.refreshCount || 0,
        session.expiresAt,
        JSON.stringify(buildSafeSessionMetadata({ userId: session.userId, capabilities: session.capabilities, tokenIssuedAt: session.tokenIssuedAt, providerMode: session.providerMode, model: session.model, voice: session.voice, providerError: session.providerError })),
        JSON.stringify(session.metrics || {}),
      ]
    )
    const dbSessionId = insertSession.rows[0].id
    const eventRows = [
      ['session_created', { at: session.createdAt, providerMode: session.providerMode }],
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
    return dbSessionId
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

function buildCapabilities({ simulationMode, pilotEnabled }) {
  return { simulationMode, pilotEnabled, openaiRealtimeEnabled: isOpenAiRealtimeEnabled(), browserOnlyAudio: true, supportsWebRtcNegotiation: true, supportsSseFallback: true }
}

async function createProviderSession({ model, voice }) {
  const resp = await fetch(OPENAI_REALTIME_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, voice }),
  })
  if (!resp.ok) throw new Error(`openai_realtime_session_failed:${resp.status}`)
  const data = await resp.json()
  const clientSecret = data?.client_secret?.value
  if (!data?.id || !clientSecret) throw new Error('openai_realtime_session_invalid_response')
  return { id: data.id, clientSecret, expiresAt: data.expires_at ? new Date(data.expires_at * 1000).toISOString() : new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString() }
}

function buildSimulationToken({ sessionId, workspaceId }) {
  const browserToken = tokens.mintBrowserToken({ sessionId, workspaceId, ttlSeconds: SESSION_TTL_SECONDS })
  return { clientSecret: browserToken.token, tokenIssuedAt: browserToken.issuedAt, expiresAt: new Date(browserToken.expiresAt * 1000).toISOString() }
}

async function createSession({ workspaceId, userId, origin, transport = 'webrtc' }) {
  if (!security.validateOrigin(origin)) throw Object.assign(new Error('Origin not allowed for realtime session'), { statusCode: 403 })
  const createdAt = new Date().toISOString()
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const id = security.createSignedSessionId({ workspaceId, nonce, createdAt })
  const model = defaultModel()
  const voice = defaultVoice()
  let providerMode = 'simulation'
  let simulationMode = true
  let providerError = null
  let providerSessionId = null

  let tokenPayload = buildSimulationToken({ sessionId: id, workspaceId })
  const pilotEnabled = isRealtimeAudioPilotEnabled()

  if (isOpenAiRealtimeEnabled() && pilotEnabled && process.env.OPENAI_API_KEY) {
    try {
      const provider = await createProviderSession({ model, voice })
      providerMode = 'openai'
      simulationMode = false
      providerSessionId = provider.id
      tokenPayload = { clientSecret: provider.clientSecret, tokenIssuedAt: Math.floor(Date.now() / 1000), expiresAt: provider.expiresAt }
    } catch (error) {
      providerError = error.message
      console.warn('openai_realtime_ephemeral_provider_error', { workspaceId, error: error.message })
    }
  }

  const session = registry.create({
    id,
    workspaceId,
    userId,
    createdAt,
    expiresAt: tokenPayload.expiresAt,
    transport,
    state: providerError ? 'provider_error_fallback' : (providerMode === 'openai' ? 'pilot_connecting' : 'session_created'),
    reconnectCount: 0,
    refreshCount: 0,
    events: [{ state: 'session_created', at: createdAt }],
    capabilities: buildCapabilities({ simulationMode, pilotEnabled }),
    tokenIssuedAt: tokenPayload.tokenIssuedAt,
    clientSecret: tokenPayload.clientSecret,
    model,
    voice,
    providerMode,
    providerSessionId,
    providerError,
    simulationMode,
    metrics: { transportLatencyMs: 0, providerConnectionState: providerMode === 'openai' ? 'pilot_connecting' : 'simulation', browserCapabilities: { microphone: 'local_only', webRtc: 'prepared', sse: 'ready' } },
  })
  const dbSessionId = await persistSessionAndEvents(session)
  return { ...session, dbSessionId }
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
    clientSecret: browserToken.token,
    tokenIssuedAt: browserToken.issuedAt,
    expiresAt: new Date(browserToken.expiresAt * 1000).toISOString(),
    refreshCount: (session.refreshCount || 0) + 1,
    state: 'session_refresh',
    providerMode: 'simulation',
    simulationMode: true,
    events: [...(session.events || []), { state: 'session_refresh', at: new Date().toISOString() }],
  })
}

module.exports = { createSession, getSession, refreshSession, hashToken, buildSafeSessionMetadata }
