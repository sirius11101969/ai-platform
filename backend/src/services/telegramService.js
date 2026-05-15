const axios = require('axios')
const pool = require('../db/pool')
const { generateTelegramSalesReply } = require('./crmAiService')

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
    usernameClause = `OR telegram = $${params.length}`
  }

  const result = await client.query(
    `SELECT id, user_id, name, email, phone, telegram, company, status, value, source, notes, metadata, created_at, updated_at
       FROM crm_leads
      WHERE user_id = $1
        AND source = 'telegram'
        AND ((metadata->>'telegramUserId') = $2 ${usernameClause})
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
                source = 'telegram',
                notes = COALESCE(notes || E'\n', '') || $5,
                metadata = COALESCE(metadata, '{}'::jsonb) || $6::jsonb,
                contact = COALESCE($4, telegram, phone, email, contact),
                updated_at = NOW()
          WHERE user_id = $1 AND id = $2
          RETURNING id, user_id, name, email, phone, telegram, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, existing.id, telegram.name, telegram.username, noteBody, metadata]
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
        `INSERT INTO crm_leads(user_id, name, telegram, status, value, source, notes, contact, stage, metadata)
         VALUES($1, $2, $3, 'new', 0, 'telegram', $4, $3, 'new', $5::jsonb)
         RETURNING id, user_id, name, email, phone, telegram, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, telegram.name, telegram.username || `tg:${telegram.userId}`, noteBody, metadata]
      )
      lead = created.rows[0]
      await logActivity(client, userId, lead.id, 'lead_created', 'Лид создан', 'Новый Telegram лид добавлен в этап «Новый».', { source: 'telegram' })
    }

    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, body)
       VALUES($1, $2, $3)
       RETURNING id, lead_id, user_id, body, created_at`,
      [lead.id, userId, noteBody]
    )
    await logActivity(client, userId, lead.id, 'telegram_message_received', 'Telegram message received', telegram.text, { telegramUserId: telegram.userId, chatId: telegram.chatId, messageId: telegram.messageId })
    await client.query('COMMIT')
    return { lead, note: note.rows[0], isNew, userId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function saveAiReply({ userId, leadId, reply, model, prompt }) {
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
    await client.query("UPDATE crm_leads SET notes = COALESCE(notes || E'\\n', '') || $3, updated_at = NOW() WHERE id = $1 AND user_id = $2", [leadId, userId, noteBody])
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

  const generated = await generateTelegramSalesReply({ lead: crmResult.lead, incomingMessage: telegram.text })
  await saveAiReply({ userId: crmResult.userId, leadId: crmResult.lead.id, reply: generated.message, model: generated.model, prompt: generated.prompt })
  const telegramResponse = await sendTelegramMessage(telegram.chatId, generated.message)

  return { skipped: false, leadId: crmResult.lead.id, isNew: crmResult.isNew, telegramResponse }
}

module.exports = {
  extractTelegramMessage,
  processTelegramUpdate,
}
