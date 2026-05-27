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

function providerLabel(provider) {
  if (provider === 'yookassa') return 'YooKassa'
  if (provider === 'stripe') return 'Stripe'
  if (provider === 'usdt_trc20') return 'USDT TRC20'
  return provider
}

function toUsd(value, currency) {
  const amount = Number(value || 0)
  const c = String(currency || '').toUpperCase()
  const usdRubRate = Number(process.env.USD_RUB_RATE || 90)
  if (c === 'USD' || c === 'USDT') return amount
  if (c === 'RUB') return amount / usdRubRate
  return 0
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
        SELECT COALESCE(SUM((metadata->>'credits')::numeric),0)::numeric AS credits_issued
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

    const totalUsd = rows.reduce((sum, p) => sum + toUsd(p.paid_total, p.currency), 0)
    const todayUsd = today.reduce((sum, p) => sum + toUsd(p.paid_today_total, p.currency), 0)
    const paidCount = rows.reduce((sum, p) => sum + Number(p.paid_count || 0), 0)
    const openCount = rows.reduce((sum, p) => sum + Number(p.open_count || 0), 0)
    const allCount = paidCount + openCount
    const conversion = allCount ? Math.round((paidCount / allCount) * 100) : 0
    const todayCount = today.reduce((sum, p) => sum + Number(p.paid_today_count || 0), 0)

    const providerLines = rows.map((p) =>
      `• ${providerLabel(p.provider)} → ${formatMoney(p.paid_total, p.currency)} paid · ${formatMoney(p.open_total, p.currency)} open`
    )

    const todayLines = today.length
      ? today.map((p) => `• ${providerLabel(p.provider)} → ${p.paid_today_count} payments · ${formatMoney(p.paid_today_total, p.currency)}`)
      : ['• No paid payments today']

    const text = [
      '📊 AS6 EXECUTIVE REVENUE REPORT',
      '',
      `💰 Total Revenue: ≈ $${Math.round(totalUsd).toLocaleString('ru-RU')}`,
      `📈 Today: +${todayCount} payments · ≈ $${Math.round(todayUsd).toLocaleString('ru-RU')}`,
      `💳 Paid: ${paidCount}`,
      `🟡 Open: ${openCount}`,
      `🔥 Conversion: ${paidCount}/${allCount} → ${conversion}%`,
      `⚡ Credits issued: ${Number(revenue.credits_issued || 0).toLocaleString('ru-RU')}`,
      '',
      '🏦 Providers:',
      ...providerLines,
      '',
      '📅 Today by provider:',
      ...todayLines,
      '',
      `🕒 Generated: ${new Date(revenue.generated_at).toISOString()}`
    ].join('\n')

    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_MANAGER_CHAT_ID) {
      return res.status(503).json({ error: 'telegram is not configured', text })
    }

    const axios = require('axios')
    const appUrl = process.env.APP_URL || 'https://www.as6.ru'

    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_MANAGER_CHAT_ID,
        text,
        reply_markup: {
          inline_keyboard: [
            [{ text: '📈 Revenue Dashboard', url: `${appUrl}/dashboard/revenue` }],
            [{ text: '💳 Payments', url: `${appUrl}/dashboard/revenue` }, { text: '📋 CRM', url: `${appUrl}/crm` }]
          ]
        }
      }
    )

    res.json({ status: 'ok', sent: true, text })
  } catch (e) {
    next(e)
  }
}

module.exports = { getRevenueCommandCenter, sendRevenueTelegramReport }
