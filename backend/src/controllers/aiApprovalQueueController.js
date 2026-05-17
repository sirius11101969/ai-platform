const service = require('../services/aiApprovalQueueService')

async function focusSummary(req, res, next) {
  try {
    const metrics = await service.getFocusSummary(req.user.id, req.workspace.id, { leadId: req.query.leadId, actionId: req.query.actionId })
    res.json(metrics)
  } catch (error) { next(error) }
}

async function list(req, res, next) {
  try {
    const [items, metrics] = await Promise.all([
      service.listQueue(req.user.id, req.workspace.id, { leadId: req.query.leadId, status: req.query.status }),
      service.getMetrics(req.user.id, req.workspace.id),
    ])
    res.json({ items, metrics })
  } catch (error) { next(error) }
}

async function approve(req, res, next) {
  try { res.json({ item: await service.approveQueueItem(req.user.id, req.workspace.id, req.params.id) }) } catch (error) { next(error) }
}

async function reject(req, res, next) {
  try { res.json({ item: await service.rejectQueueItem(req.user.id, req.workspace.id, req.params.id) }) } catch (error) { next(error) }
}

async function update(req, res, next) {
  try { res.json({ item: await service.updateQueueItem(req.user.id, req.workspace.id, req.params.id, req.body) }) } catch (error) { next(error) }
}

async function execute(req, res, next) {
  try {
    const context = await service.getQueueItemLogContext(req.user.id, req.workspace.id, req.params.id)
    console.info('[ai-workers-api] execute route hit', { actionId: req.params.id, actionType: context.actionType })
    res.json(await service.executeQueueItem(req.user.id, req.workspace.id, req.params.id))
  } catch (error) { next(error) }
}

async function send(req, res, next) {
  try {
    console.info('[ai-workers-api] send route hit', { actionId: req.params.id })
    const result = await service.executeQueueItem(req.user.id, req.workspace.id, req.params.id)
    res.json({ success: Boolean(result.success), status: result.status || (result.success ? 'completed' : 'failed'), actionId: result.actionId, item: result.item, error: result.error })
  } catch (error) { next(error) }
}

module.exports = { approve, execute, focusSummary, list, reject, send, update }
