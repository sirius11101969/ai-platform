const realtimeVoiceSessionManager = require('../services/realtimeVoice/realtimeVoiceSessionManager')

async function createSession(req, res, next) {
  try {
    const session = await realtimeVoiceSessionManager.createRealtimeVoiceSession({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      leadId: req.body?.leadId || req.body?.lead_id,
      callId: req.body?.callId || req.body?.call_id || null,
      transport: 'mock_stream',
      provider: 'mock_realtime_provider',
      metadata: { requestedBy: req.user.id, api: 'POST /api/ai/realtime-voice/session', simulationMode: true, noRealTelephony: true, noMicrophoneStreaming: true },
      autoRun: req.body?.autoRun !== false,
    })
    res.status(201).json({ session, safety: { simulationMode: true, telephonyTrafficSent: false, microphoneStreaming: false } })
  } catch (error) {
    next(error)
  }
}

async function listSessions(req, res, next) {
  try {
    const sessions = await realtimeVoiceSessionManager.listRealtimeVoiceSessions({ workspaceId: req.workspace.id, status: req.query?.status, limit: req.query?.limit })
    res.json({ sessions, safety: { simulationMode: true, telephonyTrafficSent: false, microphoneStreaming: false } })
  } catch (error) {
    next(error)
  }
}

async function getSession(req, res, next) {
  try {
    const session = await realtimeVoiceSessionManager.getRealtimeVoiceSession({ workspaceId: req.workspace.id, sessionId: req.params.id })
    res.json({ session, safety: { simulationMode: true, telephonyTrafficSent: false, microphoneStreaming: false } })
  } catch (error) {
    next(error)
  }
}

module.exports = { createSession, listSessions, getSession }
