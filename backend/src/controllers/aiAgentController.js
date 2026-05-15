const aiAgentModel = require('../models/aiAgentModel')

function scheduleActionProcessing(actionId) {
  setImmediate(() => {
    aiAgentModel.processAction(actionId).catch((error) => console.error('AI agent action processing failed', error))
  })
}

async function listActions(req, res, next) {
  try {
    const actions = await aiAgentModel.listActions(req.workspace.id, { leadId: req.query.leadId })
    res.json({ actions, costs: aiAgentModel.AGENT_ACTION_COSTS, statuses: aiAgentModel.STATUSES, taskTypes: aiAgentModel.ACTION_TYPES })
  } catch (error) {
    next(error)
  }
}

async function createAction(req, res, next) {
  try {
    const result = await aiAgentModel.createAction(req.user.id, req.workspace.id, req.body)
    scheduleActionProcessing(result.action.id)
    res.status(202).json({ ...result, statuses: aiAgentModel.STATUSES })
  } catch (error) {
    next(error)
  }
}

async function listRuns(req, res, next) {
  try {
    const runs = await aiAgentModel.listRuns(req.workspace.id)
    res.json({ runs })
  } catch (error) {
    next(error)
  }
}

async function metrics(req, res, next) {
  try {
    const metricsData = await aiAgentModel.getMetrics(req.workspace.id)
    res.json({ metrics: metricsData })
  } catch (error) {
    next(error)
  }
}

async function queueInactiveFollowUps(req, res, next) {
  try {
    const queued = await aiAgentModel.queueInactiveFollowUps(req.user.id, req.workspace.id, req.body.inactiveHours || 24)
    queued.forEach((action) => scheduleActionProcessing(action.id))
    res.status(202).json({ queued })
  } catch (error) {
    next(error)
  }
}

module.exports = { createAction, listActions, listRuns, metrics, queueInactiveFollowUps }
