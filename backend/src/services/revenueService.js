const pool = require('../db/pool')

const FUNNEL_STAGES = ['visitor','lead','signup','checkout_started','payment_pending','payment_completed','credits_issued','activation_completed']

async function trackEvent({ workspaceId, eventType, payload = {} }, client = pool) {
  const result = await client.query(
    `INSERT INTO revenue_events(workspace_id, event_type, payload)
     VALUES($1::uuid, $2::text, $3::jsonb)
     RETURNING *`,
    [workspaceId, eventType, JSON.stringify(payload)]
  )
  console.info('revenue_event_created', { workspaceId, eventType, revenueEventId: result.rows[0].id })
  return result.rows[0]
}

async function getOverview({ workspaceId }) {
  const result = await pool.query(`
    SELECT
      COALESCE(SUM((payload->>'amount')::numeric) FILTER (WHERE event_type = 'payment_completed' AND created_at >= date_trunc('month', NOW())), 0)::numeric AS mrr,
      COALESCE(SUM((payload->>'amount')::numeric) FILTER (WHERE event_type = 'payment_completed' AND created_at >= date_trunc('day', NOW())), 0)::numeric AS payments_today,
      COUNT(*) FILTER (WHERE event_type = 'signup' AND created_at >= date_trunc('day', NOW()))::int AS new_users,
      COALESCE(SUM((payload->>'credits')::int) FILTER (WHERE event_type = 'credits_issued' AND created_at >= date_trunc('day', NOW())), 0)::int AS credits_issued,
      ROUND((COUNT(*) FILTER (WHERE event_type = 'activation_completed')::numeric / NULLIF(COUNT(*) FILTER (WHERE event_type = 'payment_completed'), 0)::numeric) * 100, 2) AS activation_rate
    FROM revenue_events
    WHERE workspace_id = $1::uuid
  `, [workspaceId])
  const row = result.rows[0] || {}
  return { mrr: Number(row.mrr || 0), paymentsToday: Number(row.payments_today || 0), newUsers: Number(row.new_users || 0), creditsIssued: Number(row.credits_issued || 0), activationRate: Number(row.activation_rate || 0) }
}

async function getFunnel({ workspaceId }) {
  const result = await pool.query(`SELECT event_type, COUNT(*)::int AS total FROM revenue_events WHERE workspace_id = $1::uuid GROUP BY event_type`, [workspaceId])
  const counts = Object.fromEntries(result.rows.map((r) => [r.event_type, Number(r.total || 0)]))
  return FUNNEL_STAGES.map((stage) => ({ stage, total: counts[stage] || 0 }))
}

async function activatePayment({ workspaceId, paymentId, credits = 100, lead = null, plan = 'starter' }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const dedupeKey = `payment:${paymentId}`
    const existing = await client.query(`SELECT id FROM revenue_events WHERE workspace_id = $1::uuid AND event_type = 'activation_completed' AND payload->>'dedupeKey' = $2 LIMIT 1`, [workspaceId, dedupeKey])
    if (existing.rows[0]) {
      await client.query('COMMIT')
      return { ok: true, deduped: true }
    }

    console.info('payment_activation_started', { workspaceId, paymentId })
    await trackEvent({ workspaceId, eventType: 'payment_completed', payload: { paymentId, plan } }, client)
    await trackEvent({ workspaceId, eventType: 'payment_pending', payload: { paymentId, plan } }, client)

    await client.query(`UPDATE workspaces SET credits_pool = credits_pool + $1::int, updated_at = NOW() WHERE id = $2::uuid`, [credits, workspaceId])
    console.info('credit_granted', { workspaceId, paymentId, credits })
    await trackEvent({ workspaceId, eventType: 'credits_issued', payload: { paymentId, credits } }, client)

    await trackEvent({ workspaceId, eventType: 'activation_completed', payload: { paymentId, dedupeKey, activationStatus: 'completed' } }, client)
    console.info('crm_activation_completed', { workspaceId, paymentId, lead, plan, paymentStatus: 'paid', credits, activationStatus: 'completed' })
    console.info('payment_activation_completed', { workspaceId, paymentId })
    await client.query('COMMIT')
    return { ok: true, deduped: false, lead, plan, paymentStatus: 'paid', credits, activationStatus: 'completed' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { getOverview, getFunnel, activatePayment, trackEvent }
