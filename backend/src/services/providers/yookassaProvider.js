const crypto = require('crypto')

function ensureEnv(name) {
  const value = process.env[name]
  if (!value) throw Object.assign(new Error(`${name} is required`), { statusCode: 500 })
  return value
}

async function createSandboxPayment({ amount, currency, metadata = {}, workspaceId }) {
  const shopId = ensureEnv('YOOKASSA_SHOP_ID')
  const secretKey = ensureEnv('YOOKASSA_SECRET_KEY')
  const appUrl = ensureEnv('APP_URL')

  const payload = {
    amount: {
      value: Number(amount || 0).toFixed(2),
      currency: String(currency || 'RUB').toUpperCase(),
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: `${appUrl.replace(/\/$/, '')}/billing`,
    },
    description: `Workspace ${workspaceId} payment`,
    receipt: {
      customer: {
        email: metadata.customerEmail || process.env.PAYMENT_RECEIPT_EMAIL || 'buylesson@gmail.com',
      },
      items: [
        {
          description: metadata.description || 'AI credits',
          quantity: '1.00',
          amount: {
            value: Number(amount || 0).toFixed(2),
            currency: String(currency || 'RUB').toUpperCase(),
          },
          vat_code: Number(process.env.YOOKASSA_VAT_CODE || 1),
          payment_subject: 'service',
          payment_mode: 'full_payment',
        },
      ],
    },
    metadata: { ...(metadata || {}), workspaceId },
  }

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw Object.assign(new Error(`yookassa sandbox request failed: ${response.status}`), {
      statusCode: 502,
      details: errorBody,
    })
  }

  const data = await response.json()
  return {
    paymentId: data.id,
    status: data.status,
    confirmationUrl: data.confirmation?.confirmation_url || null,
    providerMetadata: data,
  }
}

async function createMockPayment({ provider }) {
  const paymentId = `mock_${provider}_${Date.now()}`
  return {
    paymentId,
    status: 'created',
    confirmationUrl: null,
    providerMetadata: { mode: 'mock' },
  }
}

module.exports = { createSandboxPayment, createMockPayment }
