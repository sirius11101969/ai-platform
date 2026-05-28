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
                { text: '📞 Позвонить', callback_data: `as:${lead.id}:call` },
                { text: '📅 Встреча', callback_data: `as:${lead.id}:meeting` }
              ],
              [
                { text: '📨 КП', callback_data: `as:${lead.id}:proposal` },
                { text: '🗂 Архив', callback_data: `as:${lead.id}:archive` }
              ]
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

function resolveActionState(action) {
  if (action === 'call') return { status: 'qualified', stage: 'qualified', title: '📞 Manager should call lead', body: 'AI Secretary action: call lead' }
  if (action === 'meeting') return { status: 'booked', stage: 'booked', title: '📅 Meeting should be scheduled', body: 'AI Secretary action: schedule meeting' }
  if (action === 'proposal') return { status: 'proposal', stage: 'proposal', title: '📨 Proposal should be sent', body: 'AI Secretary action: send proposal' }
  if (action === 'archive') return { status: 'lost', stage: 'lost', title: '🗂 Lead archived', body: 'AI Secretary action: archive lead' }
  return { status: 'qualified', stage: 'qualified', title: '✅ Lead qualified', body: 'AI Secretary action completed' }
}

async function applyAiSecretaryActionCore({ leadId, action, workspaceId }) {
  const state = resolveActionState(action)

  const updated = await pool.query(`
    UPDATE crm_leads
    SET
      status = $1::text,
      stage = $2::text,
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'ai_secretary_last_action', $3::text,
        'ai_secretary_action_at', NOW()
      ),
      updated_at = NOW()
    WHERE id = $4::uuid
      AND workspace_id = $5::uuid
    RETURNING *
  `, [state.status, state.stage, action, leadId, workspaceId])

  if (!updated.rows[0]) return null

  const lead = updated.rows[0]

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
      'ai_secretary_action',
      $3::text,
      $4::text,
      'ai_secretary',
      $5::jsonb
    )
  `, [
    workspaceId,
    leadId,
    state.title,
    state.body,
    JSON.stringify({ action, status: state.status, stage: state.stage })
  ])

  return { lead, state }
}

async function sendAiSecretaryActionConfirmation({ lead, leadId, action, state, workspaceId }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_MANAGER_CHAT_ID) return false

  const appUrl = process.env.APP_URL || 'https://www.as6.ru'
  const crmUrl = `${appUrl}/crm?workspaceId=${workspaceId}&leadId=${leadId}`

  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      chat_id: process.env.TELEGRAM_MANAGER_CHAT_ID,
      text: [
        '✅ AI SECRETARY ACTION APPLIED',
        '',
        `👤 Lead: ${lead.name}`,
        `🎯 Action: ${actionLabel(action)}`,
        `📌 Status: ${state.status}`,
        `🧾 Lead ID: ${leadId}`
      ].join('\n'),
      reply_markup: {
        inline_keyboard: [[{ text: '🗂 Открыть CRM', url: crmUrl }]]
      }
    }
  )

  return true
}

async function applyAiSecretaryAction(req, res, next) {
  try {
    const leadId = normalizeText(req.params.leadId || req.body?.leadId)
    const action = normalizeText(req.params.action || req.body?.action || 'qualified').toLowerCase()
    const workspaceId = normalizeText(req.body?.workspaceId || process.env.PUBLIC_CHECKOUT_WORKSPACE_ID || DEFAULT_WORKSPACE_ID)

    if (!leadId) return res.status(400).json({ error: 'leadId is required' })

    const result = await applyAiSecretaryActionCore({ leadId, action, workspaceId })
    if (!result) return res.status(404).json({ error: 'lead not found' })

    const telegramSent = await sendAiSecretaryActionConfirmation({
      lead: result.lead,
      leadId,
      action,
      state: result.state,
      workspaceId
    })

    res.json({
      status: 'ok',
      leadId,
      action,
      crmStatus: result.state.status,
      crmStage: result.state.stage,
      telegramSent,
      lead: result.lead
    })
  } catch (e) {
    next(e)
  }
}

async function handleAiSecretaryTelegramCallback(req, res, next) {
  try {
    const body = req.body || {}
    const callback = body.callback_query
    const data = String(callback?.data || '')

    if (!data.startsWith('as:')) {
      return res.json({ status: 'ignored' })
    }

    const [, leadId, action] = data.split(':')

    const leadLookup = await pool.query(
      'SELECT workspace_id FROM crm_leads WHERE id=$1::uuid LIMIT 1',
      [leadId]
    )

    const workspaceId = normalizeText(
      leadLookup.rows[0]?.workspace_id || process.env.PUBLIC_CHECKOUT_WORKSPACE_ID || DEFAULT_WORKSPACE_ID
    )

    const result = await applyAiSecretaryActionCore({ leadId, action, workspaceId })
    if (!result) {
      if (callback?.id) {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          callback_query_id: callback.id,
          text: 'Lead not found',
          show_alert: true
        })
      }
      return res.status(404).json({ error: 'lead not found' })
    }

    if (callback?.id && callback.id !== 'manual-test') {
      try {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          callback_query_id: callback.id,
          text: `Action applied: ${actionLabel(action)}`,
          show_alert: false
        })
      } catch (e) {
        console.warn('telegram_answer_callback_failed', e.response?.data || e.message)
      }
    }

    await sendAiSecretaryActionConfirmation({
      lead: result.lead,
      leadId,
      action,
      state: result.state,
      workspaceId
    })

    res.json({
      status: 'ok',
      source: 'telegram_callback',
      leadId,
      action,
      crmStatus: result.state.status,
      crmStage: result.state.stage
    })
  } catch (e) {
    next(e)
  }
}

module.exports = { createAiSecretaryLead, applyAiSecretaryAction, handleAiSecretaryTelegramCallback }
