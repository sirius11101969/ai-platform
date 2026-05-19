const service = require('../services/openaiRealtime/ephemeralSessionService')

const safety = { simulationMode: true, noAudioSentToOpenAi: true, browserOnlyAudio: true, secureRealtimeSession: true }

async function createEphemeralSession(req, res, next) {
  try {
    const session = service.createSession({ workspaceId: req.workspace.id, userId: req.user?.id || null, origin: req.get('origin'), transport: req.body?.transport || 'webrtc' })
    res.status(201).json({ session, safety })
  } catch (error) { next(error) }
}

async function getEphemeralSession(req, res, next) {
  try {
    const session = service.getSession({ workspaceId: req.workspace.id, sessionId: req.params.id })
    if (!session) return res.status(404).json({ error: 'OpenAI realtime session not found' })
    res.json({ session, safety })
  } catch (error) { next(error) }
}

async function refreshEphemeralSession(req, res, next) {
  try {
    const session = service.refreshSession({ workspaceId: req.workspace.id, sessionId: req.params.id, replayNonce: req.body?.replayNonce, origin: req.get('origin') })
    if (!session) return res.status(404).json({ error: 'OpenAI realtime session not found' })
    res.json({ session, safety })
  } catch (error) { next(error) }
}

module.exports = { createEphemeralSession, getEphemeralSession, refreshEphemeralSession }
