const pool = require('../../db/pool')

async function reserveCredits({ workspaceId, userId, taskId, credits, idempotencyKey, metadata = {} }, client = pool) {
  const amount = Math.trunc(Number(credits || 0))
  if (!workspaceId) throw new Error('workspaceId is required')
  if (!idempotencyKey) throw new Error('idempotencyKey is required')
  if (amount <= 0) throw new Error('credits must be a positive integer')

  const existing = await client.query(
    'SELECT id, balance_after FROM credit_ledger_entries WHERE workspace_id = $1 AND idempotency_key = $2',
    [workspaceId, idempotencyKey]
  )
  if (existing.rows[0]) return { duplicated: true, ...existing.rows[0] }

  const workspace = await client.query('SELECT credits_pool FROM workspaces WHERE id = $1 FOR UPDATE', [workspaceId])
  if (!workspace.rows[0]) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  const currentBalance = Number(workspace.rows[0].credits_pool || 0)
  if (currentBalance < amount) throw Object.assign(new Error(`Insufficient credits: ${amount} credits required`), { statusCode: 402 })

  const updated = await client.query(
    'UPDATE workspaces SET credits_pool = credits_pool - $1, updated_at = NOW() WHERE id = $2 RETURNING credits_pool',
    [amount, workspaceId]
  )
  const balanceAfter = Number(updated.rows[0].credits_pool || 0)
  const entry = await client.query(
    `INSERT INTO credit_ledger_entries(workspace_id, user_id, task_id, idempotency_key, entry_type, credits_delta, balance_after, metadata)
     VALUES($1,$2,$3,$4,'reserve',$5,$6,$7)
     RETURNING id, balance_after`,
    [workspaceId, userId || null, taskId || null, idempotencyKey, -amount, balanceAfter, metadata]
  )
  return { duplicated: false, ...entry.rows[0] }
}

async function refundCredits({ workspaceId, userId, taskId, credits, idempotencyKey, metadata = {} }, client = pool) {
  const amount = Math.trunc(Number(credits || 0))
  if (!workspaceId) throw new Error('workspaceId is required')
  if (!idempotencyKey) throw new Error('idempotencyKey is required')
  if (amount <= 0) throw new Error('credits must be a positive integer')

  const existing = await client.query(
    'SELECT id, balance_after FROM credit_ledger_entries WHERE workspace_id = $1 AND idempotency_key = $2',
    [workspaceId, idempotencyKey]
  )
  if (existing.rows[0]) return { duplicated: true, ...existing.rows[0] }

  await client.query('SELECT id FROM workspaces WHERE id = $1 FOR UPDATE', [workspaceId])
  const updated = await client.query(
    'UPDATE workspaces SET credits_pool = credits_pool + $1, updated_at = NOW() WHERE id = $2 RETURNING credits_pool',
    [amount, workspaceId]
  )
  if (!updated.rows[0]) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  const balanceAfter = Number(updated.rows[0].credits_pool || 0)
  const entry = await client.query(
    `INSERT INTO credit_ledger_entries(workspace_id, user_id, task_id, idempotency_key, entry_type, credits_delta, balance_after, metadata)
     VALUES($1,$2,$3,$4,'refund',$5,$6,$7)
     RETURNING id, balance_after`,
    [workspaceId, userId || null, taskId || null, idempotencyKey, amount, balanceAfter, metadata]
  )
  return { duplicated: false, ...entry.rows[0] }
}


async function issuePaymentCredits({ workspaceId, provider, externalPaymentId, amount, currency }, client = pool) {
  const credits = Math.max(1, Math.round(Number(amount || 0)))
  if (!workspaceId) throw new Error('workspaceId is required')
  if (!provider) throw new Error('provider is required')
  if (!externalPaymentId) throw new Error('externalPaymentId is required')
  const idempotencyKey = `payment:${provider}:${externalPaymentId}`

  const existing = await client.query(
    'SELECT id, balance_after FROM credit_ledger_entries WHERE workspace_id = $1 AND idempotency_key = $2',
    [workspaceId, idempotencyKey]
  )
  if (existing.rows[0]) return { duplicated: true, ...existing.rows[0] }

  await client.query('SELECT id FROM workspaces WHERE id = $1 FOR UPDATE', [workspaceId])
  const updated = await client.query(
    'UPDATE workspaces SET credits_pool = credits_pool + $1, updated_at = NOW() WHERE id = $2 RETURNING credits_pool',
    [credits, workspaceId]
  )
  if (!updated.rows[0]) throw Object.assign(new Error('Workspace not found'), { statusCode: 404 })
  const balanceAfter = Number(updated.rows[0].credits_pool || 0)
  const metadata = { reason: 'payment_credit', provider, externalPaymentId, amount: Number(amount || 0), currency: String(currency || '').toUpperCase() }
  const entry = await client.query(
    `INSERT INTO credit_ledger_entries(workspace_id, idempotency_key, entry_type, credits_delta, balance_after, metadata)
     VALUES($1,$2,'grant',$3,$4,$5)
     RETURNING id, balance_after`,
    [workspaceId, idempotencyKey, credits, balanceAfter, metadata]
  )
  return { duplicated: false, ...entry.rows[0] }
}

module.exports = { reserveCredits, refundCredits, issuePaymentCredits }
