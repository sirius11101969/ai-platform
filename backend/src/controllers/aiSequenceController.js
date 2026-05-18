const service = require('../services/aiSequenceOrchestratorService')

function getWorkspaceId(req) {
  return req.workspace?.id || req.get('x-workspace-id') || req.body?.workspaceId || req.body?.workspace_id || req.query.workspaceId || req.query.workspace_id || null
}

function getLeadSequenceId(body = {}) {
  return body.leadSequenceId || body.lead_sequence_id || body.sequenceId || body.sequence_id || null
}

async function start(req, res, next) {
  try {
    const body = req.body || {}
    const sequence = await service.startSequence({
      workspaceId: getWorkspaceId(req),
      userId: req.user?.id || body.userId || body.user_id || null,
      leadId: body.leadId || body.lead_id,
      templateId: body.templateId || body.template_id || null,
      nextRunAt: body.nextRunAt || body.next_run_at || null,
    })
    res.status(201).json({ sequence })
  } catch (error) {
    next(error)
  }
}

async function pause(req, res, next) {
  try {
    const body = req.body || {}
    const result = await service.pauseSequence({
      workspaceId: getWorkspaceId(req),
      userId: req.user?.id || body.userId || body.user_id || null,
      leadSequenceId: getLeadSequenceId(body),
      leadId: body.leadId || body.lead_id || null,
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function stop(req, res, next) {
  try {
    const body = req.body || {}
    const result = await service.stopSequence({
      workspaceId: getWorkspaceId(req),
      userId: req.user?.id || body.userId || body.user_id || null,
      leadSequenceId: getLeadSequenceId(body),
      leadId: body.leadId || body.lead_id || null,
      reason: body.reason || body.stopReason || body.stop_reason || 'manual_stop',
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function active(req, res, next) {
  try {
    const result = await service.getSequenceDashboard({ workspaceId: getWorkspaceId(req) })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { active, pause, start, stop }
