const pool = require('../db/pool')
const revenueService = require('./revenueService')

async function loadProvider(provider, client = pool) {
  const r = await client.query('SELECT * FROM payment_providers WHERE provider = $1 LIMIT 1', [provider])
  const row = r.rows[0]
  if (!row || !row.enabled) throw Object.assign(new Error('payment provider is not enabled'), { statusCode: 400 })
  return row
}

async function createPayment({ workspaceId, provider, amount, currency, metadata = {} }) {
  const p = await loadProvider(provider)
  if (p.mode !== 'mock') throw Object.assign(new Error('live mode not yet enabled'), { statusCode: 400 })

  const externalPaymentId = `mock_${provider}_${Date.now()}`
  const created = await pool.query(
    `INSERT INTO payment_transactions(workspace_id, provider, external_payment_id, status, amount, currency, metadata)
     VALUES($1::uuid,$2::text,$3::text,'created',$4::numeric,$5::text,$6::jsonb) RETURNING *`,
    [workspaceId, provider, externalPaymentId, Number(amount || 0), String(currency || p.currency).toUpperCase(), JSON.stringify(metadata || {})]
  )
  console.info('payment_created', { workspaceId, provider, externalPaymentId, mode: p.mode })
  return { transaction: created.rows[0], mode: p.mode }
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
      await client.query('UPDATE workspaces SET credits_pool = credits_pool + $1::int, updated_at = NOW() WHERE id = $2::uuid', [credits, targetWorkspaceId])
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

module.exports = { createPayment, processWebhook, getPaymentStatus, getDashboard }
