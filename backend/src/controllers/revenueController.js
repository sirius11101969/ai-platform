const revenueService = require('../services/revenueService')

async function overview(req, res, next) {
  try { res.json({ overview: await revenueService.getOverview({ workspaceId: req.workspace.id }) }) } catch (e) { next(e) }
}

async function funnel(req, res, next) {
  try { res.json({ funnel: await revenueService.getFunnel({ workspaceId: req.workspace.id }) }) } catch (e) { next(e) }
}

async function activate(req, res, next) {
  try {
    const { paymentId, credits, lead, plan } = req.body || {}
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' })
    const result = await revenueService.activatePayment({ workspaceId: req.workspace.id, paymentId, credits, lead, plan })
    res.status(200).json(result)
  } catch (e) { next(e) }
}

module.exports = { overview, funnel, activate }
