const service = require('../services/openaiRealtime/ephemeralSessionService')
const guard = require('../services/openaiRealtime/realtimeAudioSandboxGuard')
const pilotGuard = require('../services/openaiRealtime/realtimeAudioPilotGuard')
const pool = require('../db/pool')

function toResponse(session) {
  return {
    session: {
      id: session.id,
      providerMode: session.providerMode,
      model: session.model,
      voice: session.voice,
      expiresAt: session.expiresAt,
      clientSecret: session.clientSecret,
      simulationMode: session.simulationMode,
      capabilities: session.capabilities,
    },
    safety: {
      noApiKeyExposed: true,
      audioStreamingEnabled: session.providerMode === 'openai',
      browserOnlyAudio: !!session.capabilities?.browserOnlyAudio,
    },
  }
}

async function createEphemeralSession(req, res, next) {
  try {
    const session = await service.createSession({ workspaceId: req.workspace.id, userId: req.user?.id || null, origin: req.get('origin'), transport: req.body?.transport || 'webrtc' })
    res.status(201).json(toResponse(session))
  } catch (error) { next(error) }
}

async function getEphemeralSession(req, res, next) {
  try {
    const session = service.getSession({ workspaceId: req.workspace.id, sessionId: req.params.id })
    if (!session) return res.status(404).json({ error: 'OpenAI realtime session not found' })
    res.json(toResponse(session))
  } catch (error) { next(error) }
}

async function refreshEphemeralSession(req, res, next) {
  try {
    const session = service.refreshSession({ workspaceId: req.workspace.id, sessionId: req.params.id, replayNonce: req.body?.replayNonce, origin: req.get('origin') })
    if (!session) return res.status(404).json({ error: 'OpenAI realtime session not found' })
    res.json(toResponse(session))
  } catch (error) { next(error) }
}



async function persistSandboxEvent({ sessionId, eventType, payload }) {
  const safePayload = { ...(payload || {}), at: new Date().toISOString() }
  if (sessionId) {
    await pool.query('INSERT INTO ai_openai_realtime_session_events (session_id, event_type, payload) VALUES ($1::uuid, $2, $3::jsonb)', [sessionId, eventType, JSON.stringify(safePayload)]).catch(() => null)
    return
  }
  console.info('openai_realtime_audio_sandbox_event', { eventType, payload: safePayload })
}

async function createAudioSandboxSession(req, res, next) {
  try {
    const confirmAudioStreaming = req.body?.confirmAudioStreaming === true
    await persistSandboxEvent({ eventType: 'sandbox_requested', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, confirmAudioStreaming } })

    const eligibility = guard.evaluate({ workspaceId: req.workspace.id, confirmAudioStreaming })
    if (!eligibility.allowed) {
      await persistSandboxEvent({ eventType: 'sandbox_denied', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, reason: eligibility.reason } })
      return res.json({ allowed: false, reason: eligibility.reason, session: null, providerMode: 'simulation', model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview', voice: process.env.OPENAI_REALTIME_VOICE || 'alloy', safety: { ...eligibility.safety, apiKeyExposed: false, simulationFallback: true } })
    }

    const session = await service.createSession({ workspaceId: req.workspace.id, userId: req.user?.id || null, origin: req.get('origin'), transport: 'webrtc' })
    await persistSandboxEvent({ sessionId: session.dbSessionId, eventType: 'sandbox_allowed', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, providerMode: session.providerMode } })
    return res.status(201).json({
      allowed: true,
      reason: eligibility.reason,
      session: { id: session.id, expiresAt: session.expiresAt, capabilities: session.capabilities },
      providerMode: session.providerMode,
      model: session.model,
      voice: session.voice,
      safety: { ...eligibility.safety, apiKeyExposed: false, canStopAnytime: true },
    })
  } catch (error) { next(error) }
}

async function stopAudioSandboxSession(req, res, next) {
  try {
    const session = service.getSession({ workspaceId: req.workspace.id, sessionId: req.params.id })
    await persistSandboxEvent({ sessionId: session?.dbSessionId, eventType: 'sandbox_stopped', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, sessionId: req.params.id } })
    return res.json({ stopped: true })
  } catch (error) { next(error) }
}



async function persistPilotEvent({ sessionId, eventType, payload }) {
  const safePayload = { ...(payload || {}), at: new Date().toISOString() }
  if (sessionId) {
    await pool.query('INSERT INTO ai_openai_realtime_session_events (session_id, event_type, payload) VALUES ($1::uuid, $2, $3::jsonb)', [sessionId, eventType, JSON.stringify(safePayload)]).catch(() => null)
    return
  }
  console.info('openai_realtime_audio_pilot_event', { eventType, payload: safePayload })
}

async function createAudioPilotSession(req, res, next) {
  try {
    const confirmAudioStreaming = req.body?.confirmAudioStreaming === true
    await persistPilotEvent({ eventType: 'pilot_requested', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, confirmAudioStreaming } })

    const eligibility = pilotGuard.evaluate({ workspaceId: req.workspace.id, confirmAudioStreaming })
    if (!eligibility.allowed) {
      await persistPilotEvent({ eventType: 'pilot_denied', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, reason: eligibility.reason } })
      return res.json({ allowed: false, reason: eligibility.reason, session: null, providerMode: 'simulation', model: process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview', voice: process.env.OPENAI_REALTIME_VOICE || 'alloy', maxSessionSeconds: Number(process.env.OPENAI_REALTIME_AUDIO_MAX_SESSION_SECONDS || 180), safety: { ...eligibility.safety, apiKeyExposed: false, disconnectAnytime: true } })
    }

    const session = await service.createSession({ workspaceId: req.workspace.id, userId: req.user?.id || null, origin: req.get('origin'), transport: 'webrtc' })
    await persistPilotEvent({ sessionId: session.dbSessionId, eventType: 'pilot_allowed', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, providerMode: session.providerMode } })
    return res.status(201).json({
      allowed: true,
      reason: eligibility.reason,
      session: { id: session.id, expiresAt: session.expiresAt, capabilities: session.capabilities },
      providerMode: session.providerMode,
      model: session.model,
      voice: session.voice,
      maxSessionSeconds: Number(process.env.OPENAI_REALTIME_AUDIO_MAX_SESSION_SECONDS || 180),
      safety: { ...eligibility.safety, apiKeyExposed: false, disconnectAnytime: true },
    })
  } catch (error) { next(error) }
}

async function stopAudioPilotSession(req, res, next) {
  try {
    const session = service.getSession({ workspaceId: req.workspace.id, sessionId: req.params.id })
    await persistPilotEvent({ sessionId: session?.dbSessionId, eventType: 'pilot_disconnected', payload: { workspaceId: req.workspace.id, userId: req.user?.id || null, sessionId: req.params.id } })
    return res.json({ stopped: true })
  } catch (error) { next(error) }
}

module.exports = { createEphemeralSession, getEphemeralSession, refreshEphemeralSession, createAudioSandboxSession, stopAudioSandboxSession, createAudioPilotSession, stopAudioPilotSession }
