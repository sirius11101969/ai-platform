const paymentService = require('../services/paymentService')

async function create(req, res, next) {
  try {
    const { provider, amount, currency, metadata, plan } = req.body || {}
    const mergedMetadata = { ...(metadata || {}) }
    if (plan) mergedMetadata.plan = String(plan).toLowerCase()

    const result = await paymentService.createPayment({
      workspaceId: req.workspace.id,
      provider,
      amount,
      currency,
      metadata: mergedMetadata,
    })
    res.status(200).json(result)
  } catch (e) { next(e) }
}

async function webhook(req, res, next) {
  try {
    const body = req.body || {}
    const provider = body.provider || 'yookassa'
    const event = body.event || body.event_type
    const object = body.object || {}

    const externalPaymentId = body.externalPaymentId || body.external_payment_id || object.id
    const rawStatus = body.status || object.status
    const status = body.status ||
      (event === 'payment.succeeded' ? 'paid' : undefined) ||
      (rawStatus === 'succeeded' ? 'paid' : rawStatus)

    const amount = body.amount || Number(object.amount?.value)
    const currency = body.currency || object.amount?.currency
    const metadata = body.metadata || object.metadata || {}
    const workspaceId = req.workspace?.id || metadata.workspaceId || metadata.workspace_id

    const result = await paymentService.processWebhook({ workspaceId, provider, event, externalPaymentId, status, amount, currency, metadata })
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


async function testMarkPaymentPaid(req, res, next) {
  try {
    const paymentId = String(req.params.paymentId || '').trim()

    if (!paymentId) {
      return res.status(400).json({
        error: 'paymentId required'
      })
    }

    const result = await paymentService.processWebhookEvent({
      provider: 'test',
      event: 'payment.succeeded',
      externalPaymentId: paymentId,
      status: 'paid',
      amount: 990,
      currency: 'RUB',
      payload: {
        source: 'test_admin_mark_paid'
      }
    })

    return res.json({
      ok: True,
      paymentId,
      result
    })
  } catch (error) {
    next(error)
  }
}

module.exports.testMarkPaymentPaid = testMarkPaymentPaid
