const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')
const pool = require('../db/pool')
const { generateTelegramSalesReply } = require('./crmAiService')
const crmModel = require('../models/crmModel')
const { ensureDefaultWorkspace } = require('../models/workspaceModel')
const emailService = require('./emailService')

const TELEGRAM_API_BASE = 'https://api.telegram.org'
const DEMO_SITE_URL = 'https://www.as6.ru'
const MATERIALS_DIR = path.resolve(__dirname, '../../assets/materials')
const MATERIAL_FILES = {
  presentation: { fileName: 'presentation.pdf', method: 'sendDocument', field: 'document', label: 'презентация' },
  video: { fileName: 'demo.mp4', method: 'sendVideo', field: 'video', label: 'видео' },
  screenshots: [
    { fileName: 'screenshot-1.png', method: 'sendPhoto', field: 'photo', label: 'скриншот 1' },
    { fileName: 'screenshot-2.png', method: 'sendPhoto', field: 'photo', label: 'скриншот 2' },
  ],
}

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



const TELEGRAM_DELIVERY_PATTERN = /(?:\btelegram\b|телеграм|сюда|здесь|в\s+(?:этот\s+)?чат|в\s+чат|прямо\s+сюда)/i
const EMAIL_DELIVERY_PATTERN = /(?:email|e-mail|почт[ауые]|на\s+мейл|по\s+почте)/i
const TELEGRAM_MATERIAL_ACTION_PATTERN = /(?:отправь|пришли|вышли|скинь|перешли|send)/i
const MATERIAL_KEYWORD_PATTERNS = {
  presentation: /(?:презентац|презу|presentation|pdf|слайды?)/i,
  video: /(?:видео|video|ролик|demo\s*mp4|mp4)/i,
  screenshots: /(?:скриншот|скрины|скрин|screenshots?|screen|фото|изображени)/i,
  materials: /(?:материал|materials?|демо\s*материал)/i,
}

function detectTelegramMaterialIntent(text) {
  const normalized = String(text || '')
  if (!TELEGRAM_MATERIAL_ACTION_PATTERN.test(normalized)) return null
  if (EMAIL_DELIVERY_PATTERN.test(normalized) && !TELEGRAM_DELIVERY_PATTERN.test(normalized)) return null
  const hasTelegramDestination = TELEGRAM_DELIVERY_PATTERN.test(normalized)
  const requested = []
  for (const type of ['presentation', 'video', 'screenshots']) {
    if (MATERIAL_KEYWORD_PATTERNS[type].test(normalized)) requested.push(type)
  }
  const asksForMaterials = MATERIAL_KEYWORD_PATTERNS.materials.test(normalized)
  if (asksForMaterials && requested.length === 0) requested.push('presentation', 'video', 'screenshots')
  if (!hasTelegramDestination || requested.length === 0) return null
  return {
    delivery: 'telegram',
    requested: [...new Set(requested)],
    label: buildMaterialLabel([...new Set(requested)]),
  }
}

function buildMaterialLabel(types) {
  const labels = {
    presentation: 'презентация',
    video: 'видео',
    screenshots: 'скриншоты',
  }
  return types.map((type) => labels[type] || type).join(', ')
}

function materialEntriesForTypes(types) {
  return types.flatMap((type) => {
    const configured = MATERIAL_FILES[type]
    if (!configured) return []
    return Array.isArray(configured) ? configured : [configured]
  })
}

function resolveMaterialFiles(types) {
  const entries = materialEntriesForTypes(types)
  const available = []
  const missingTypes = []

  for (const type of types) {
    const typeEntries = materialEntriesForTypes([type])
    const existing = typeEntries
      .map((entry) => ({ ...entry, type, filePath: path.join(MATERIALS_DIR, entry.fileName) }))
      .filter((entry) => fs.existsSync(entry.filePath))
    if (existing.length > 0) available.push(...existing)
    else missingTypes.push(type)
  }

  return { available, missingTypes, requestedFiles: entries.map((entry) => entry.fileName) }
}

function buildMissingMaterialsReply(missingTypes) {
  const labels = {
    presentation: 'презентации',
    video: 'видео',
    screenshots: 'скриншотов',
  }
  const label = missingTypes.map((type) => labels[type] || type).join('/') || 'материалов'
  return `Материал пока не загружен на сервер: ${label}. Могу отправить ссылку на демо-сайт и краткое описание.`
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
  const workspace = await ensureDefaultWorkspace(userId)
  const attachments = await emailService.listAttachments(userId, workspace.id, leadId)
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
      WHERE user_id = $1 AND workspace_id = $11 AND id = $2`,
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

async function logActivity(client, userId, workspaceId, leadId, type, title, body = null, metadata = {}) {
  await client.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [userId, workspaceId, leadId, type, title, body, metadata]
  )
}

async function findTelegramLead(client, userId, workspaceId, telegram) {
  const params = [userId, workspaceId, telegram.userId, String(telegram.chatId)]
  let usernameClause = ''
  if (telegram.username) {
    params.push(telegram.username)
    usernameClause = `OR telegram = $${params.length} OR telegram_username = $${params.length}`
  }

  const result = await client.query(
    `SELECT id, user_id, workspace_id, name, email, phone, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at
       FROM crm_leads
      WHERE user_id = $1
        AND workspace_id = $2
        AND source = 'telegram'
        AND (telegram_id = $3 OR telegram_chat_id = $4 OR (metadata->>'telegramUserId') = $3 OR (metadata->>'telegramChatId') = $4 ${usernameClause})
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
    const workspace = await ensureDefaultWorkspace(userId, client)
    const workspaceId = workspace.id
    const existing = await findTelegramLead(client, userId, workspaceId, telegram)
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
                telegram_chat_id = $12,
                telegram_username = COALESCE($4, telegram_username),
                telegram_first_name = COALESCE($6, telegram_first_name),
                telegram_last_name = COALESCE($7, telegram_last_name),
                first_name = COALESCE($6, first_name),
                last_name = COALESCE($7, last_name),
                status = COALESCE(NULLIF(status, ''), 'new'),
                stage = COALESCE(NULLIF(stage, ''), 'new'),
                source = 'telegram',
                notes = COALESCE(notes || E'\n', '') || $8,
                metadata = COALESCE(metadata, '{}'::jsonb) || $9::jsonb,
                contact = COALESCE($4, telegram, phone, email, contact),
                last_message_at = $10::timestamptz,
                last_seen_at = NOW(),
                updated_at = NOW()
          WHERE user_id = $1 AND workspace_id = $11 AND id = $2
          RETURNING id, user_id, workspace_id, name, email, phone, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, existing.id, telegram.name, telegram.username, telegram.userId, telegram.firstName, telegram.lastName, noteBody, metadata, telegram.date, workspaceId, String(telegram.chatId)]
      )
      lead = updated.rows[0]
      await logActivity(client, userId, workspaceId, lead.id, 'telegram_lead_updated', 'Telegram лид обновлён', 'Лид обновлён новым сообщением Telegram.', { telegramUserId: telegram.userId, chatId: telegram.chatId })
    } else {
      isNew = true
      const metadata = {
        telegramUserId: telegram.userId,
        telegramChatId: String(telegram.chatId),
        telegramLastMessageId: telegram.messageId,
        telegramLastMessageAt: telegram.date,
      }
      const created = await client.query(
        `INSERT INTO crm_leads(user_id, workspace_id, name, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, status, value, source, notes, contact, stage, metadata, last_message_at, last_seen_at)
         VALUES($1, $11, $2, $3, $4, $12, $3, $5, $6, $5, $6, $7, 'new', 0, 'telegram', $8, $3, 'new', $9::jsonb, $10::timestamptz, NOW())
         RETURNING id, user_id, workspace_id, name, email, phone, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, telegram.name, telegram.username || `tg:${telegram.userId}`, telegram.userId, telegram.firstName, telegram.lastName, telegram.text, noteBody, metadata, telegram.date, workspaceId, String(telegram.chatId)]
      )
      lead = created.rows[0]
      await logActivity(client, userId, workspaceId, lead.id, 'lead_created', 'Лид создан', 'Новый Telegram лид добавлен в этап «Новый».', { source: 'telegram', stage: 'Новый' })
    }

    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, workspace_id, body)
       VALUES($1, $2, $4, $3)
       RETURNING id, lead_id, user_id, body, created_at`,
      [lead.id, userId, noteBody, workspaceId]
    )
    const telegramMessage = await crmModel.addTelegramMessage(client, {
      userId,
      workspaceId,
      leadId: lead.id,
      role: 'user',
      message: telegram.text,
      telegramChatId: telegram.chatId,
      telegramMessageId: telegram.messageId,
      createdAt: telegram.date,
    })
    await logActivity(client, userId, workspaceId, lead.id, 'telegram_message_received', 'Telegram message received', telegram.text, { telegramUserId: telegram.userId, chatId: telegram.chatId, messageId: telegram.messageId })
    await client.query('COMMIT')
    return { lead, note: note.rows[0], telegramMessage, isNew, userId, workspaceId }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function saveAiReply({ userId, workspaceId, leadId, reply, model, prompt, telegramResponse }) {
  const noteBody = `AI reply sent: ${reply}`
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const followUp = await client.query(
      `INSERT INTO crm_followups(lead_id, user_id, workspace_id, message, model, prompt)
       VALUES($1, $2, $6, $3, $4, $5)
       RETURNING id, lead_id, user_id, message, model, created_at`,
      [leadId, userId, reply, model, prompt, workspaceId]
    )
    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, workspace_id, body)
       VALUES($1, $2, $4, $3)
       RETURNING id, lead_id, user_id, body, created_at`,
      [leadId, userId, noteBody, workspaceId]
    )
    await crmModel.addTelegramMessage(client, {
      userId,
      workspaceId,
      leadId,
      role: 'assistant',
      message: reply,
      telegramChatId: telegramResponse?.result?.chat?.id || null,
      telegramMessageId: telegramResponse?.result?.message_id || telegramResponse?.message_id || null,
    })
    await client.query("UPDATE crm_leads SET notes = COALESCE(notes || E'\n', '') || $3, last_message_at = NOW(), updated_at = NOW() WHERE id = $1 AND user_id = $2 AND workspace_id = $4", [leadId, userId, noteBody, workspaceId])
    await logActivity(client, userId, workspaceId, leadId, 'telegram_ai_reply_sent', 'AI reply sent', reply, { model })
    await client.query('COMMIT')
    return { followUp: followUp.rows[0], note: note.rows[0] }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function getTelegramToken() {
  const token = normalizeText(process.env.TELEGRAM_BOT_TOKEN)
  if (!token) throw Object.assign(new Error('TELEGRAM_BOT_TOKEN is not configured'), { statusCode: 503 })
  return token
}

async function sendTelegramMessage(chatId, text) {
  const token = getTelegramToken()
  const { data } = await axios.post(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  }, { timeout: Number(process.env.TELEGRAM_TIMEOUT_MS || 15000) })
  return data
}

async function sendTelegramFile(chatId, material) {
  const token = getTelegramToken()
  const form = new FormData()
  form.append('chat_id', String(chatId))
  form.append(material.field, fs.createReadStream(material.filePath), material.fileName)
  form.append('caption', material.label)

  const { data } = await axios.post(`${TELEGRAM_API_BASE}/bot${token}/${material.method}`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: Number(process.env.TELEGRAM_FILE_TIMEOUT_MS || process.env.TELEGRAM_TIMEOUT_MS || 30000),
  })
  return data
}

async function recordTelegramMaterialActivity({ userId, workspaceId, leadId, type, title, body, metadata }) {
  await pool.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [userId, workspaceId, leadId, type, title, body, metadata || {}]
  )
}

async function runTelegramMaterialWorkflow({ userId, workspaceId, leadId, chatId, incomingMessage }) {
  const intent = detectTelegramMaterialIntent(incomingMessage)
  if (!intent) return null

  const { available, missingTypes, requestedFiles } = resolveMaterialFiles(intent.requested)
  const sent = []
  for (const material of available) {
    const telegramResponse = await sendTelegramFile(chatId, material)
    sent.push({
      type: material.type,
      fileName: material.fileName,
      method: material.method,
      telegramMessageId: telegramResponse?.result?.message_id || telegramResponse?.message_id || null,
    })
  }

  if (sent.length > 0) {
    await recordTelegramMaterialActivity({
      userId,
      workspaceId,
      leadId,
      type: 'telegram_material_sent',
      title: 'Материалы отправлены в Telegram',
      body: sent.map((item) => item.fileName).join(', '),
      metadata: { intent, sent, missingTypes, requestedFiles },
    })
  }

  let reply = null
  let linkResponse = null
  if (missingTypes.length > 0) {
    reply = buildMissingMaterialsReply(missingTypes)
    const missingResponse = await sendTelegramMessage(chatId, reply)
    linkResponse = await sendTelegramMessage(chatId, DEMO_SITE_URL)
    await recordTelegramMaterialActivity({
      userId,
      workspaceId,
      leadId,
      type: 'telegram_material_missing',
      title: 'Материалы отсутствуют для Telegram',
      body: buildMaterialLabel(missingTypes),
      metadata: { intent, missingTypes, requestedFiles, demoUrl: DEMO_SITE_URL },
    })
    return {
      handled: true,
      success: sent.length > 0,
      intent,
      sent,
      missingTypes,
      reply: sent.length > 0 ? `Отправил доступные материалы в Telegram. ${reply}
${DEMO_SITE_URL}` : `${reply}
${DEMO_SITE_URL}`,
      telegramResponse: missingResponse,
      linkResponse,
    }
  }

  reply = `Готово, отправил ${intent.label} прямо сюда в Telegram.`
  const telegramResponse = await sendTelegramMessage(chatId, reply)
  return { handled: true, success: true, intent, sent, missingTypes, reply, telegramResponse }
}

async function sendTelegramMessageToLead({ userId, workspaceId, leadId, text }) {
  const message = normalizeText(text)
  if (!message) throw Object.assign(new Error('Telegram message is required'), { statusCode: 400 })
  const lead = await crmModel.listLeads(userId, workspaceId).then((leads) => leads.find((item) => item.id === leadId))
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const chatId = lead.telegramChatId || lead?.metadata?.telegramChatId || null
  if (!chatId) throw Object.assign(new Error('У лида нет Telegram chat id. Отправка в Telegram недоступна.'), { statusCode: 400 })
  const telegramResponse = await sendTelegramMessage(chatId, message)
  const telegramMessage = await crmModel.appendOutgoingTelegramMessage({ userId, workspaceId, leadId, message, telegramResponse })
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

  const memory = await crmModel.getTelegramMemory(crmResult.userId, crmResult.workspaceId, crmResult.lead.id, 10)
  const materialWorkflow = await runTelegramMaterialWorkflow({ userId: crmResult.userId, workspaceId: crmResult.workspaceId, leadId: crmResult.lead.id, chatId: telegram.chatId, incomingMessage: telegram.text })
  if (materialWorkflow?.handled) {
    await saveAiReply({
      userId: crmResult.userId,
      workspaceId: crmResult.workspaceId,
      leadId: crmResult.lead.id,
      reply: materialWorkflow.reply,
      model: 'action-executor-telegram-materials',
      prompt: { action: 'telegram_materials', intent: materialWorkflow.intent, sent: materialWorkflow.sent, missingTypes: materialWorkflow.missingTypes },
      telegramResponse: materialWorkflow.telegramResponse,
    })
    return { skipped: false, leadId: crmResult.lead.id, isNew: crmResult.isNew, telegramResponse: materialWorkflow.telegramResponse, materialWorkflow }
  }

  const emailWorkflow = await runTelegramEmailWorkflow({ userId: crmResult.userId, lead: crmResult.lead, incomingMessage: telegram.text })
  if (emailWorkflow?.handled) {
    const telegramResponse = await sendTelegramMessage(telegram.chatId, emailWorkflow.reply)
    await saveAiReply({
      userId: crmResult.userId,
      workspaceId: crmResult.workspaceId,
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
  await saveAiReply({ userId: crmResult.userId, workspaceId: crmResult.workspaceId, leadId: crmResult.lead.id, reply: generated.message, model: generated.model, prompt: generated.prompt, telegramResponse })

  return { skipped: false, leadId: crmResult.lead.id, isNew: crmResult.isNew, telegramResponse, emailWorkflow }
}

module.exports = {
  detectEmailMaterialIntent,
  detectTelegramMaterialIntent,
  extractEmail,
  extractTelegramMessage,
  processTelegramUpdate,
  sendTelegramMessageToLead,
}
