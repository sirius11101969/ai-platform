function requirePaymentWebhookSecret(req, res, next) {
  const providedSecret = req.get('x-payment-webhook-secret')
  const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET

  if (!providedSecret || !expectedSecret || providedSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Invalid webhook secret' })
  }

  return next()
}

module.exports = { requirePaymentWebhookSecret }
