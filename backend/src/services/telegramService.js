const fs = require('fs')
const path = require('path')
const axios = require('axios')
const FormData = require('form-data')
const pool = require('../db/pool')
const { generateTelegramSalesReply } = require('./crmAiService')
const crmModel = require('../models/crmModel')
const { addTimelineEvent } = require('./timelineService')
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

  const hasEmailDestination = EMAIL_DELIVERY_PATTERN.test(normalized)
  const hasEmailAddress = Boolean(extractEmail(normalized))
  const hasTelegramDestination = TELEGRAM_DELIVERY_PATTERN.test(normalized)

  // Explicit email requests must stay on the email path. Generic Telegram chat
  // requests like “отправь презентацию” should not fall through to email just
  // because the lead already has an email saved in CRM.
  if (hasEmailDestination && !hasTelegramDestination) return null
  if (hasEmailAddress && !hasTelegramDestination) return null

  const requested = []
  for (const type of ['presentation', 'video', 'screenshots']) {
    if (MATERIAL_KEYWORD_PATTERNS[type].test(normalized)) requested.push(type)
  }

  // In Telegram, a generic “пришли материалы” means the primary presentation
  // PDF. Do not try to send every optional demo asset or switch to email.
  const asksForMaterials = MATERIAL_KEYWORD_PATTERNS.materials.test(normalized)
  if (asksForMaterials && requested.length === 0) requested.push('presentation')

  if (requested.length === 0) return null
  const uniqueRequested = [...new Set(requested)]
  return {
    delivery: 'telegram',
    requested: uniqueRequested,
    label: buildMaterialLabel(uniqueRequested),
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
  if (missingTypes.length === 1 && missingTypes[0] === 'presentation') {
    return `Презентация пока не загружена на сервер. Могу отправить ссылку на сайт: ${DEMO_SITE_URL}`
  }

  const labels = {
    presentation: 'презентации',
    video: 'видео',
    screenshots: 'скриншотов',
  }
  const label = missingTypes.map((type) => labels[type] || type).join('/') || 'материалов'
  return `Материал пока не загружен на сервер: ${label}. Могу отправить ссылку на сайт: ${DEMO_SITE_URL}`
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

async function resolveIntentAttachmentIds(userId, workspaceId, leadId, intent) {
  const workspace = workspaceId ? { id: workspaceId } : await ensureDefaultWorkspace(userId)
  const attachments = await emailService.listAttachments(userId, workspace.id, leadId)
  return attachments.filter((attachment) => attachmentMatchesIntent(attachment, intent)).slice(0, 6).map((attachment) => attachment.id)
}

async function persistLeadEmailFromMessage(userId, workspaceId, leadId, email) {
  if (!email) return
  await pool.query(
    `UPDATE crm_leads
        SET email = COALESCE(email, $3),
            contact = COALESCE(contact, $3),
            metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('emailFromTelegram', $3),
            updated_at = NOW()
      WHERE user_id = $1 AND workspace_id = $4 AND id = $2`,
    [userId, leadId, email, workspaceId]
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
    await persistLeadEmailFromMessage(userId, lead.workspaceId, lead.id, intent.email)
    const attachmentIds = await resolveIntentAttachmentIds(userId, lead.workspaceId, lead.id, intent)
    const email = await emailService.sendEmailNow(userId, {
      workspaceId: lead.workspaceId,
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


function extractStartPayload(text) {
  const match = String(text || '').trim().match(/^\/start(?:\s+(.+))?$/i)
  return match ? normalizeText(match[1]) : null
}

function extractLeadIdFromStartPayload(payload) {
  const match = String(payload || '').trim().match(/^lead_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)
  return match ? match[1] : null
}

function buildReplyAnalysisRecommendation(lead, text) {
  const normalized = String(text || '').toLowerCase()
  if (/цен|стоимост|прайс|кп|предложен|budget|price/.test(normalized)) return 'Уточнить бюджет и отправить короткое коммерческое предложение с вариантами пилота.'
  if (/демо|созвон|встреч|слот|завтра|сегодня|calendar|календар/.test(normalized)) return 'Предложить 2–3 слота для короткого demo и подтвердить ключевой сценарий клиента.'
  if (/не актуально|не интересно|позже|нет бюджета|отказ/.test(normalized)) return 'Зафиксировать возражение, мягко уточнить причину и предложить вернуться к разговору позже.'
  return `Ответить ${lead.name || 'лиду'} в Telegram: поблагодарить за сообщение, уточнить текущую задачу и предложить следующий шаг по AS6 AI CRM.`
}

async function handleTelegramStartPayload(telegram, payload) {
  const leadId = extractLeadIdFromStartPayload(payload)
  if (!leadId) {
    const telegramResponse = await sendTelegramMessage(telegram.chatId, 'Не удалось найти заявку по этой ссылке. Напишите менеджеру AS6, и мы поможем подключить Telegram к CRM.')
    return { skipped: false, startHandled: true, connected: false, reason: 'Invalid start payload', telegramResponse }
  }

  const client = await pool.connect()
  let connectedLead = null
  try {
    await client.query('BEGIN')
    const leadResult = await client.query(
      `SELECT id, user_id, workspace_id, name, telegram_chat_id, telegram_username, telegram, metadata, status
         FROM crm_leads
        WHERE id = $1
        FOR UPDATE`,
      [leadId]
    )
    const lead = leadResult.rows[0]
    if (!lead) {
      await client.query('ROLLBACK')
      const telegramResponse = await sendTelegramMessage(telegram.chatId, 'Заявка по этой ссылке не найдена. Напишите менеджеру AS6, и мы поможем подключить Telegram к CRM.')
      return { skipped: false, startHandled: true, connected: false, reason: 'Lead not found', telegramResponse }
    }

    const clearedDuplicates = await client.query(
      `UPDATE crm_leads
          SET telegram_chat_id = NULL,
              telegram_id = CASE WHEN telegram_id = $3 THEN NULL ELSE telegram_id END,
              metadata = CASE
                WHEN metadata ? 'telegramChatId' THEN metadata - 'telegramChatId'
                ELSE metadata
              END,
              updated_at = NOW()
        WHERE telegram_chat_id = $1
          AND id <> $2`,
      [String(telegram.chatId), lead.id, telegram.userId]
    )
    if (clearedDuplicates.rowCount > 0) {
      console.warn('[telegram] duplicate chat_id prevented', { chatId: String(telegram.chatId) })
    }

    const metadata = {
      ...(lead.metadata || {}),
      telegramUserId: telegram.userId,
      telegramChatId: String(telegram.chatId),
      telegramConnectedAt: new Date().toISOString(),
      telegramConnectPayload: payload,
    }
    const updated = await client.query(
      `UPDATE crm_leads
          SET telegram_chat_id = $2,
              telegram_id = COALESCE(telegram_id, $3),
              telegram_username = COALESCE($4, telegram_username, telegram),
              telegram = COALESCE(telegram, $4),
              telegram_first_name = COALESCE($5, telegram_first_name),
              telegram_last_name = COALESCE($6, telegram_last_name),
              first_name = COALESCE(first_name, $5),
              last_name = COALESCE(last_name, $6),
              contact = COALESCE(contact, telegram, phone, email, $4),
              last_seen_at = NOW(),
              metadata = COALESCE(metadata, '{}'::jsonb) || $7::jsonb,
              updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, workspace_id, name`,
      [lead.id, String(telegram.chatId), telegram.userId, telegram.username, telegram.firstName, telegram.lastName, metadata]
    )
    connectedLead = updated.rows[0]
    await logActivity(client, connectedLead.user_id, connectedLead.workspace_id, connectedLead.id, 'telegram_connected', 'Telegram подключён', 'Клиент открыл deep-link и нажал Start.', { chatId: telegram.chatId, telegramUserId: telegram.userId, payload })
    await addTimelineEvent(client, { workspaceId: connectedLead.workspace_id, leadId: connectedLead.id, userId: connectedLead.user_id, eventType: 'telegram_connected', title: 'Telegram подключён', body: 'Клиент открыл ссылку подключения и нажал Start.', source: 'telegram', metadata: { chatId: telegram.chatId, telegramUserId: telegram.userId, payload } })
    console.info('[telegram] lead connected', { leadId: connectedLead.id, chatId: String(telegram.chatId) })
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const telegramResponse = await sendTelegramMessage(telegram.chatId, 'Telegram подключён. Теперь менеджер сможет отправлять материалы и отвечать по вашей заявке.')
  return { skipped: false, startHandled: true, connected: true, leadId: connectedLead.id, telegramResponse }
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
  const baseUrl = normalizeText(process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN)
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

async function findExistingLeadByTelegramChatId(client, chatId) {
  const result = await client.query(
    `SELECT id, user_id, workspace_id, name, email, phone, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at
       FROM crm_leads
      WHERE telegram_chat_id = $1
      ORDER BY updated_at DESC
      LIMIT 1
      FOR UPDATE`,
    [String(chatId)]
  )
  return result.rows[0] || null
}

async function findTelegramLead(client, userId, workspaceId, telegram) {
  const byChat = await client.query(
    `SELECT l.id, l.user_id, l.workspace_id, l.name, l.email, l.phone, l.telegram, l.telegram_id, l.telegram_chat_id, l.telegram_username, l.telegram_first_name, l.telegram_last_name, l.first_name, l.last_name, l.first_message, l.last_message_at, l.last_seen_at, l.company, l.status, l.value, l.source, l.notes, l.metadata, l.created_at, l.updated_at
       FROM crm_leads l
       LEFT JOIN LATERAL (
         SELECT MAX(e.created_at) AS connected_at
           FROM lead_timeline_events e
          WHERE e.workspace_id = l.workspace_id
            AND e.lead_id = l.id
            AND e.event_type = 'telegram_connected'
       ) telegram_connection ON true
      WHERE l.user_id = $1
        AND l.workspace_id = $2
        AND l.telegram_chat_id = $3
      ORDER BY
        CASE WHEN LOWER(TRIM(COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new'))) NOT IN ('won','lost','closed_won','closed_lost','successful','потеряно','успешно') THEN 0 ELSE 1 END,
        telegram_connection.connected_at DESC NULLS LAST,
        l.updated_at DESC,
        l.created_at DESC
      LIMIT 1
      FOR UPDATE OF l`,
    [userId, workspaceId, String(telegram.chatId)]
  )
  if (byChat.rows[0]) return byChat.rows[0]

  const params = [userId, workspaceId, telegram.userId]
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
        AND (telegram_id = $3 OR (metadata->>'telegramUserId') = $3 ${usernameClause})
      ORDER BY updated_at DESC
      LIMIT 1
      FOR UPDATE`,
    params
  )
  return result.rows[0] || null
}

async function ensureTelegramApprovalWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI Telegram Reply Assistant', 'ai_telegram_assistant', 'active', 'approval_required', 'Готовит черновики ответов Telegram после входящих сообщений. Отправка только после проверки менеджера.')
     ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [workspaceId]
  )
  return result.rows[0]
}

function nextStageSuggestion(currentStatus, text) {
  const normalized = String(text || '').toLowerCase()
  if (currentStatus === 'new' && /(интерес|актуальн|нужно|хочу|да|расскаж|стоимост|цена|demo|демо)/i.test(normalized)) return 'qualified'
  if (currentStatus === 'qualified' && /(кп|предложен|стоимост|цена|proposal|смет|договор)/i.test(normalized)) return 'proposal'
  if (currentStatus === 'proposal' && /(встреч|созвон|демо|calendar|календар|завтра|сегодня|слот)/i.test(normalized)) return 'booked'
  if (currentStatus === 'booked' && /(оплат|счет|счёт|договор|соглас|запуска|начинаем)/i.test(normalized)) return 'won'
  if (currentStatus === 'booked' && /(отказ|не актуально|не интересно|не будем|нет бюджета)/i.test(normalized)) return 'lost'
  return null
}


function buildTelegramStageReason(currentStatus, nextStage, text) {
  const normalized = String(text || '').toLowerCase()
  if (/демо|внедрен|интерес|детал/.test(normalized)) return 'Клиент подтвердил интерес к демо и запросил детали внедрения.'
  if (/встреч|созвон|слот|календар/.test(normalized)) return 'Клиент согласовал встречу.'
  if (/не актуально|не интересно|отказ|нет бюджета/.test(normalized)) return 'Клиент дал негативный сигнал или отказался от следующего шага.'
  if (nextStage === 'proposal') return 'Клиент обсуждает стоимость, предложение или условия внедрения.'
  return `AI предлагает сменить этап ${currentStatus} → ${nextStage} на основе ответа лида.`
}

async function createInboundReplyRecommendations(client, { userId, workspaceId, lead, telegram }) {
  const worker = await ensureTelegramApprovalWorker(client, workspaceId)
  await client.query(
    `UPDATE ai_followup_jobs
        SET status = 'replied', updated_at = NOW(), metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('repliedAt', NOW(), 'telegramMessageId', $3::text)
      WHERE workspace_id = $1 AND lead_id = $2 AND status IN ('suggested', 'approved') AND scheduled_for <= NOW() + INTERVAL '3 days'`,
    [workspaceId, lead.id, telegram.messageId]
  )

  const existingAnalysis = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1 AND lead_id = $2 AND action_type = 'telegram_reply_analysis'
        AND created_at > NOW() - INTERVAL '12 hours'
        AND status IN ('pending_approval', 'approved', 'executing', 'completed')
      LIMIT 1`,
    [workspaceId, lead.id]
  )
  if (!existingAnalysis.rows[0]) {
    const recommendation = buildReplyAnalysisRecommendation(lead, telegram.text)
    const analysis = await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, 'telegram_reply_analysis', 'pending_approval', $4, $5, $6)
       RETURNING id`,
      [worker.id, workspaceId, lead.id, `Проанализировать ответ Telegram — ${lead.name}`, recommendation, { source: 'telegram_inbound', channel: 'telegram', customerMessage: telegram.text, telegramMessageId: telegram.messageId, chatId: String(telegram.chatId), nextStep: recommendation }]
    )
    await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_next_action_generated', title: 'AI подготовил анализ ответа Telegram', body: recommendation, source: 'ai', metadata: { queueId: analysis.rows[0].id, actionType: 'telegram_reply_analysis' } })
  }

  const existingDraft = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1 AND lead_id = $2 AND action_type = 'telegram_draft'
        AND payload->>'outreachType' = 'inbound_reply_next_step'
        AND created_at > NOW() - INTERVAL '24 hours'
        AND status IN ('pending_approval', 'approved', 'executing', 'completed')
      LIMIT 1`,
    [workspaceId, lead.id]
  )
  if (!existingDraft.rows[0]) {
    const name = String(lead.first_name || lead.telegram_first_name || lead.name || 'Коллеги').split(/\s+/)[0]
    const text = `${name}, спасибо за ответ! Правильно понимаю, что сейчас главный следующий шаг — коротко разобрать ваш сценарий и показать, как AS6 AI CRM закроет Telegram/email follow-up без ручной рутины? Могу предложить 15 минут на demo.`
    const draft = await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, 'telegram_draft', 'pending_approval', $4, $5, $6)
       RETURNING id`,
      [worker.id, workspaceId, lead.id, `Telegram reply draft · ${lead.name}`, 'Ответ на входящее сообщение подготовлен и ожидает проверки менеджера.', { source: 'telegram_inbound', outreachType: 'inbound_reply_next_step', channel: 'telegram', text, message: text, customerMessage: telegram.text }]
    )
    await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_draft_created', title: 'Черновик Telegram подготовлен', body: text, source: 'ai', metadata: { queueId: draft.rows[0].id, actionType: 'telegram_draft', outreachType: 'inbound_reply_next_step' } })
  }

  const nextStage = nextStageSuggestion(lead.status, telegram.text)
  if (nextStage) {
    const existingStage = await client.query(
      `SELECT id FROM ai_worker_queue
        WHERE workspace_id = $1 AND lead_id = $2 AND action_type = 'stage_change_recommendation'
          AND payload->>'nextStatus' = $3
          AND created_at > NOW() - INTERVAL '24 hours'
          AND status IN ('pending_approval', 'approved', 'executing', 'completed')
        LIMIT 1`,
      [workspaceId, lead.id, nextStage]
    )
    if (!existingStage.rows[0]) {
      const stage = await client.query(
        `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
         VALUES($1, $2, $3, 'stage_change_recommendation', 'pending_approval', $4, $5, $6)
         RETURNING id`,
        [worker.id, workspaceId, lead.id, `AI stage suggestion · ${lead.status} → ${nextStage}`, buildTelegramStageReason(lead.status, nextStage, telegram.text), { source: 'telegram_inbound', currentStatus: lead.status, nextStatus: nextStage, status: nextStage, reason: buildTelegramStageReason(lead.status, nextStage, telegram.text), confidence: 82, customerMessage: telegram.text }]
      )
      await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_stage_suggested', title: 'AI предложил смену этапа', body: `${lead.status} → ${nextStage}`, source: 'ai', metadata: { queueId: stage.rows[0].id, nextStatus: nextStage } })
    }
  }
}

async function upsertLeadWithIncomingMessage(telegram, retryOnDuplicate = true) {
  const noteBody = [`Telegram message received`, `From: ${telegram.name}${telegram.username ? ` (${telegram.username})` : ''}`, `Message: ${telegram.text}`].join('\n')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let userId
    let workspaceId
    let existing = await findExistingLeadByTelegramChatId(client, telegram.chatId)

    if (existing) {
      userId = existing.user_id
      workspaceId = existing.workspace_id
      console.info('[telegram] inbound existing lead found', { leadId: existing.id, chatId: String(telegram.chatId) })
    } else {
      userId = await resolveCrmUserId(client)
      const workspace = await ensureDefaultWorkspace(userId, client)
      workspaceId = workspace.id
      existing = await findTelegramLead(client, userId, workspaceId, telegram)
    }

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
      const alreadyConnectedToChat = String(existing.telegram_chat_id || '') === String(telegram.chatId)
      const updated = await client.query(
        alreadyConnectedToChat
          ? `UPDATE crm_leads
                SET last_message_at = $3::timestamptz,
                    last_seen_at = NOW(),
                    metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb,
                    updated_at = NOW()
              WHERE user_id = $1 AND workspace_id = $5 AND id = $2
              RETURNING id, user_id, workspace_id, name, email, phone, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at`
          : `UPDATE crm_leads
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
        alreadyConnectedToChat
          ? [userId, existing.id, telegram.date, metadata, workspaceId]
          : [userId, existing.id, telegram.name, telegram.username, telegram.userId, telegram.firstName, telegram.lastName, noteBody, metadata, telegram.date, workspaceId, String(telegram.chatId)]
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
         ON CONFLICT (telegram_chat_id) WHERE telegram_chat_id IS NOT NULL DO UPDATE
           SET last_message_at = EXCLUDED.last_message_at,
               last_seen_at = NOW(),
               metadata = COALESCE(crm_leads.metadata, '{}'::jsonb) || EXCLUDED.metadata,
               updated_at = NOW()
         RETURNING (xmax = 0) AS inserted, id, user_id, workspace_id, name, email, phone, telegram, telegram_id, telegram_chat_id, telegram_username, telegram_first_name, telegram_last_name, first_name, last_name, first_message, last_message_at, last_seen_at, company, status, value, source, notes, metadata, created_at, updated_at`,
        [userId, telegram.name, telegram.username || `tg:${telegram.userId}`, telegram.userId, telegram.firstName, telegram.lastName, telegram.text, noteBody, metadata, telegram.date, workspaceId, String(telegram.chatId)]
      )
      lead = created.rows[0]
      isNew = Boolean(lead.inserted)
      if (isNew) {
        console.info('[telegram] inbound new lead created', { leadId: lead.id, chatId: String(telegram.chatId) })
        await logActivity(client, userId, workspaceId, lead.id, 'lead_created', 'Лид создан', 'Новый Telegram лид добавлен в этап «Новый».', { source: 'telegram', stage: 'Новый' })
      } else {
        userId = lead.user_id
        workspaceId = lead.workspace_id
        isNew = false
        console.warn('[telegram] duplicate chat_id prevented', { chatId: String(telegram.chatId) })
      }
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
    console.info('[telegram] inbound attached', { leadId: lead.id, chatId: String(telegram.chatId) })
    await logActivity(client, userId, workspaceId, lead.id, 'telegram_reply_received', 'Telegram reply received', telegram.text, { telegramUserId: telegram.userId, chatId: telegram.chatId, messageId: telegram.messageId })
    await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'telegram_reply_received', title: 'Получен ответ в Telegram', body: telegram.text, source: 'telegram', metadata: { telegramUserId: telegram.userId, chatId: telegram.chatId, messageId: telegram.messageId } })
    await createInboundReplyRecommendations(client, { userId, workspaceId, lead, telegram })
    await client.query('COMMIT')
    return { lead, note: note.rows[0], telegramMessage, isNew, userId, workspaceId }
  } catch (error) {
    await client.query('ROLLBACK')
    if (retryOnDuplicate && error?.code === '23505' && String(error.constraint || '').includes('telegram_chat_id')) {
      console.warn('[telegram] duplicate chat_id prevented', { chatId: String(telegram.chatId) })
      return upsertLeadWithIncomingMessage(telegram, false)
    }
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
  await recordTelegramMaterialActivity({
    userId,
    workspaceId,
    leadId,
    type: 'telegram_material_requested',
    title: 'Запрошены материалы в Telegram',
    body: buildMaterialLabel(intent.requested),
    metadata: { intent, requestedFiles },
  })

  const sent = []
  const failed = []
  for (const material of available) {
    try {
      const telegramResponse = await sendTelegramFile(chatId, material)
      sent.push({
        type: material.type,
        fileName: material.fileName,
        method: material.method,
        telegramMessageId: telegramResponse?.result?.message_id || telegramResponse?.message_id || null,
      })
    } catch (error) {
      console.error('Telegram material delivery failed', { leadId, fileName: material.fileName, error: error.message })
      failed.push({ type: material.type, fileName: material.fileName, error: error.message })
    }
  }

  if (sent.length > 0) {
    await recordTelegramMaterialActivity({
      userId,
      workspaceId,
      leadId,
      type: 'telegram_material_sent',
      title: 'Материалы отправлены в Telegram',
      body: sent.map((item) => item.fileName).join(', '),
      metadata: { intent, sent, missingTypes, failed, requestedFiles },
    })
  }

  if (failed.length > 0) {
    await recordTelegramMaterialActivity({
      userId,
      workspaceId,
      leadId,
      type: 'telegram_material_failed',
      title: 'Не удалось отправить материалы в Telegram',
      body: failed.map((item) => item.fileName).join(', '),
      metadata: { intent, failed, sent, missingTypes, requestedFiles },
    })
  }

  if (missingTypes.length > 0) {
    const reply = buildMissingMaterialsReply(missingTypes)
    const missingResponse = await sendTelegramMessage(chatId, reply)
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
      failed,
      missingTypes,
      reply,
      telegramResponse: missingResponse,
    }
  }

  if (failed.length > 0) {
    const reply = sent.length > 0
      ? `Часть материалов отправил в Telegram, но не удалось отправить: ${failed.map((item) => item.fileName).join(', ')}.`
      : `Пока не удалось отправить ${intent.label} в Telegram. Могу отправить ссылку на сайт: ${DEMO_SITE_URL}`
    const telegramResponse = await sendTelegramMessage(chatId, reply)
    return { handled: true, success: sent.length > 0, intent, sent, failed, missingTypes, reply, telegramResponse }
  }

  const reply = `Готово, отправил ${intent.label} прямо сюда в Telegram.`
  const telegramResponse = await sendTelegramMessage(chatId, reply)
  return { handled: true, success: true, intent, sent, failed, missingTypes, reply, telegramResponse }
}

async function sendTelegramMessageToLead({ userId, workspaceId, leadId, text }) {
  const message = normalizeText(text)
  if (!message) throw Object.assign(new Error('Telegram message is required'), { statusCode: 400 })
  const lead = await crmModel.listLeads(userId, workspaceId).then((leads) => leads.find((item) => item.id === leadId))
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const chatId = lead.telegramChatId || lead?.metadata?.telegramChatId || null
  if (!chatId) throw Object.assign(new Error('У лида нет Telegram chat id. Можно отправить email или написать вручную.'), { statusCode: 400 })
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

  if (/^\/start(?:\s|$)/i.test(telegram.text)) {
    const startPayload = extractStartPayload(telegram.text)
    return handleTelegramStartPayload(telegram, startPayload)
  }

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

  return { skipped: false, leadId: crmResult.lead.id, isNew: crmResult.isNew, approvalRequired: true, message: 'Черновик создан и ожидает проверки менеджера.', emailWorkflow }
}

module.exports = {
  detectEmailMaterialIntent,
  detectTelegramMaterialIntent,
  extractEmail,
  extractTelegramMessage,
  processTelegramUpdate,
  sendTelegramMessageToLead,
  _private: {
    findExistingLeadByTelegramChatId,
    upsertLeadWithIncomingMessage,
  },
}
