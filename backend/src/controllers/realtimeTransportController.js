const realtimeTransportGateway = require('../services/realtimeTransport/realtimeTransportGateway')

async function createSession(req, res, next) {
  try {
    const session = await realtimeTransportGateway.startSimulation({
      workspaceId: req.workspace.id,
      leadId: req.body?.leadId || req.body?.lead_id || null,
    })
    res.status(201).json({ session, safety: { simulationMode: true, microphoneStreaming: false, webRtcMediaCapture: false, openaiAudioStreaming: false } })
  } catch (error) {
    next(error)
  }
}

async function listSessions(req, res, next) {
  try {
    const sessions = await realtimeTransportGateway.listSessions({ workspaceId: req.workspace.id })
    res.json({ sessions, safety: { simulationMode: true, microphoneStreaming: false, webRtcMediaCapture: false, openaiAudioStreaming: false } })
  } catch (error) {
    next(error)
  }
}

async function getSession(req, res, next) {
  try {
    const session = await realtimeTransportGateway.getSession({ workspaceId: req.workspace.id, sessionId: req.params.id })
    if (!session) return res.status(404).json({ error: 'Realtime transport session not found' })
    return res.json({ session, safety: { simulationMode: true, microphoneStreaming: false, webRtcMediaCapture: false, openaiAudioStreaming: false } })
  } catch (error) {
    next(error)
  }
}

module.exports = { createSession, listSessions, getSession }
