const assert = require('assert')
const { requirePaymentWebhookSecret } = require('../src/middleware/paymentWebhookAuthMiddleware')

async function run() {
  const originalSecret = process.env.PAYMENT_WEBHOOK_SECRET
  process.env.PAYMENT_WEBHOOK_SECRET = 'change_me_before_live'

  try {
    let nextCalled = false
    const reqOk = { get: (h) => (h === 'x-payment-webhook-secret' ? 'change_me_before_live' : undefined) }
    const resOk = { status: () => ({ json: () => ({}) }) }
    requirePaymentWebhookSecret(reqOk, resOk, () => { nextCalled = true })
    assert.strictEqual(nextCalled, true)

    let statusCode = null
    let body = null
    const reqBad = { get: () => 'bad' }
    const resBad = { status: (code) => { statusCode = code; return { json: (payload) => { body = payload; return payload } } } }
    requirePaymentWebhookSecret(reqBad, resBad, () => {})
    assert.strictEqual(statusCode, 401)
    assert.deepStrictEqual(body, { error: 'Invalid webhook secret' })
  } finally {
    if (originalSecret === undefined) delete process.env.PAYMENT_WEBHOOK_SECRET
    else process.env.PAYMENT_WEBHOOK_SECRET = originalSecret
  }
}

run().then(() => console.log('paymentWebhookAuthMiddleware.test.js passed')).catch((error) => { console.error(error); process.exit(1) })
