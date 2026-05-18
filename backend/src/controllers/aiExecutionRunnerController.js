const aiExecutionRunnerService = require('../services/execution/aiExecutionRunnerService')
const autonomousExecutionLoop = require('../services/execution/autonomousExecutionLoop')

function getQueueName(req) {
  const body = req.body || {}
  return req.query.queueName || req.query.queue_name || body.queueName || body.queue_name || undefined
}

async function health(req, res, next) {
  try {
    const result = await aiExecutionRunnerService.getHealth({ queueName: req.query.queueName || req.query.queue_name || null })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function enqueueTest(req, res, next) {
  try {
    const job = await aiExecutionRunnerService.enqueueInternalTestJob({
      queueName: getQueueName(req),
      priority: (req.body || {}).priority,
      payload: (req.body || {}).payload || {},
      idempotencyKey: (req.body || {}).idempotencyKey || (req.body || {}).idempotency_key || null,
    })
    res.status(201).json({ job })
  } catch (error) {
    next(error)
  }
}

async function enqueueOpenAiTest(req, res, next) {
  try {
    const body = req.body || {}
    const job = await aiExecutionRunnerService.enqueueOpenAiTextGenerationJob({
      queueName: getQueueName(req),
      priority: body.priority,
      payload: body,
      idempotencyKey: body.idempotencyKey || body.idempotency_key || null,
    })
    res.status(201).json({ job })
  } catch (error) {
    next(error)
  }
}


async function enqueueSalesFollowup(req, res, next) {
  try {
    const body = req.body || {}
    const job = await aiExecutionRunnerService.enqueueSalesFollowupGenerationJob({
      queueName: getQueueName(req),
      priority: body.priority,
      payload: {
        leadId: body.leadId || body.lead_id,
        channel: body.channel,
        tone: body.tone || 'professional',
        language: body.language || 'ru',
        model: body.model,
        maxAttempts: body.maxAttempts || body.max_attempts,
      },
      workspaceId: body.workspaceId || body.workspace_id || req.get('x-workspace-id') || null,
      userId: req.user?.id || body.userId || body.user_id || null,
      idempotencyKey: body.idempotencyKey || body.idempotency_key || null,
    })
    res.status(201).json({ job })
  } catch (error) {
    next(error)
  }
}

async function liveStatus(req, res, next) {
  try {
    const result = await autonomousExecutionLoop.getLiveStatus({
      queueName: req.query.queueName || req.query.queue_name || null,
      loop: autonomousExecutionLoop.getAutonomousExecutionLoop(),
    })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function runOnce(req, res, next) {
  try {
    const result = await aiExecutionRunnerService.runOnce({ queueName: getQueueName(req) })
    return res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { enqueueOpenAiTest, enqueueSalesFollowup, enqueueTest, health, liveStatus, runOnce }
