const paymentService = require('../services/paymentService')

async function createCheckout(req, res, next) {
  try {
    const { plan, amount, currency = 'RUB', customerEmail, customerName, customerPhone, provider = 'yookassa' } = req.body || {}

    const workspaceId = process.env.PUBLIC_CHECKOUT_WORKSPACE_ID || 'e5d83c26-f0cb-4ec4-9077-308110eaa77b'

    const prices = { start: 3900, pro: 9900, business: 24900 }

    const paymentAmount = amount || prices[String(plan || '').toLowerCase()] || 10

    const result = await paymentService.createPayment({
      workspaceId,
      provider: String(provider || 'yookassa').toLowerCase(),
      amount: paymentAmount,
      currency,
      metadata: { source: 'landing', customerEmail, customerName, customerPhone, plan }
    })

    return res.json(result)
  } catch (e) {
    next(e)
  }
}

module.exports = { createCheckout }
