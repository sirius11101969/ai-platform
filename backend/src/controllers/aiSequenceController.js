const aiSequenceService = require('../services/aiSequenceService')
const pool = require('../db/pool')
const { runAiSequenceSchedulerOnce } = require('../services/aiSequenceScheduler')


async function startSequence(req, res, next) {
  try {
    const workspaceId = String(req.body?.workspaceId || req.query.workspaceId || req.workspace?.id || '').trim()
    const leadId = String(req.body?.leadId || req.query.leadId || '').trim()
    const templateName = String(req.body?.templateName || req.query.templateName || aiSequenceService.DEFAULT_TEMPLATE || '').trim()
    const metadata = req.body?.metadata || {}

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId required' })
    }

    if (!leadId) {
      return res.status(400).json({ error: 'leadId required' })
    }

    const result = await aiSequenceService.startSequence({
      workspaceId,
      leadId,
      templateName,
      metadata: {
        ...metadata,
        source: metadata.source || 'crm_ai_sequence_button'
      }
    })

    return res.json({
      ok: true,
      result
    })
  } catch (error) {
    next(error)
  }
}

async function executeNext(req, res, next) {
  try {
    const workspaceId = String(req.body?.workspaceId || req.query.workspaceId || '').trim()
    const leadId = String(req.params.leadId || req.body?.leadId || req.query.leadId || '').trim()

    if (!workspaceId) {
      return res.status(400).json({ error: 'workspaceId required' })
    }

    if (!leadId) {
      return res.status(400).json({ error: 'leadId required' })
    }

    const result = await aiSequenceService.executeNextStep({
      workspaceId,
      leadId
    })

    return res.json({
      ok: true,
      result
    })
  } catch (error) {
    next(error)
  }
}

async function getActiveSequences(req, res, next) {
  try {
    const workspaceId = String(req.workspace?.id || req.query.workspaceId || '').trim()

    if (!workspaceId) {
      return res.json({ activeSequences: [], sequences: [] })
    }

    const result = await pool.query(`
      SELECT
        s.id,
        s.workspace_id,
        s.lead_id,
        s.status,
        s.current_step,
        s.template_name,
        s.started_at,
        s.completed_at,
        s.paused_at,
        s.metadata,
        l.name AS lead_name,
        l.email AS lead_email,
        l.status AS lead_status,
        l.stage AS lead_stage
      FROM ai_sequences s
      LEFT JOIN crm_leads l ON l.id = s.lead_id
      WHERE s.workspace_id = $1::uuid
        AND s.status = 'active'
      ORDER BY s.started_at DESC
      LIMIT 50
    `, [workspaceId])

    const sequences = result.rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      leadId: row.lead_id,
      leadName: row.lead_name,
      leadEmail: row.lead_email,
      leadStatus: row.lead_status,
      leadStage: row.lead_stage,
      status: row.status,
      currentStep: row.current_step,
      templateName: row.template_name,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      pausedAt: row.paused_at,
      metadata: row.metadata || {}
    }))

    return res.json({
      ok: true,
      activeSequences: sequences,
      sequences
    })
  } catch (error) {
    next(error)
  }
}

async function runSchedulerOnce(req, res, next) {
  try {
    const result = await runAiSequenceSchedulerOnce()
    return res.json({ ok: true, result })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  startSequence,
  executeNext,
  getActiveSequences,
  runSchedulerOnce
}
