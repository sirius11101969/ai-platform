const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const emailService = require('./emailService')
const { sendTelegramMessageToLead } = require('./telegramService')
const { sendLeadAttachments } = require('./attachmentService')
const { addTimelineEvent } = require('./timelineService')
const { findDuplicateQueueItem, logDuplicateSkipped } = require('./aiQueueDedupService')

const STATUSES = ['pending_approval', 'approved', 'rejected', 'executing', 'completed', 'executed', 'failed', 'cancelled']
const TELEGRAM_MEETING_CONFIRMATION_DRAFT = 'telegram_meeting_confirmation_draft'
const EXECUTION_TYPES = ['telegram_reply_draft', TELEGRAM_MEETING_CONFIRMATION_DRAFT, 'telegram_followup', 'email_followup', 'send_demo_link', 'send_presentation', 'create_reminder', 'move_lead_stage', 'stage_change_recommendation', 'followup_24h', 'followup_3d', 'demo_offer', 'meeting_request', 'meeting_schedule_proposal']

const ACTION_ALIASES = {
  stage_change_recommendation: 'stage_change_recommendation',
  telegram_reply_draft: 'telegram_reply_draft',
  telegram_meeting_confirmation_draft: TELEGRAM_MEETING_CONFIRMATION_DRAFT,
  telegram_draft: 'telegram_followup',
  telegram_follow_up: 'telegram_followup',
  email_draft: 'email_followup',
  email_follow_up: 'email_followup',
  follow_up_recommendation: 'email_followup',
  followup_24h: 'followup_24h',
  followup_3d: 'followup_3d',
  demo_offer: 'demo_offer',
  meeting_request: 'meeting_request',
  meeting_schedule_proposal: 'meeting_schedule_proposal',
  crm_next_action: 'create_reminder',
  move_lead_stage: 'stage_change_recommendation',
  lead_prioritization: 'create_reminder',
}

function normalize(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    workerId: row.worker_id,
    workerName: row.worker_name || '',
    actionType: row.action_type,
    executionType: normalizeActionType(row.action_type),
    title: row.title,
    recommendation: row.recommendation || '',
    payload: row.payload || {},
    status: row.status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    executedAt: row.executed_at,
    errorMessage: row.error_message || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lead: row.lead_id ? {
      id: row.lead_id,
      name: row.lead_name || '',
      company: row.lead_company || '',
      email: row.lead_email || '',
      telegram: row.lead_telegram || '',
      telegramChatId: row.lead_telegram_chat_id || '',
      hasTelegramChatId: Boolean(row.lead_telegram_chat_id),
      status: row.lead_status || '',
    } : null,
  }
}

function normalizeActionType(actionType) {
  const value = String(actionType || '').trim()
  return ACTION_ALIASES[value] || value
}


function stageLabel(stage) {
  return ({ new: 'New', qualified: 'Qualified', proposal: 'Proposal', booked: 'Booked', won: 'Won', lost: 'Lost' }[stage] || stage || '—')
}

function getStageTo(item) {
  return item.payload.toStage || item.payload.nextStatus || item.payload.status
}

function getStageFrom(item) {
  return item.payload.fromStage || item.payload.currentStatus || item.lead?.status || ''
}

function russianError(message) {
  return Object.assign(new Error(message), { statusCode: 400 })
}

async function assertQueueItem(userId, workspaceId, queueId, client = pool) {
  const result = await client.query(
    `SELECT q.*, w.name AS worker_name, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.telegram AS lead_telegram, l.telegram_chat_id AS lead_telegram_chat_id, l.status AS lead_status
       FROM ai_worker_queue q
       JOIN ai_workers w ON w.id = q.worker_id AND w.workspace_id = q.workspace_id
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
      WHERE q.id = $1 AND q.workspace_id = $2
        AND EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $3)`,
    [queueId, workspaceId, userId]
  )
  if (!result.rows[0]) throw Object.assign(new Error('AI действие не найдено или недоступно в этом рабочем пространстве'), { statusCode: 404 })
  return normalize(result.rows[0])
}

async function saveAudit(client, { workspaceId, leadId, userId, type, title, body, source = 'ai', metadata = {} }) {
  if (leadId) {
    await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: type, title, body, source, metadata })
  }
  await client.query(
    `INSERT INTO crm_activity(workspace_id, user_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [workspaceId, userId, leadId || null, type, title, body, metadata]
  )
}

async function listQueue(userId, workspaceId, filters = {}) {
  const values = [workspaceId, userId]
  const clauses = [
    'q.workspace_id = $1',
    'EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $2)',
  ]
  if (filters.leadId) {
    values.push(filters.leadId)
    clauses.push(`q.lead_id = $${values.length}`)
  }
  if (filters.status) {
    values.push(String(filters.status))
    clauses.push(`q.status = $${values.length}`)
  }
  const result = await pool.query(
    `SELECT q.*, w.name AS worker_name, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.telegram AS lead_telegram, l.telegram_chat_id AS lead_telegram_chat_id, l.status AS lead_status
       FROM ai_worker_queue q
       JOIN ai_workers w ON w.id = q.worker_id AND w.workspace_id = q.workspace_id
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY q.created_at DESC
      LIMIT 200`,
    values
  )
  return result.rows.map(normalize)
}

async function updateQueueItem(userId, workspaceId, queueId, payload) {
  const current = await assertQueueItem(userId, workspaceId, queueId)
  if (['executing', 'completed', 'executed'].includes(current.status)) throw russianError('Нельзя изменить AI действие во время или после выполнения')
  const updates = []
  const values = [workspaceId, queueId]
  function set(column, value) { values.push(value); updates.push(`${column} = $${values.length}`) }
  if (payload.title !== undefined) set('title', String(payload.title || current.title).trim() || current.title)
  if (payload.recommendation !== undefined) set('recommendation', String(payload.recommendation || ''))
  if (payload.payload !== undefined) {
    const nextPayload = payload.payload || {}
    if (current.executionType === 'telegram_reply_draft' || current.executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT) {
      const editedText = nextPayload.editedText ?? nextPayload.edited_text
      const normalizedEditedText = editedText !== undefined ? String(editedText || '').trim() : ''
      if (normalizedEditedText) {
        nextPayload.editedText = normalizedEditedText
        nextPayload.edited_text = normalizedEditedText
        nextPayload.text = normalizedEditedText
        nextPayload.message = normalizedEditedText
        nextPayload.editedByManager = true
        nextPayload.managerEditedAt = nextPayload.managerEditedAt || new Date().toISOString()
      }
    }
    set('payload', nextPayload)
  }
  if (payload.actionType !== undefined) {
    const nextType = normalizeActionType(payload.actionType)
    if (!EXECUTION_TYPES.includes(nextType)) throw russianError('Неподдерживаемый тип AI действия')
    set('action_type', nextType)
  }
  if (!updates.length) return current
  updates.push('updated_at = NOW()')
  const result = await pool.query(`UPDATE ai_worker_queue SET ${updates.join(', ')} WHERE workspace_id = $1 AND id = $2 RETURNING *`, values)
  return assertQueueItem(userId, workspaceId, result.rows[0].id)
}


async function approveQueueItem(userId, workspaceId, queueId) {
  const item = await assertQueueItem(userId, workspaceId, queueId)
  if (!['pending_approval', 'failed'].includes(item.status)) throw russianError('Одобрить можно только действие со статусом ожидания или ошибки')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      `UPDATE ai_worker_queue
          SET status = 'approved', approved_by = $3, approved_at = NOW(), error_message = NULL, updated_at = NOW()
        WHERE workspace_id = $1 AND id = $2 RETURNING *`,
      [workspaceId, queueId, userId]
    )
    await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'ai_action_approved', title: 'AI действие одобрено', body: item.title, metadata: { queueId, actionType: item.actionType } })
    await client.query('COMMIT')
    return assertQueueItem(userId, workspaceId, result.rows[0].id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

async function rejectQueueItem(userId, workspaceId, queueId) {
  const item = await assertQueueItem(userId, workspaceId, queueId)
  if (['executing', 'completed', 'executed'].includes(item.status)) throw russianError('Нельзя отклонить уже выполняемое или завершённое AI действие')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query("UPDATE ai_worker_queue SET status = 'rejected', updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, queueId])
    await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'ai_action_rejected', title: 'AI действие отклонено', body: item.title, metadata: { queueId, actionType: item.actionType } })
    await client.query('COMMIT')
    return assertQueueItem(userId, workspaceId, result.rows[0].id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}


async function tableExists(client, tableName) {
  const result = await client.query('SELECT to_regclass($1) AS table_name', [tableName])
  return Boolean(result.rows[0]?.table_name)
}

async function ensureCrmMeetingsTable(client) {
  await client.query(`CREATE TABLE IF NOT EXISTS crm_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    starts_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 30,
    channel TEXT DEFAULT 'telegram',
    status TEXT DEFAULT 'scheduled',
    created_by_ai BOOLEAN DEFAULT TRUE,
    ai_worker_queue_id UUID REFERENCES ai_worker_queue(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'telegram'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT TRUE")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ai_worker_queue_id UUID REFERENCES ai_worker_queue(id) ON DELETE SET NULL")
  await client.query('CREATE INDEX IF NOT EXISTS idx_crm_meetings_workspace_lead ON crm_meetings(workspace_id, lead_id, starts_at DESC)')
  await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_meetings_unique_ai_worker_queue_id ON crm_meetings(ai_worker_queue_id) WHERE ai_worker_queue_id IS NOT NULL')
  await client.query('CREATE INDEX IF NOT EXISTS idx_crm_meetings_ai_worker_queue_id ON crm_meetings(ai_worker_queue_id)')
}

async function getTableColumns(client, tableName) {
  const result = await client.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  )
  return new Set(result.rows.map((row) => row.column_name))
}

function getMeetingStartTime(payload = {}) {
  return payload.proposedStartTime || payload.startsAt || payload.starts_at || payload.startTime || payload.scheduledTime || null
}

function getMeetingTitle(item) {
  return item.payload.proposedTitle || item.payload.title || `Demo-созвон — ${item.lead?.name || 'lead'}`
}

function getMeetingDurationMinutes(payload = {}) {
  const duration = Number(payload.durationMinutes || payload.duration_minutes || payload.duration || 30)
  return Number.isFinite(duration) && duration > 0 ? duration : 30
}

function getProposalSourceMessageId(item) {
  return item.payload.sourceMessageId || item.payload.telegramMessageId || item.payload.emailMessageId || item.payload.messageId || item.id
}

async function insertOptionalMeetingRecord(client, { workspaceId, item }) {
  await ensureCrmMeetingsTable(client)
  const columns = await getTableColumns(client, 'crm_meetings')
  const startTime = getMeetingStartTime(item.payload)
  const title = getMeetingTitle(item)
  const duration = getMeetingDurationMinutes(item.payload)

  const baseColumns = ['workspace_id', 'lead_id', 'title']
  const values = [workspaceId, item.leadId, title]
  function addColumn(column, value) {
    if (!columns.has(column)) return
    baseColumns.push(column)
    values.push(value)
  }

  addColumn(columns.has('starts_at') ? 'starts_at' : 'start_time', startTime)
  addColumn('duration_minutes', duration)
  addColumn('channel', item.payload.channel || 'telegram')
  addColumn('status', 'scheduled')
  addColumn('created_by_ai', true)
  addColumn('ai_worker_queue_id', item.id)
  addColumn('source', 'ai')
  addColumn('metadata', { queueId: item.id, actionType: item.actionType, sourceMessageId: getProposalSourceMessageId(item), calendar: item.payload.calendar || { connectLater: true } })

  const placeholders = values.map((_, index) => `$${index + 1}${['starts_at', 'start_time'].includes(baseColumns[index]) ? '::timestamptz' : ''}`)
  const conflict = columns.has('ai_worker_queue_id') ? 'ON CONFLICT DO NOTHING' : ''
  const result = await client.query(
    `INSERT INTO crm_meetings(${baseColumns.join(', ')})
     VALUES(${placeholders.join(', ')})
     ${conflict}
     RETURNING id`,
    values
  )
  return { table: 'crm_meetings', id: result.rows[0]?.id || null }
}

function getMeetingTimezone(item) {
  return item.payload.timeZone || process.env.APP_TIMEZONE || 'UTC'
}

function formatMeetingScheduleText(proposedStartTime, timeZone, { includeYear = false } = {}) {
  if (!proposedStartTime) return ''
  const parts = Object.fromEntries(new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(proposedStartTime)).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  const date = includeYear ? `${parts.day}.${parts.month}.${parts.year}` : `${parts.day}.${parts.month}`
  return `${date} в ${parts.hour}:${parts.minute}`
}

function buildMeetingConfirmationDraftText(item) {
  const proposedStartTime = getMeetingStartTime(item.payload)
  if (!proposedStartTime) return 'Отлично, demo-созвон подтверждён. До встречи!'
  return `Отлично, demo-созвон подтверждён на ${formatMeetingScheduleText(proposedStartTime, getMeetingTimezone(item))}. До встречи!`
}

function buildMeetingScheduledTimelineBody(item, proposedStartTime) {
  if (!proposedStartTime) return 'AI назначил demo-созвон через Telegram. Время уточняется.'
  return `AI назначил demo-созвон на ${formatMeetingScheduleText(proposedStartTime, getMeetingTimezone(item), { includeYear: true })} через Telegram.`
}

async function findExistingMeetingConfirmationDraft(client, item, sourceMessageId) {
  const result = await client.query(
    `SELECT id, status
       FROM ai_worker_queue
      WHERE workspace_id = $1
        AND lead_id = $2
        AND action_type = $3
        AND payload->>'meetingProposalQueueId' = $4
      ORDER BY created_at DESC
      LIMIT 1`,
    [item.workspaceId, item.leadId, TELEGRAM_MEETING_CONFIRMATION_DRAFT, item.id]
  )
  if (result.rows[0]) return result.rows[0]
  return findDuplicateQueueItem(client, {
    workspaceId: item.workspaceId,
    leadId: item.leadId,
    actionType: TELEGRAM_MEETING_CONFIRMATION_DRAFT,
    sourceMessageId,
    extraPayloadMatch: { key: 'meetingProposalQueueId', value: item.id },
  })
}

async function executeMeetingScheduleProposal(userId, workspaceId, item) {
  const client = await pool.connect()
  const proposedStartTime = getMeetingStartTime(item.payload)
  const title = getMeetingTitle(item)
  const durationMinutes = getMeetingDurationMinutes(item.payload)
  const sourceMessageId = getProposalSourceMessageId(item)
  const confirmationText = buildMeetingConfirmationDraftText(item)
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`meeting-execute:${workspaceId}:${item.id}`])
    const meetingRecord = await insertOptionalMeetingRecord(client, { workspaceId, item })
    console.info('[meeting-execute] meeting created', { workspaceId, leadId: item.leadId, queueId: item.id, meetingId: meetingRecord.id })
    await client.query(
      `UPDATE crm_leads
          SET status = 'booked', stage = 'booked', next_step = 'Demo scheduled', metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb, updated_at = NOW()
        WHERE workspace_id = $1 AND id = $2`,
      [workspaceId, item.leadId, { aiMeetingScheduler: { queueId: item.id, proposedStartTime, title, durationMinutes } }]
    )
    console.info('[meeting-execute] lead updated', { workspaceId, leadId: item.leadId, queueId: item.id })
    await client.query(
      `UPDATE ai_worker_queue
          SET status = 'completed', executed_at = NOW(), error_message = NULL, updated_at = NOW()
        WHERE workspace_id = $1 AND id = $2`,
      [workspaceId, item.id]
    )
    await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'meeting_scheduled', title: 'Demo-созвон запланирован', body: buildMeetingScheduledTimelineBody(item, proposedStartTime), source: 'ai', metadata: { queueId: item.id, actionType: item.actionType, proposedStartTime, durationMinutes, meetingRecord } })

    if ((item.payload.channel || 'telegram').toLowerCase() === 'telegram') {
      const existingDraft = await findExistingMeetingConfirmationDraft(client, { ...item, workspaceId }, sourceMessageId)

      if (existingDraft) {
        logDuplicateSkipped({ workspaceId, leadId: item.leadId, actionType: TELEGRAM_MEETING_CONFIRMATION_DRAFT, sourceMessageId, duplicateId: existingDraft.id })
      }

      if (!existingDraft) {
        const worker = await client.query(
          `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
           VALUES($1, 'AI Telegram Reply Assistant', 'ai_telegram_assistant', 'active', 'approval_required', 'Готовит черновики ответов Telegram после входящих сообщений. Отправка только после проверки менеджера.')
           ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
           RETURNING id`,
          [workspaceId]
        )
        await client.query(
          `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
           VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)`,
          [worker.rows[0].id, workspaceId, item.leadId, TELEGRAM_MEETING_CONFIRMATION_DRAFT, `Ответ-подтверждение встречи — ${item.lead?.name || 'лид'}`, 'AI подготовил подтверждение demo-созвона для клиента. Проверьте и отправьте в Telegram.', { source: 'ai_meeting_scheduler', channel: 'telegram', sourceMessageId, draftText: confirmationText, text: confirmationText, message: confirmationText, meetingProposalQueueId: item.id, proposedStartTime, scheduledTime: proposedStartTime, detectedDateText: item.payload.detectedDateText || '', detectedTimeText: item.payload.detectedTimeText || '', leadName: item.lead?.name || '', inboundMessage: item.payload.inboundMessage || item.payload.customerMessage || '' }]
        )
        console.info('[meeting-execute] confirmation draft created', { workspaceId, leadId: item.leadId, queueId: item.id, sourceMessageId })
      }
    }
    await client.query('COMMIT')
    return { scheduled: true, proposedStartTime, confirmationDraftCreated: (item.payload.channel || 'telegram').toLowerCase() === 'telegram' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

function buildMessage(item) {
  if (item.executionType === 'send_demo_link') return item.recommendation || 'Демо AS6 AI CRM Platform: https://www.as6.ru'
  if (item.executionType === 'telegram_reply_draft' || item.executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT) {
    return item.payload.editedText || item.payload.edited_text || item.payload.draftText || item.payload.text || item.payload.message || item.recommendation || item.title
  }
  return item.payload.editedText || item.payload.draftText || item.payload.text || item.payload.message || item.recommendation || item.title
}

async function executeByType(userId, workspaceId, item) {
  if (!item.leadId && item.executionType !== 'create_reminder') throw russianError('Для выполнения нужен привязанный лид')
  const type = item.executionType
  const channel = item.payload.channel || item.payload.suggestedChannel || (item.lead?.hasTelegramChatId ? 'telegram' : item.lead?.email ? 'email' : 'crm')
  if (type === 'meeting_schedule_proposal') return executeMeetingScheduleProposal(userId, workspaceId, item)
  if (type === 'telegram_reply_draft' || type === TELEGRAM_MEETING_CONFIRMATION_DRAFT || type === 'telegram_followup') return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text: buildMessage(item) })
  if (['followup_24h', 'followup_3d', 'demo_offer', 'meeting_request'].includes(type)) {
    if (channel === 'telegram') return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text: buildMessage(item) })
    if (channel === 'email') return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.to || item.lead?.email, subject: item.payload.subject || item.title, text: buildMessage(item), html: item.payload.html || '' })
    return crmModel.createNote(userId, workspaceId, item.leadId, item.payload.reminderText || buildMessage(item))
  }
  if (type === 'email_followup') return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.to || item.lead?.email, subject: item.payload.subject || item.title, text: buildMessage(item), html: item.payload.html || '' })
  if (type === 'send_demo_link') {
    const text = buildMessage({ ...item, recommendation: item.recommendation || 'Демо AS6 AI CRM Platform: https://www.as6.ru' })
    const demoChannel = item.lead?.hasTelegramChatId ? 'telegram' : channel
    if (demoChannel === 'telegram') return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text })
    if (demoChannel === 'email') return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.to || item.lead?.email, subject: item.payload.subject || 'Демо AS6 AI CRM Platform', text, html: item.payload.html || '' })
    return crmModel.createNote(userId, workspaceId, item.leadId, text)
  }
  if (type === 'send_presentation') return sendLeadAttachments({ userId, workspaceId, leadId: item.leadId, channel: channel === 'telegram' ? 'telegram' : 'email', materialKeys: item.payload.materialKeys || ['presentation'], email: { to: item.payload.to || item.lead?.email, subject: item.payload.subject || 'Презентация AS6 AI CRM Platform' } })
  if (type === 'create_reminder') return crmModel.createNote(userId, workspaceId, item.leadId, item.payload.reminderText || buildMessage(item) || 'AI напоминание')
  if (type === 'move_lead_stage' || type === 'stage_change_recommendation') return crmModel.updateLead(userId, workspaceId, item.leadId, { status: getStageTo(item) })
  throw russianError('Неподдерживаемый тип выполнения AI действия')
}

async function executeQueueItem(userId, workspaceId, queueId) {
  let item = await assertQueueItem(userId, workspaceId, queueId)
  if (item.status !== 'approved') throw russianError('Сначала одобрите AI действие, затем нажмите «Выполнить»')
  const executionType = item.executionType
  if (!EXECUTION_TYPES.includes(executionType)) throw russianError('Это AI действие пока нельзя выполнить автоматически. Измените тип действия.')
  await pool.query("UPDATE ai_worker_queue SET status = 'executing', error_message = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId])
  item = await assertQueueItem(userId, workspaceId, queueId)
  try {
    const result = await executeByType(userId, workspaceId, item)
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("UPDATE ai_worker_queue SET status = $3, executed_at = NOW(), error_message = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId, 'completed'])
      if (executionType === 'stage_change_recommendation') {
        const fromStage = getStageFrom(item) || item.lead?.status
        const toStage = getStageTo(item)
        await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'ai_stage_changed', title: 'AI изменил этап после approval', body: `AI рекомендовал перевести лида в стадию ${stageLabel(toStage)}. Стадия изменена: ${stageLabel(fromStage)} → ${stageLabel(toStage)}.`, metadata: { queueId, actionType: item.actionType, executionType, from: fromStage, to: toStage, confidence: item.payload.confidence, reason: item.payload.reason } })
      } else if (executionType === 'meeting_schedule_proposal') {
        // Meeting execution writes the dedicated meeting_scheduled timeline event inside executeMeetingScheduleProposal.
      } else {
        await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT ? 'telegram_meeting_confirmation_sent' : executionType === 'email_followup' || item.payload.channel === 'email' ? 'email_sent' : executionType === 'telegram_reply_draft' || executionType === 'telegram_followup' || item.payload.channel === 'telegram' ? 'telegram_sent' : 'ai_action_executed', title: executionType === 'email_followup' || item.payload.channel === 'email' ? 'Email отправлен' : executionType === 'telegram_reply_draft' || executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT || executionType === 'telegram_followup' || item.payload.channel === 'telegram' ? 'Telegram отправлен' : 'AI действие выполнено', body: item.title, source: item.payload.channel || 'ai', metadata: { queueId, actionType: item.actionType, executionType } })
      }
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
    return { item: await assertQueueItem(userId, workspaceId, queueId), result }
  } catch (error) {
    const message = error.message || 'Не удалось выполнить AI действие'
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("UPDATE ai_worker_queue SET status = 'failed', error_message = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId, message])
      await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'send_failed', title: 'Отправка не выполнена', body: message, metadata: { queueId, actionType: item.actionType, executionType } })
      await client.query('COMMIT')
    } catch (auditError) { await client.query('ROLLBACK'); throw auditError } finally { client.release() }
    return { item: await assertQueueItem(userId, workspaceId, queueId), error: message }
  }
}

async function getMetrics(userId, workspaceId) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS waiting_approval,
       COUNT(*) FILTER (WHERE status = 'approved' AND approved_at::date = CURRENT_DATE)::int AS approved_today,
       COUNT(*) FILTER (WHERE status IN ('completed','executed') AND executed_at::date = CURRENT_DATE)::int AS executed_today,
       COUNT(*) FILTER (WHERE status = 'failed' AND updated_at::date = CURRENT_DATE)::int AS failed_today,
       COUNT(*) FILTER (WHERE status IN ('completed','executed'))::int AS completed_total,
       COUNT(*) FILTER (WHERE action_type = 'meeting_schedule_proposal' AND status IN ('completed','executed'))::int AS meetings_scheduled_by_ai,
       COUNT(*) FILTER (WHERE action_type = 'meeting_schedule_proposal' AND status = 'pending_approval')::int AS pending_meeting_proposals,
       COUNT(*) FILTER (WHERE status IN ('completed','executed','failed'))::int AS finished_total
     FROM ai_worker_queue q
     WHERE q.workspace_id = $1 AND EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $2)`,
    [workspaceId, userId]
  )
  const row = result.rows[0] || {}
  const finished = Number(row.finished_total || 0)
  return {
    waitingApproval: Number(row.waiting_approval || 0),
    approvedToday: Number(row.approved_today || 0),
    executedToday: Number(row.executed_today || 0),
    failedToday: Number(row.failed_today || 0),
    successRate: finished ? Math.round((Number(row.completed_total || 0) / finished) * 100) : 0,
    meetingsScheduledByAi: Number(row.meetings_scheduled_by_ai || 0),
    pendingMeetingProposals: Number(row.pending_meeting_proposals || 0),
  }
}

module.exports = { approveQueueItem, buildMeetingConfirmationDraftText, executeQueueItem, getMetrics, listQueue, rejectQueueItem, updateQueueItem }
