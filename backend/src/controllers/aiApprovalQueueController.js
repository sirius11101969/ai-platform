const service = require('../services/aiApprovalQueueService')

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
    console.info('[ai-workers-api] execute requested', { actionId: req.params.id, actionType: context.actionType })
    res.json(await service.executeQueueItem(req.user.id, req.workspace.id, req.params.id))
  } catch (error) { next(error) }
}

module.exports = { approve, execute, list, reject, update }
