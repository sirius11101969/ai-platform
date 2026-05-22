const revenueService = require('../services/revenueService')

async function overview(req, res, next) {
  try {
    console.info('revenue_overview_loaded', { workspaceId: req.workspace.id, authMode: req.aiControl?.authMode || 'jwt' })
    res.json({ overview: await revenueService.getOverview({ workspaceId: req.workspace.id }) })
  } catch (e) { next(e) }
}

async function funnel(req, res, next) {
  try {
    console.info('revenue_funnel_loaded', { workspaceId: req.workspace.id, authMode: req.aiControl?.authMode || 'jwt' })
    res.json({ funnel: await revenueService.getFunnel({ workspaceId: req.workspace.id }) })
  } catch (e) { next(e) }
}

async function activate(req, res, next) {
  try {
    const { paymentId, credits, lead, plan } = req.body || {}
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' })
    const result = await revenueService.activatePayment({ workspaceId: req.workspace.id, paymentId, credits, lead, plan })
    res.status(200).json(result)
  } catch (e) { next(e) }
}

async function startCheckout(req, res, next) {
  try {
    const { workspaceId, plan, amount, currency } = req.body || {}
    const result = await revenueService.startCheckout({
      workspaceId: workspaceId || req.workspace.id,
      plan,
      amount,
      currency,
    })
    res.status(200).json(result)
  } catch (e) { next(e) }
}




async function createPaymentPending(req, res, next) {
  try {
    const { workspaceId, checkoutId, plan } = req.body || {}
    if (!checkoutId) return res.status(400).json({ error: 'checkoutId is required' })
    const result = await revenueService.createPendingOrder({ workspaceId: workspaceId || req.workspace.id, checkoutId, plan })
    res.status(200).json({
      orderId: result.order.id,
      status: 'payment_pending',
      paymentUrl: `/dashboard/revenue?order=pending&checkout=${encodeURIComponent(checkoutId)}` ,
      createdAt: result.order.created_at,
      deduped: result.deduped,
    })
  } catch (e) { next(e) }
}

async function pendingOrders(req, res, next) {
  try {
    const orders = await revenueService.getPendingOrders({ workspaceId: req.workspace.id })
    res.json({ orders })
  } catch (e) { next(e) }
}

module.exports = { overview, funnel, activate, startCheckout, createPaymentPending, pendingOrders }
