const pool = require('../db/pool')
const axios = require('axios')

const DEFAULT_WORKSPACE_ID = 'e5d83c26-f0cb-4ec4-9077-308110eaa77b'

function normalizeText(value) {
  return String(value || '').trim()
}

function isCorporateEmail(email) {
  const value = normalizeText(email).toLowerCase()
  if (!value || !value.includes('@')) return false
  return !/(gmail\.com|mail\.ru|yandex\.ru|yahoo\.com|hotmail\.com|outlook\.com|icloud\.com)$/i.test(value.split('@')[1] || '')
}

function scoreLead({ email, phone, source, message }) {
  let score = 0
  if (normalizeText(email)) score += 25
  if (normalizeText(phone)) score += 15
  if (normalizeText(source).toLowerCase() === 'landing') score += 20
  if (isCorporateEmail(email)) score += 10
  if (normalizeText(message)) score += 20
  return Math.min(score, 100)
}

function nextAction(score) {
  if (score >= 80) return 'call'
  if (score >= 50) return 'meeting'
  return 'proposal'
}

function actionLabel(action) {
  if (action === 'call') return '📞 Позвонить'
  if (action === 'meeting') return '📅 Назначить встречу'
  return '📨 Отправить КП'
}

async function createAiSecretaryLead(req, res, next) {
  try {
    const body = req.body || {}

    const workspaceId = normalizeText(body.workspaceId || process.env.PUBLIC_CHECKOUT_WORKSPACE_ID || DEFAULT_WORKSPACE_ID)
    const name = normalizeText(body.name || body.fullName || body.customerName || 'Новый лид AS6')
    const email = normalizeText(body.email || body.customerEmail)
    const phone = normalizeText(body.phone || body.tel)
    const source = normalizeText(body.source || 'landing')
    const message = normalizeText(body.message || body.comment || body.interest || '')

    const score = scoreLead({ email, phone, source, message })
    const action = nextAction(score)

    const created = await pool.query(`
      INSERT INTO crm_leads(
        workspace_id,
        name,
        email,
        phone,
        source,
        status,
        stage,
        value,
        metadata,
        notes,
        created_at,
        updated_at
      )
      VALUES(
        $1::uuid,
        $2::text,
        NULLIF($3::text,''),
        NULLIF($4::text,''),
        $5::text,
        'new',
        'new',
        0,
        jsonb_build_object(
          'ai_secretary', true,
          'ai_score', $6::int,
          'next_action', $7::text,
          'source', $5::text
        ),
        NULLIF($8::text,''),
        NOW(),
        NOW()
      )
      RETURNING *
    `, [workspaceId, name, email, phone, source, score, action, message])

    const lead = created.rows[0]

    await pool.query(`
      INSERT INTO lead_timeline_events(
        workspace_id,
        lead_id,
        user_id,
        event_type,
        title,
        body,
        source,
        metadata
      )
      VALUES(
        $1::uuid,
        $2::uuid,
        NULL,
        'ai_secretary_lead_created',
        '🧠 AI Secretary lead created',
        $3::text,
        'ai_secretary',
        $4::jsonb
      )
    `, [
      workspaceId,
      lead.id,
      `AI Score ${score}/100\nNext action: ${actionLabel(action)}\nSource: ${source}`,
      JSON.stringify({ score, nextAction: action, email, phone, source })
    ])

    let telegramSent = false

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_MANAGER_CHAT_ID) {
      const appUrl = process.env.APP_URL || 'https://www.as6.ru'
      const crmUrl = `${appUrl}/crm?workspaceId=${workspaceId}&leadId=${lead.id}`

      const text = [
        '🧠 НОВЫЙ ЛИД AS6',
        '',
        `👤 Клиент: ${name}`,
        `📧 Email: ${email || '—'}`,
        `📞 Телефон: ${phone || '—'}`,
        `📍 Источник: ${source}`,
        '',
        `🔥 AI Score: ${score}/100`,
        `🎯 Next Action: ${actionLabel(action)}`,
        '',
        message ? `💬 Сообщение: ${message}` : '💬 Сообщение: —',
        '',
        `🧾 Lead: ${lead.id}`
      ].join('\n')

      await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.TELEGRAM_MANAGER_CHAT_ID,
          text,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🗂 Открыть CRM', url: crmUrl }],
              [
                { text: '📞 Позвонить', url: `${crmUrl}&action=call` },
                { text: '📅 Встреча', url: `${crmUrl}&action=meeting` }
              ],
              [{ text: '📨 КП', url: `${crmUrl}&action=proposal` }]
            ]
          }
        }
      )

      telegramSent = true
    }

    res.json({
      status: 'ok',
      leadId: lead.id,
      workspaceId,
      score,
      nextAction: action,
      nextActionLabel: actionLabel(action),
      telegramSent,
      lead
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { createAiSecretaryLead }
