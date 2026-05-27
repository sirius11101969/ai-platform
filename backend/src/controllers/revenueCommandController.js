const pool = require('../db/pool')

async function getRevenueCommandCenter(req, res, next) {
  try {
    const result = await pool.query(`
      WITH payments AS (
        SELECT
          provider,
          currency,
          COUNT(*) FILTER (WHERE status='paid')::int AS paid_count,
          COALESCE(SUM(amount) FILTER (WHERE status='paid'),0)::numeric AS paid_total,
          COUNT(*) FILTER (WHERE status IN ('pending','created'))::int AS open_count,
          COALESCE(SUM(amount) FILTER (WHERE status IN ('pending','created')),0)::numeric AS open_total
        FROM payment_transactions
        GROUP BY provider,currency
      ),
      credits AS (
        SELECT
          COALESCE(SUM((metadata->>'credits')::numeric),0)::numeric AS credits_issued
        FROM crm_leads
        WHERE source='payment'
      ),
      today AS (
        SELECT
          provider,
          currency,
          COUNT(*) FILTER (WHERE status='paid')::int AS paid_today_count,
          COALESCE(SUM(amount) FILTER (WHERE status='paid'),0)::numeric AS paid_today_total
        FROM payment_transactions
        WHERE created_at::date = CURRENT_DATE
        GROUP BY provider,currency
      )
      SELECT
        NOW() AS generated_at,
        (SELECT credits_issued FROM credits) AS credits_issued,
        COALESCE((SELECT json_agg(payments ORDER BY provider,currency) FROM payments), '[]'::json) AS by_provider,
        COALESCE((SELECT json_agg(today ORDER BY provider,currency) FROM today), '[]'::json) AS today
    `)

    res.json({
      status: 'ok',
      revenue: result.rows[0]
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { getRevenueCommandCenter }
