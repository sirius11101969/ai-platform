const aiExecutionRunnerService = require('../services/execution/aiExecutionRunnerService')

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

async function runOnce(req, res, next) {
  try {
    const result = await aiExecutionRunnerService.runOnce({ queueName: getQueueName(req) })
    return res.json(result)
  } catch (error) {
    next(error)
  }
}

module.exports = { enqueueTest, health, runOnce }
