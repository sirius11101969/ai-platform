const pool = require('../db/pool')
const revenueService = require('./revenueService')
const { issuePaymentCredits } = require('./execution/creditLedgerService')
const { createSandboxPayment, createMockPayment } = require('./providers/yookassaProvider')

async function loadProvider(provider, client = pool) {
  const r = await client.query('SELECT * FROM payment_providers WHERE provider = $1 LIMIT 1', [provider])
  const row = r.rows[0]
  if (!row || !row.enabled) throw Object.assign(new Error('payment provider is not enabled'), { statusCode: 400 })
  return row
}

async function createProviderPayment({ provider, amount, currency, metadata = {}, workspaceId }) {
  const mode = process.env.YOOKASSA_MODE || 'mock'
  if (provider !== 'yookassa') {
    const paymentId = `mock_${provider}_${Date.now()}`
    return { paymentId, status: 'created', confirmationUrl: null, providerMetadata: { mode: 'mock' } }
  }
  if (mode === 'test') return createSandboxPayment({ amount, currency, metadata, workspaceId })
  if (mode === 'mock') return createMockPayment({ provider, amount, currency, metadata, workspaceId })
  throw Object.assign(new Error(`unsupported YOOKASSA_MODE: ${mode}`), { statusCode: 400 })
}

async function createPayment({ workspaceId, provider, amount, currency, metadata = {} }) {
  const p = await loadProvider(provider)
  const normalizedCurrency = String(currency || p.currency).toUpperCase()
  const providerPayment = await createProviderPayment({
    provider,
    amount,
    currency: normalizedCurrency,
    metadata,
    workspaceId,
  })

  const created = await pool.query(
    `INSERT INTO payment_transactions(workspace_id, provider, external_payment_id, status, amount, currency, metadata, provider_metadata, checkout_url)
     VALUES($1::uuid,$2::text,$3::text,$4::text,$5::numeric,$6::text,$7::jsonb,$8::jsonb,$9::text) RETURNING *`,
    [workspaceId, provider, providerPayment.paymentId, providerPayment.status, Number(amount || 0), normalizedCurrency, JSON.stringify(metadata || {}), JSON.stringify(providerPayment.providerMetadata || {}), providerPayment.confirmationUrl]
  )
  console.info('payment_created', { workspaceId, provider, externalPaymentId: providerPayment.paymentId, mode: p.mode })
  return {
    transaction: created.rows[0],
    mode: p.mode,
    paymentId: providerPayment.paymentId,
    status: providerPayment.status,
    confirmationUrl: providerPayment.confirmationUrl,
  }
}

async function processWebhook({ workspaceId, provider, event, externalPaymentId, status, amount, currency, metadata = {} }) {
  const paymentProvider = await loadProvider(provider)
  const normalizedStatus = status || (event === 'payment.succeeded' ? 'paid' : status)

  if (paymentProvider.mode === 'mock' && provider === 'yookassa') {
    if (event !== 'payment.succeeded' || normalizedStatus !== 'paid' || !externalPaymentId) {
      throw Object.assign(new Error('invalid mock webhook payload'), { statusCode: 400 })
    }
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.info('webhook_received', { workspaceId, provider, externalPaymentId, status: normalizedStatus, event })
    const existing = await client.query('SELECT * FROM payment_transactions WHERE provider=$1 AND external_payment_id=$2 LIMIT 1', [provider, externalPaymentId])
    const tx = existing.rows[0]
    if (!tx) throw Object.assign(new Error('payment transaction not found'), { statusCode: 404 })

    if (tx.status === 'paid') {
      await client.query('COMMIT')
      return { deduped: true, transaction: tx }
    }

    const next = await client.query(
      `UPDATE payment_transactions
       SET status=$1::text, metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
       WHERE id=$3::uuid RETURNING *`,
      [normalizedStatus, JSON.stringify(metadata || {}), tx.id]
    )

    if (normalizedStatus === 'paid') {
      const targetWorkspaceId = workspaceId || tx.workspace_id
      const credits = Math.max(1, Math.round(Number(amount || tx.amount || 0)))
      await revenueService.completePayment({ workspaceId: targetWorkspaceId, orderId: metadata.orderId }).catch(() => null)
      await issuePaymentCredits({
        workspaceId: targetWorkspaceId,
        provider,
        externalPaymentId,
        amount: credits,
        currency: currency || tx.currency,
      }, client)
      console.info('payment_confirmed', { workspaceId: targetWorkspaceId, provider, externalPaymentId })
      console.info('credit_granted', { workspaceId: targetWorkspaceId, provider, externalPaymentId, credits })
    }

    await client.query('COMMIT')
    return { deduped: false, transaction: next.rows[0] }
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally { client.release() }
}

async function getPaymentStatus({ workspaceId }) {
  const result = await pool.query(
    `SELECT id, provider, external_payment_id, status, amount, currency, metadata, created_at
     FROM payment_transactions
     WHERE workspace_id = $1::uuid
     ORDER BY created_at DESC
     LIMIT 1`,
    [workspaceId]
  )
  return result.rows[0] || null
}

async function getDashboard({ workspaceId }) {
  const [providers, transactions] = await Promise.all([
    pool.query('SELECT provider, currency, enabled, mode, created_at FROM payment_providers ORDER BY provider ASC'),
    pool.query('SELECT id, provider, external_payment_id, status, amount, currency, metadata, created_at FROM payment_transactions WHERE workspace_id=$1::uuid ORDER BY created_at DESC LIMIT 50', [workspaceId]),
  ])
  const health = providers.rows.map((p) => ({ provider: p.provider, status: p.enabled ? 'healthy' : 'disabled', mode: p.mode }))
  return { providers: providers.rows, transactions: transactions.rows, health }
}

module.exports = { createProviderPayment, createPayment, processWebhook, getPaymentStatus, getDashboard }
