const paymentService = require('../services/paymentService')

async function create(req, res, next) {
  try {
    const { provider, amount, currency, metadata } = req.body || {}
    const result = await paymentService.createPayment({ workspaceId: req.workspace.id, provider, amount, currency, metadata })
    res.status(200).json(result)
  } catch (e) { next(e) }
}

async function webhook(req, res, next) {
  try {
    const { provider, externalPaymentId, status, amount, currency, metadata } = req.body || {}
    const result = await paymentService.processWebhook({ workspaceId: req.workspace.id, provider, externalPaymentId, status, amount, currency, metadata })
    res.status(200).json(result)
  } catch (e) { next(e) }
}

async function status(req, res, next) {
  try {
    const payment = await paymentService.getPaymentStatus({ workspaceId: req.workspace.id })
    res.status(200).json({ payment })
  } catch (e) { next(e) }
}

async function dashboard(req, res, next) {
  try {
    const data = await paymentService.getDashboard({ workspaceId: req.workspace.id })
    res.status(200).json(data)
  } catch (e) { next(e) }
}

module.exports = { create, webhook, status, dashboard }
