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
    const leadId = String(req.query.leadId || req.body?.leadId || '').trim()

    const pool = require('../db/pool')

    let found

    if (paymentId && paymentId !== 'by-lead') {
      found = await pool.query(`
        SELECT *
        FROM payment_transactions
        WHERE external_payment_id = $1::text
        LIMIT 1
      `, [paymentId])
    } else if (leadId) {
      found = await pool.query(`
        SELECT *
        FROM payment_transactions
        WHERE metadata->>'leadId' = $1::text
          AND status IN ('pending','created')
        ORDER BY created_at DESC
        LIMIT 1
      `, [leadId])
    } else {
      return res.status(400).json({ error: 'paymentId or leadId required' })
    }

    const tx = found.rows[0]

    if (!tx) {
      return res.status(404).json({ error: 'payment not found', paymentId, leadId })
    }

    const result = await paymentService.processWebhook({
      workspaceId: tx.workspace_id,
      provider: tx.provider,
      event: 'payment.succeeded',
      externalPaymentId: tx.external_payment_id,
      status: 'paid',
      amount: Number(tx.amount || 0),
      currency: tx.currency,
      metadata: tx.metadata || {}
    })

    return res.json({
      ok: true,
      paymentId: tx.external_payment_id,
      leadId: tx.metadata?.leadId || leadId,
      provider: tx.provider,
      result
    })
  } catch (error) {
    next(error)
  }
}

module.exports.testMarkPaymentPaid = testMarkPaymentPaid
