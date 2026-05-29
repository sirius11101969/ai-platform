const aiSequenceService = require('../services/aiSequenceService')
const { runAiSequenceSchedulerOnce } = require('../services/aiSequenceScheduler')

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

async function runSchedulerOnce(req, res, next) {
  try {
    const result = await runAiSequenceSchedulerOnce()
    return res.json({ ok: true, result })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  executeNext,
  runSchedulerOnce
}
