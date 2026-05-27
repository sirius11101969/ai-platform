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

function formatMoney(value, currency) {
  return `${Number(value || 0).toLocaleString('ru-RU')} ${currency}`
}

async function sendRevenueTelegramReport(req, res, next) {
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

    const revenue = result.rows[0]
    const rows = revenue.by_provider || []
    const today = revenue.today || []

    const providerLines = rows.map((p) => {
      const label =
        p.provider === 'yookassa' ? 'YooKassa' :
        p.provider === 'stripe' ? 'Stripe' :
        p.provider === 'usdt_trc20' ? 'USDT TRC20' :
        p.provider

      return `• ${label}: paid ${p.paid_count} / ${formatMoney(p.paid_total, p.currency)} · open ${p.open_count} / ${formatMoney(p.open_total, p.currency)}`
    })

    const todayLines = today.length
      ? today.map((p) => `• ${p.provider}: ${p.paid_today_count} payments / ${formatMoney(p.paid_today_total, p.currency)}`)
      : ['• No paid payments today']

    const text = [
      '📊 AS6 DAILY REVENUE REPORT',
      '',
      '💰 By provider:',
      ...providerLines,
      '',
      '📅 Today:',
      ...todayLines,
      '',
      `⚡ Credits issued: ${Number(revenue.credits_issued || 0).toLocaleString('ru-RU')}`,
      '',
      `🕒 Generated: ${new Date(revenue.generated_at).toISOString()}`
    ].join('\n')

    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_MANAGER_CHAT_ID) {
      return res.status(503).json({ error: 'telegram is not configured', text })
    }

    const axios = require('axios')

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_MANAGER_CHAT_ID,
        text,
        reply_markup: {
          inline_keyboard: [[
            { text: 'Open Revenue Dashboard', url: `${process.env.APP_URL || 'https://www.as6.ru'}/dashboard/revenue` }
          ]]
        }
      }
    )

    res.json({ status: 'ok', sent: true, text })
  } catch (e) {
    next(e)
  }
}

module.exports = { getRevenueCommandCenter, sendRevenueTelegramReport }
