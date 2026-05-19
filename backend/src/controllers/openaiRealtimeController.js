const service = require('../services/openaiRealtime/ephemeralSessionService')

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

module.exports = { createEphemeralSession, getEphemeralSession, refreshEphemeralSession }
