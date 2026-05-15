const axios = require('axios')
const pool = require('../db/pool')
const { generateTelegramSalesReply } = require('./crmAiService')
const crmModel = require('../models/crmModel')
const emailService = require('./emailService')

const TELEGRAM_API_BASE = 'https://api.telegram.org'

function normalizeText(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function buildTelegramName(from = {}) {
  return [from.first_name, from.last_name].map(normalizeText).filter(Boolean).join(' ') || from.username || `Telegram user ${from.id}`
}

function buildTelegramHandle(from = {}) {
  const username = normalizeText(from.username)
  return username ? `@${username.replace(/^@/, '')}` : null
}


const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const MATERIAL_INTENT_RULES = [
  { pattern: /(отправь|пришли|вышли|скинь|send)\s+[^.?!\n]*(презентац|presentation|презу)/i, template: 'demo_invitation', label: 'презентацию', attachment: 'presentation' },
  { pattern: /(отправь|пришли|вышли|скинь|send)\s+[^.?!\n]*(скрин|screenshots?|screen)/i, template: 'materials_pack', label: 'скриншоты', attachment: 'screenshots' },
  { pattern: /(пришли|отправь|вышли|скинь|send)\s+[^.?!\n]*(кп|коммерческ|предложен|proposal|quote)/i, template: 'commercial_proposal', label: 'коммерческое предложение', attachment: 'pdf' },
  { pattern: /(отправь|пришли|вышли|скинь|send)\s+[^.?!\n]*(материал|materials?)/i, template: 'materials_pack', label: 'материалы', attachment: 'materials' },
]

function extractEmail(text) {
  const match = String(text || '').match(EMAIL_PATTERN)
  return match ? match[0].toLowerCase() : null
}

function detectEmailMaterialIntent(text) {
  const normalized = String(text || '')
  const rule = MATERIAL_INTENT_RULES.find((item) => item.pattern.test(normalized))
  if (!rule) return null
  return { ...rule, email: extractEmail(normalized) }
}

function attachmentMatchesIntent(attachment, intent) {
  const name = String(attachment.fileName || '').toLowerCase()
  const mime = String(attachment.mimeType || '').toLowerCase()
  if (intent.attachment === 'screenshots') return mime.startsWith('image/') || /(screen|скрин|screenshot)/i.test(name)
  if (intent.attachment === 'pdf') return mime === 'application/pdf' || /\.pdf$/i.test(name)
  if (intent.attachment === 'presentation') return /pdf|presentation|powerpoint|officedocument|image/.test(mime) || /(презентац|presentation|demo|\.pdf$|\.png$|\.jpe?g$|\.webp$)/i.test(name)
  return mime === 'application/pdf' || mime.startsWith('image/') || /(материал|materials?|presentation|презентац|screen|скрин|\.pdf$|\.png$|\.jpe?g$|\.webp$)/i.test(name)
}

async function resolveIntentAttachmentIds(userId, leadId, intent) {
  const attachments = await emailService.listAttachments(userId, leadId)
  return attachments.filter((attachment) => attachmentMatchesIntent(attachment, intent)).slice(0, 6).map((attachment) => attachment.id)
}

async function persistLeadEmailFromMessage(userId, leadId, email) {
  if (!email) return
  await pool.query(
    `UPDATE crm_leads
        SET email = COALESCE(email, $3),
            contact = COALESCE(contact, $3),
            metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('emailFromTelegram', $3),
            updated_at = NOW()
      WHERE user_id = $1 AND id = $2`,
    [userId, leadId, email]
  )
}

async function runTelegramEmailWorkflow({ userId, lead, incomingMessage }) {
  const intent = detectEmailMaterialIntent(incomingMessage)
  if (!intent) return null
  const recipient = intent.email || lead.email || lead.metadata?.email || lead.metadata?.emailFromTelegram || null
  if (!recipient) {
    return {
      intent,
      handled: true,
      success: false,
      requiresEmail: true,
      reply: 'Пришлите, пожалуйста, email — сразу отправлю материалы после успешной отправки письма.',
    }
  }

  try {
    await persistLeadEmailFromMessage(userId, lead.id, intent.email)
    const attachmentIds = await resolveIntentAttachmentIds(userId, lead.id, intent)
    const email = await emailService.sendEmailNow(userId, {
      leadId: lead.id,
      to: recipient,
      template: intent.template,
      subject: `Материалы по AI‑платформе AS6: ${intent.label}`,
      attachmentIds,
    })
    return {
      intent,
      handled: true,
      success: true,
      email,
      reply: `Готово, отправил материалы на ${recipient}.`,
    }
  } catch (error) {
    console.error('Telegram email action failed', { leadId: lead.id, recipient, error: error.message })
    return {
      intent,
      handled: true,
      success: false,
      error: error.message,
      reply: 'Пока не удалось отправить письмо.',
    }
  }
}

function extractTelegramMessage(update = {}) {
  const message = update.message || update.edited_message || update.channel_post || null
  if (!message || !message.chat || !message.from) return null
  const text = normalizeText(message.text || message.caption)
  if (!text) return null

  return {
    chatId: message.chat.id,
    messageId: message.message_id,
    text,
    date: message.date ? new Date(message.date * 1000).toISOString() : new Date().toISOString(),
    from: message.from,
    userId: String(message.from.id),
    username: buildTelegramHandle(message.from),
    firstName: normalizeText(message.from.first_name),
    lastName: normalizeText(message.from.last_name),
    name: buildTelegramName(message.from),
  }
}

async function resolveCrmUserId(client = pool) {
  const configuredEmail = normalizeText(process.env.TELEGRAM_CRM_USER_EMAIL || process.env.CRM_DEFAULT_USER_EMAIL)
  if (configuredEmail) {
    const configured = await client.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [configuredEmail])
    if (configured.rows[0]) return configured.rows[0].id
  }

  const result = await client.query('SELECT id FROM users ORDER BY created_at ASC LIMIT 1')
  if (!result.rows[0]) {
    throw Object.assign(new Error('Telegram CRM owner user not found'), { statusCode: 503 })
  }
  return result.rows[0].id
}

function leadUrl(leadId) {
  const baseUrl = normalizeText(process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN)
  if (!baseUrl || baseUrl === 'true' || baseUrl === '*') return null
  return `${baseUrl.replace(/\/$/, '')}/crm?lead=${leadId}`
}

async function logActivity(client, userId, leadId, type, title, body = null, metadata = {}) {
  await client.query(
    `INSERT INTO crm_activity(user_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6)`,
    [userId, leadId, type, title, body, metadata]
  )
}

async function findTelegramLead(client, userId, telegram) {
  const params = [userId, telegram.userId]
  let usernameClause = ''
  if (telegram.username) {
    params.push(telegram.username)
    usernameClause = `OR telegram = $${params.length} OR telegram_username = $${params.length}`
  }

  const result = await client.query(
    `SELECT id, user_id, name, email, phone, telegram, telegram_id, telegram_username, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at
       FROM crm_leads
      WHERE user_id = $1
        AND source = 'telegram'
        AND (telegram_id = $2 OR (metadata->>'telegramUserId') = $2 ${usernameClause})
      ORDER BY updated_at DESC
      LIMIT 1
      FOR UPDATE`,
    params
  )
  return result.rows[0] || null
}

async function upsertLeadWithIncomingMessage(telegram) {
  const noteBody = [`Telegram message received`, `From: ${telegram.name}${telegram.username ? ` (${telegram.username})` : ''}`, `Message: ${telegram.text}`].join('\n')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const userId = await resolveCrmUserId(client)
    const existing = await findTelegramLead(client, userId, telegram)
    let lead
    let isNew = false

    if (existing) {
      const metadata = {
        ...(existing.metadata || {}),
        telegramUserId: telegram.userId,
        telegramChatId: String(telegram.chatId),
        telegramLastMessageId: telegram.messageId,
        telegramLastMessageAt: telegram.date,
      }
      const updated = await client.query(
        `UPDATE crm_leads
            SET name = COALESCE(NULLIF($3, ''), name),
                telegram = COALESCE($4, telegram),
                telegram_id = $5,
                telegram_username = COALESCE($4, telegram_username),
                first_name = COALESCE($6, first_name),
                last_name = COALESCE($7, last_name),
                source = 'telegram',
                notes = COALESCE(notes || E'\n', '') || $8,
                metadata = COALESCE(metadata, '{}'::jsonb) || $9::jsonb,
                contact = COALESCE($4, telegram, phone, email, contact),
                last_message_at = $10::timestamptz,
                last_seen_at = NOW(),
                updated_at = NOW()
          WHERE user_id = $1 AND id = $2
          RETURNING id, user_id, name, email, phone, telegram, telegram_id, telegram_username, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, existing.id, telegram.name, telegram.username, telegram.userId, telegram.firstName, telegram.lastName, noteBody, metadata, telegram.date]
      )
      lead = updated.rows[0]
      await logActivity(client, userId, lead.id, 'telegram_lead_updated', 'Telegram лид обновлён', 'Лид обновлён новым сообщением Telegram.', { telegramUserId: telegram.userId, chatId: telegram.chatId })
    } else {
      isNew = true
      const metadata = {
        telegramUserId: telegram.userId,
        telegramChatId: String(telegram.chatId),
        telegramLastMessageId: telegram.messageId,
        telegramLastMessageAt: telegram.date,
      }
      const created = await client.query(
        `INSERT INTO crm_leads(user_id, name, telegram, telegram_id, telegram_username, first_name, last_name, first_message, status, value, source, notes, contact, stage, metadata, last_message_at, last_seen_at)
         VALUES($1, $2, $3, $4, $3, $5, $6, $7, 'new', 0, 'telegram', $8, $3, 'new', $9::jsonb, $10::timestamptz, NOW())
         RETURNING id, user_id, name, email, phone, telegram, telegram_id, telegram_username, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, telegram.name, telegram.username || `tg:${telegram.userId}`, telegram.userId, telegram.firstName, telegram.lastName, telegram.text, noteBody, metadata, telegram.date]
      )
      lead = created.rows[0]
      await logActivity(client, userId, lead.id, 'lead_created', 'Лид создан', 'Новый Telegram лид добавлен в этап «Новый».', { source: 'telegram', stage: 'Новый' })
    }

    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, body)
       VALUES($1, $2, $3)
       RETURNING id, lead_id, user_id, body, created_at`,
      [lead.id, userId, noteBody]
    )
    const telegramMessage = await crmModel.addTelegramMessage(client, {
      userId,
      leadId: lead.id,
      role: 'user',
      message: telegram.text,
      telegramMessageId: telegram.messageId,
      createdAt: telegram.date,
    })
    await logActivity(client, userId, lead.id, 'telegram_message_received', 'Telegram message received', telegram.text, { telegramUserId: telegram.userId, chatId: telegram.chatId, messageId: telegram.messageId })
    await client.query('COMMIT')
    return { lead, note: note.rows[0], telegramMessage, isNew, userId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function saveAiReply({ userId, leadId, reply, model, prompt, telegramResponse }) {
  const noteBody = `AI reply sent: ${reply}`
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const followUp = await client.query(
      `INSERT INTO crm_followups(lead_id, user_id, message, model, prompt)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, lead_id, user_id, message, model, created_at`,
      [leadId, userId, reply, model, prompt]
    )
    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, body)
       VALUES($1, $2, $3)
       RETURNING id, lead_id, user_id, body, created_at`,
      [leadId, userId, noteBody]
    )
    await crmModel.addTelegramMessage(client, {
      userId,
      leadId,
      role: 'assistant',
      message: reply,
      telegramMessageId: telegramResponse?.result?.message_id || telegramResponse?.message_id || null,
    })
    await client.query("UPDATE crm_leads SET notes = COALESCE(notes || E'\n', '') || $3, updated_at = NOW() WHERE id = $1 AND user_id = $2", [leadId, userId, noteBody])
    await logActivity(client, userId, leadId, 'telegram_ai_reply_sent', 'AI reply sent', reply, { model })
    await client.query('COMMIT')
    return { followUp: followUp.rows[0], note: note.rows[0] }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function sendTelegramMessage(chatId, text) {
  const token = normalizeText(process.env.TELEGRAM_BOT_TOKEN)
  if (!token) throw Object.assign(new Error('TELEGRAM_BOT_TOKEN is not configured'), { statusCode: 503 })
  const { data } = await axios.post(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  }, { timeout: Number(process.env.TELEGRAM_TIMEOUT_MS || 15000) })
  return data
}

async function sendTelegramMessageToLead({ userId, leadId, text }) {
  const message = normalizeText(text)
  if (!message) throw Object.assign(new Error('Telegram message is required'), { statusCode: 400 })
  const lead = await crmModel.listLeads(userId).then((leads) => leads.find((item) => item.id === leadId))
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const chatId = lead?.metadata?.telegramChatId || lead.telegramId || null
  if (!chatId) throw Object.assign(new Error('Lead has no Telegram chat id'), { statusCode: 400 })
  const telegramResponse = await sendTelegramMessage(chatId, message)
  const telegramMessage = await crmModel.appendOutgoingTelegramMessage({ userId, leadId, message, telegramResponse })
  return { telegramMessage, telegramResponse }
}

async function notifyManager({ telegram, lead, isNew }) {
  const managerChatId = normalizeText(process.env.TELEGRAM_MANAGER_CHAT_ID)
  if (!managerChatId) return null

  const url = leadUrl(lead.id)
  const lines = [
    isNew ? '🔥 Новый Telegram лид' : '💬 Telegram лид написал снова',
    `Имя: ${telegram.name}`,
    `Username: ${telegram.username || '—'}`,
    `Сообщение: ${telegram.text}`,
  ]
  if (url) lines.push(`Лид: ${url}`)
  return sendTelegramMessage(managerChatId, lines.join('\n'))
}

async function processTelegramUpdate(update) {
  const telegram = extractTelegramMessage(update)
  if (!telegram) return { skipped: true, reason: 'No supported Telegram text message' }

  const crmResult = await upsertLeadWithIncomingMessage(telegram)
  if (crmResult.isNew) {
    notifyManager({ telegram, lead: crmResult.lead, isNew: true }).catch((error) => {
      console.warn('Failed to notify Telegram manager', error.message)
    })
  }

  const memory = await crmModel.getTelegramMemory(crmResult.userId, crmResult.lead.id, 10)
  const emailWorkflow = await runTelegramEmailWorkflow({ userId: crmResult.userId, lead: crmResult.lead, incomingMessage: telegram.text })
  if (emailWorkflow?.handled) {
    const telegramResponse = await sendTelegramMessage(telegram.chatId, emailWorkflow.reply)
    await saveAiReply({
      userId: crmResult.userId,
      leadId: crmResult.lead.id,
      reply: emailWorkflow.reply,
      model: 'action-executor-email',
      prompt: { action: 'email_materials', intent: emailWorkflow.intent, success: emailWorkflow.success, error: emailWorkflow.error || null },
      telegramResponse,
    })
    return { skipped: false, leadId: crmResult.lead.id, isNew: crmResult.isNew, telegramResponse, emailWorkflow }
  }

  const generated = await generateTelegramSalesReply({ lead: crmResult.lead, incomingMessage: telegram.text, memory })
  const telegramResponse = await sendTelegramMessage(telegram.chatId, generated.message)
  await saveAiReply({ userId: crmResult.userId, leadId: crmResult.lead.id, reply: generated.message, model: generated.model, prompt: generated.prompt, telegramResponse })

  return { skipped: false, leadId: crmResult.lead.id, isNew: crmResult.isNew, telegramResponse, emailWorkflow }
}

module.exports = {
  detectEmailMaterialIntent,
  extractEmail,
  extractTelegramMessage,
  processTelegramUpdate,
  sendTelegramMessageToLead,
}
