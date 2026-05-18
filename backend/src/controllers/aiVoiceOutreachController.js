const voiceOutreachService = require('../services/voiceOutreachService')

async function createCall(req, res, next) {
  try {
    const call = await voiceOutreachService.initiateCall({
      workspaceId: req.workspace.id,
      userId: req.user.id,
      leadId: req.body?.leadId || req.body?.lead_id,
      sequenceId: req.body?.sequenceId || req.body?.sequence_id || null,
      phoneNumber: req.body?.phoneNumber || req.body?.phone_number || null,
      provider: 'mock_provider',
      metadata: { requestedBy: req.user.id, api: 'POST /api/ai/voice/call', mockMode: true },
      autoComplete: req.body?.autoComplete !== false,
    })
    res.status(201).json({ call, safety: { mockMode: true, telephonyTrafficSent: false } })
  } catch (error) {
    next(error)
  }
}

async function listCalls(req, res, next) {
  try {
    const calls = await voiceOutreachService.getCalls({ workspaceId: req.workspace.id, status: req.query?.status, limit: req.query?.limit })
    res.json({ calls, safety: { mockMode: true, telephonyTrafficSent: false } })
  } catch (error) {
    next(error)
  }
}

async function getCall(req, res, next) {
  try {
    const call = await voiceOutreachService.getCall({ workspaceId: req.workspace.id, callId: req.params.id })
    res.json({ call, safety: { mockMode: true, telephonyTrafficSent: false } })
  } catch (error) {
    next(error)
  }
}

module.exports = { createCall, getCall, listCalls }
