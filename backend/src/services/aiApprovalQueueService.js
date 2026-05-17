const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const emailService = require('./emailService')
const { sendTelegramMessageToLead } = require('./telegramService')
const { sendLeadAttachments } = require('./attachmentService')
const { addTimelineEvent } = require('./timelineService')
const { findDuplicateQueueItem, logDuplicateSkipped } = require('./aiQueueDedupService')
const { DEFAULT_TIMEZONE, buildMeetingDescription, buildStableIcsUid, generateMeetingIcs } = require('./calendarIcsService')
const { createGoogleCalendarEvent } = require('./googleCalendarService')
const { scoreLead } = require('./aiLeadScoringService')
const { assertCustomerSafeText, assertSafeCustomerCopy, containsForbiddenCustomerCopy, getSafePriorityInboxCustomerText } = require('./customerCopyGuard')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')

const STATUSES = ['pending_approval', 'approved', 'rejected', 'executing', 'completed', 'executed', 'failed', 'cancelled']
const TELEGRAM_MEETING_CONFIRMATION_DRAFT = 'telegram_meeting_confirmation_draft'
const FOLLOWUP_SEQUENCE_DRAFT = 'followup_sequence_draft'
const EMAIL_FOLLOWUP_DRAFT = 'email_followup_draft'
const EXECUTION_TYPES = [FOLLOWUP_SEQUENCE_DRAFT, EMAIL_FOLLOWUP_DRAFT, 'telegram_reply_draft', TELEGRAM_MEETING_CONFIRMATION_DRAFT, 'telegram_followup', 'email_followup', 'send_demo_link', 'send_presentation', 'create_reminder', 'move_lead_stage', 'stage_change_recommendation', 'followup_24h', 'followup_3d', 'demo_offer', 'meeting_request', 'meeting_schedule_proposal']
const IMPORTANT_LEAD_PRIORITY_RECOMMENDATION_SQL = `(q.action_type <> 'lead_priority_recommendation' OR (
  COALESCE(q.payload->>'priority', q.payload->>'aiPriority', '') IN ('priority','urgent')
  OR COALESCE(q.payload->>'riskLevel', q.payload->>'aiRiskLevel', '') IN ('medium','high')
  OR CASE WHEN (q.payload->>'score') ~ '^[0-9]+(\\.[0-9]+)?$' THEN (q.payload->>'score')::numeric ELSE 0 END >= 70
  OR LOWER(CONCAT_WS(' ', q.recommendation, q.title, q.payload->>'recommendedNextStep', q.payload->>'nextBestAction')) ~ '(urgent|asap|сроч|немедленно|эскал|escalate)'
))`

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
  followup_sequence_draft: FOLLOWUP_SEQUENCE_DRAFT,
  email_followup_draft: EMAIL_FOLLOWUP_DRAFT,
  crm_next_action: 'create_reminder',
  move_lead_stage: 'stage_change_recommendation',
  lead_prioritization: 'create_reminder',
  meeting_prep_recommendation: 'create_reminder',
  risk_followup_recommendation: 'create_reminder',
  proposal_followup_recommendation: 'create_reminder',
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
    meeting: row.meeting_id ? {
      id: row.meeting_id,
      title: row.meeting_title || '',
      startsAt: row.meeting_starts_at || null,
      durationMinutes: Number(row.meeting_duration_minutes || 30),
      status: row.meeting_status || '',
      calendarStatus: row.meeting_calendar_status || '',
      calendarProvider: row.meeting_calendar_provider || '',
      timezone: row.meeting_timezone || '',
      hasIcs: Boolean(row.meeting_has_ics),
      googleEventId: row.meeting_google_event_id || '',
      googleMeetUrl: row.meeting_google_meet_url || '',
      calendarError: row.meeting_calendar_error || '',
      calendarSyncedAt: row.meeting_calendar_synced_at || null,
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


function isPriorityInboxItem(item) {
  return item?.payload?.source === 'priority_inbox'
}

function isCustomerFacingDraftType(type) {
  return [FOLLOWUP_SEQUENCE_DRAFT, EMAIL_FOLLOWUP_DRAFT, 'telegram_reply_draft', TELEGRAM_MEETING_CONFIRMATION_DRAFT, 'telegram_followup', 'email_followup'].includes(type)
}

function getRawDraftText(item) {
  return item.payload.editedText || item.payload.edited_text || item.payload.customerText || item.payload.customer_text || item.payload.suggestedText || item.payload.draftText || item.payload.body || item.payload.text || item.payload.message || item.recommendation || item.title
}

function resolveCustomerMessage(item) {
  const text = getRawDraftText(item)
  if (isCustomerFacingDraftType(item.executionType)) {
    return assertCustomerSafeText(text, { actionId: item.id, actionType: item.executionType, source: item.payload?.source || '' })
  }
  return String(text || '').trim()
}

async function assertQueueItem(userId, workspaceId, queueId, client = pool) {
  const result = await client.query(
    `SELECT q.*, w.name AS worker_name, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.telegram AS lead_telegram, l.telegram_chat_id AS lead_telegram_chat_id, l.status AS lead_status, m.id AS meeting_id, m.title AS meeting_title, m.starts_at AS meeting_starts_at, m.duration_minutes AS meeting_duration_minutes, m.status AS meeting_status, m.calendar_status AS meeting_calendar_status, m.calendar_provider AS meeting_calendar_provider, m.timezone AS meeting_timezone, m.google_event_id AS meeting_google_event_id, m.google_meet_url AS meeting_google_meet_url, m.calendar_error AS meeting_calendar_error, m.calendar_synced_at AS meeting_calendar_synced_at, (m.ics_content IS NOT NULL AND m.ics_content <> '') AS meeting_has_ics
       FROM ai_worker_queue q
       LEFT JOIN ai_workers w ON w.id = q.worker_id AND w.workspace_id = q.workspace_id
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
       LEFT JOIN crm_meetings m ON m.ai_worker_queue_id = q.id AND m.workspace_id = q.workspace_id
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
  clauses.push(IMPORTANT_LEAD_PRIORITY_RECOMMENDATION_SQL)
  const result = await pool.query(
    `SELECT q.*, w.name AS worker_name, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.telegram AS lead_telegram, l.telegram_chat_id AS lead_telegram_chat_id, l.status AS lead_status, m.id AS meeting_id, m.title AS meeting_title, m.starts_at AS meeting_starts_at, m.duration_minutes AS meeting_duration_minutes, m.status AS meeting_status, m.calendar_status AS meeting_calendar_status, m.calendar_provider AS meeting_calendar_provider, m.timezone AS meeting_timezone, m.google_event_id AS meeting_google_event_id, m.google_meet_url AS meeting_google_meet_url, m.calendar_error AS meeting_calendar_error, m.calendar_synced_at AS meeting_calendar_synced_at, (m.ics_content IS NOT NULL AND m.ics_content <> '') AS meeting_has_ics
       FROM ai_worker_queue q
       LEFT JOIN ai_workers w ON w.id = q.worker_id AND w.workspace_id = q.workspace_id
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
       LEFT JOIN crm_meetings m ON m.ai_worker_queue_id = q.id AND m.workspace_id = q.workspace_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY q.created_at DESC
      LIMIT 200`,
    values
  )
  const items = result.rows.map(normalize)
  await cleanupPriorityInboxDrafts(items)
  return items
}

async function cleanupPriorityInboxDrafts(items) {
  const dirtyItems = items.filter((item) => {
    if (!isPriorityInboxItem(item)) return false
    if (!['pending_approval', 'approved'].includes(item.status)) return false
    if (!isCustomerFacingDraftType(item.executionType) && item.executionType !== 'meeting_schedule_proposal') return false
    const customerText = getSafePriorityInboxCustomerText(item.payload)
    return !item.payload.customerText || containsForbiddenCustomerCopy(getRawDraftText(item)) || item.payload.draftText !== customerText || item.payload.text !== customerText || item.payload.message !== customerText
  })
  await Promise.all(dirtyItems.map((item) => {
    const customerText = getSafePriorityInboxCustomerText(item.payload)
    const payload = { ...item.payload, customerText, draftText: customerText, text: customerText, message: customerText, body: item.executionType === EMAIL_FOLLOWUP_DRAFT || item.payload.channel === 'email' ? customerText : item.payload.body }
    if (payload.body === undefined) delete payload.body
    item.payload = payload
    return pool.query('UPDATE ai_worker_queue SET payload = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2', [item.workspaceId, item.id, sanitizeAiActionPayload(payload)])
      .then(() => console.info('[copy-guard] cleaned pending Priority Inbox draft', { actionId: item.id, actionType: item.executionType }))
      .catch((error) => console.error('[copy-guard] pending draft cleanup failed', { actionId: item.id, error: error.message || error }))
  }))
}

async function updateQueueItem(userId, workspaceId, queueId, payload) {
  const current = await assertQueueItem(userId, workspaceId, queueId)
  if (['executing', 'completed', 'executed'].includes(current.status)) throw russianError('Нельзя изменить AI действие во время или после выполнения')
  const updates = []
  const values = [workspaceId, queueId]
  function set(column, value) { values.push(value); updates.push(`${column} = $${values.length}`) }
  if (payload.title !== undefined) set('title', String(payload.title || current.title).trim() || current.title)
  if (payload.recommendation !== undefined) set('recommendation', sanitizeAiCopy(String(payload.recommendation || '')))
  if (payload.payload !== undefined) {
    const nextPayload = payload.payload || {}
    if (current.executionType === 'telegram_reply_draft' || current.executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT || current.executionType === FOLLOWUP_SEQUENCE_DRAFT || current.executionType === EMAIL_FOLLOWUP_DRAFT) {
      const editedText = nextPayload.editedText ?? nextPayload.edited_text
      const normalizedEditedText = editedText !== undefined ? String(editedText || '').trim() : ''
      if (normalizedEditedText) {
        nextPayload.editedText = normalizedEditedText
        nextPayload.edited_text = normalizedEditedText
        nextPayload.text = normalizedEditedText
        nextPayload.message = normalizedEditedText
        if (current.executionType === EMAIL_FOLLOWUP_DRAFT) nextPayload.body = normalizedEditedText
        nextPayload.editedByManager = true
        nextPayload.managerEditedAt = nextPayload.managerEditedAt || new Date().toISOString()
      }
    }
    set('payload', sanitizeAiActionPayload(nextPayload))
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

async function getQueueItemLogContext(userId, workspaceId, queueId) {
  const item = await assertQueueItem(userId, workspaceId, queueId)
  return { actionId: item.id, actionType: item.executionType || item.actionType, status: item.status }
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
    description TEXT,
    location TEXT,
    meeting_url TEXT,
    calendar_status TEXT DEFAULT 'pending',
    calendar_provider TEXT DEFAULT 'internal',
    ics_uid TEXT,
    ics_content TEXT,
    timezone TEXT DEFAULT 'Europe/Moscow',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'telegram'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS created_by_ai BOOLEAN DEFAULT TRUE")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ai_worker_queue_id UUID REFERENCES ai_worker_queue(id) ON DELETE SET NULL")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS description TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS location TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS meeting_url TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_status TEXT DEFAULT 'pending'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_provider TEXT DEFAULT 'internal'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ics_uid TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS ics_content TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Moscow'")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS google_event_id TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS google_meet_url TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_error TEXT")
  await client.query("ALTER TABLE crm_meetings ADD COLUMN IF NOT EXISTS calendar_synced_at TIMESTAMPTZ")
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
  const timezone = item.payload.timeZone || DEFAULT_TIMEZONE
  const sourceMessage = item.payload.inboundMessage || item.payload.customerMessage || ''
  const channel = item.payload.channel || 'telegram'
  const description = buildMeetingDescription({ leadName: item.lead?.name || item.payload.leadName || '', channel, sourceMessage })
  const icsUid = buildStableIcsUid({ workspaceId, queueId: item.id, leadId: item.leadId })
  const icsContent = generateMeetingIcs({ uid: icsUid, title, startsAt: startTime, durationMinutes: duration, description, timezone })

  const baseColumns = ['workspace_id', 'lead_id', 'title']
  const values = [workspaceId, item.leadId, title]
  function addColumn(column, value) {
    if (!columns.has(column)) return
    baseColumns.push(column)
    values.push(value)
  }

  addColumn(columns.has('starts_at') ? 'starts_at' : 'start_time', startTime)
  addColumn('duration_minutes', duration)
  addColumn('channel', channel)
  addColumn('status', 'scheduled')
  addColumn('created_by_ai', true)
  addColumn('ai_worker_queue_id', item.id)
  addColumn('description', description)
  addColumn('location', 'AS6 demo-созвон')
  addColumn('meeting_url', item.payload.meetingUrl || item.payload.meeting_url || '')
  addColumn('calendar_status', 'ics_ready')
  addColumn('calendar_provider', 'ics')
  addColumn('ics_uid', icsUid)
  addColumn('ics_content', icsContent)
  addColumn('timezone', timezone)
  addColumn('source', 'ai')
  addColumn('metadata', { queueId: item.id, actionType: item.actionType, sourceMessageId: getProposalSourceMessageId(item), calendar: { provider: 'ics', status: 'ics_ready', icsUid } })

  const placeholders = values.map((_, index) => `$${index + 1}${['starts_at', 'start_time'].includes(baseColumns[index]) ? '::timestamptz' : ''}`)
  const conflict = columns.has('ai_worker_queue_id')
    ? `ON CONFLICT (ai_worker_queue_id) WHERE ai_worker_queue_id IS NOT NULL DO UPDATE SET
         title = EXCLUDED.title,
         starts_at = COALESCE(EXCLUDED.starts_at, crm_meetings.starts_at),
         duration_minutes = EXCLUDED.duration_minutes,
         channel = EXCLUDED.channel,
         status = EXCLUDED.status,
         description = EXCLUDED.description,
         location = EXCLUDED.location,
         meeting_url = EXCLUDED.meeting_url,
         calendar_status = EXCLUDED.calendar_status,
         calendar_provider = EXCLUDED.calendar_provider,
         ics_uid = EXCLUDED.ics_uid,
         ics_content = EXCLUDED.ics_content,
         timezone = EXCLUDED.timezone,
         google_event_id = crm_meetings.google_event_id,
         google_meet_url = crm_meetings.google_meet_url,
         calendar_error = NULL,
         calendar_synced_at = crm_meetings.calendar_synced_at,
         updated_at = NOW()`
    : ''
  const result = await client.query(
    `INSERT INTO crm_meetings(${baseColumns.join(', ')})
     VALUES(${placeholders.join(', ')})
     ${conflict}
     RETURNING id, title, starts_at, duration_minutes, description, location, meeting_url, calendar_status, calendar_provider, ics_uid, timezone, google_event_id, google_meet_url, calendar_error, calendar_synced_at`,
    values
  )
  const row = result.rows[0] || {}
  return {
    table: 'crm_meetings',
    id: row.id || null,
    title: row.title || title,
    startsAt: row.starts_at || startTime,
    durationMinutes: Number(row.duration_minutes || duration),
    description: row.description || description,
    location: row.location || 'AS6 demo-созвон',
    meetingUrl: row.meeting_url || '',
    calendarStatus: row.calendar_status || 'ics_ready',
    calendarProvider: row.calendar_provider || 'ics',
    icsUid: row.ics_uid || icsUid,
    timezone: row.timezone || timezone,
    googleEventId: row.google_event_id || '',
    googleMeetUrl: row.google_meet_url || '',
    calendarError: row.calendar_error || '',
    calendarSyncedAt: row.calendar_synced_at || null,
  }
}

async function syncMeetingToGoogleCalendar(client, meetingRecord) {
  if (!meetingRecord?.id) return meetingRecord
  if (meetingRecord.googleEventId) {
    await client.query("UPDATE crm_meetings SET calendar_provider = 'google', calendar_status = 'synced', calendar_error = NULL, updated_at = NOW() WHERE id = $1", [meetingRecord.id])
    return { ...meetingRecord, calendarStatus: 'synced', calendarProvider: 'google' }
  }
  try {
    const result = await createGoogleCalendarEvent({ meeting: meetingRecord })
    if (result.skipped) {
      await client.query("UPDATE crm_meetings SET calendar_provider = 'ics', calendar_status = 'ics_ready', calendar_error = NULL, updated_at = NOW() WHERE id = $1", [meetingRecord.id])
      return { ...meetingRecord, calendarStatus: 'ics_ready', calendarProvider: 'ics' }
    }
    const updated = await client.query(
      `UPDATE crm_meetings
          SET google_event_id = $2, google_meet_url = $3, meeting_url = COALESCE(NULLIF($3, ''), meeting_url), calendar_provider = 'google', calendar_status = 'synced', calendar_error = NULL, calendar_synced_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND (google_event_id IS NULL OR google_event_id = '')
        RETURNING google_event_id, google_meet_url, calendar_status, calendar_provider, calendar_synced_at`,
      [meetingRecord.id, result.googleEventId, result.googleMeetUrl || '']
    )
    const row = updated.rows[0] || {}
    return { ...meetingRecord, googleEventId: row.google_event_id || result.googleEventId, googleMeetUrl: row.google_meet_url || result.googleMeetUrl || '', calendarStatus: row.calendar_status || 'synced', calendarProvider: row.calendar_provider || 'google', calendarSyncedAt: row.calendar_synced_at || new Date().toISOString(), calendarError: '' }
  } catch (error) {
    const message = error.message || 'Google Calendar sync failed'
    console.info('[calendar] google sync failed, using ics fallback', { meetingId: meetingRecord.id, error: message })
    await client.query("UPDATE crm_meetings SET calendar_provider = 'ics', calendar_status = 'ics_ready', calendar_error = $2, updated_at = NOW() WHERE id = $1", [meetingRecord.id, message])
    return { ...meetingRecord, calendarStatus: 'ics_ready', calendarProvider: 'ics', calendarError: message }
  }
}

function getMeetingTimezone(item) {
  return item.payload.timeZone || DEFAULT_TIMEZONE
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

function buildMeetingConfirmationDraftText(item, { icsReady = false, googleMeetUrl = '' } = {}) {
  const proposedStartTime = getMeetingStartTime(item.payload)
  const baseText = proposedStartTime
    ? `Отлично, demo-созвон подтверждён на ${formatMeetingScheduleText(proposedStartTime, getMeetingTimezone(item))}. До встречи!`
    : 'Отлично, demo-созвон подтверждён. До встречи!'
  if (googleMeetUrl) return `${baseText} Ссылка на встречу: ${googleMeetUrl}`
  return icsReady ? `${baseText} Календарное приглашение готово, менеджер может отправить его отдельно.` : baseText
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
  let confirmationText = buildMeetingConfirmationDraftText(item)
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`meeting-execute:${workspaceId}:${item.id}`])
    let meetingRecord = await insertOptionalMeetingRecord(client, { workspaceId, item })
    meetingRecord = await syncMeetingToGoogleCalendar(client, meetingRecord)
    const icsReady = meetingRecord.calendarStatus === 'ics_ready'
    confirmationText = assertSafeCustomerCopy(buildMeetingConfirmationDraftText(item, { icsReady, googleMeetUrl: meetingRecord.googleMeetUrl }), { actionId: item.id, actionType: TELEGRAM_MEETING_CONFIRMATION_DRAFT, source: item.payload?.source || '' })
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
    await scoreLead({ userId, workspaceId, leadId: item.leadId, source: 'meeting_booked', client }).catch((error) => console.error('[lead-scoring] meeting trigger failed', error.message || error))
    if (icsReady) {
      await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'calendar_ics_created', title: 'ICS файл встречи создан', body: 'Календарное событие подготовлено для demo-созвона.', source: 'ai', metadata: { queueId: item.id, actionType: item.actionType, proposedStartTime, durationMinutes, meetingRecord } })
    }

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
          [worker.rows[0].id, workspaceId, item.leadId, TELEGRAM_MEETING_CONFIRMATION_DRAFT, `Ответ-подтверждение встречи — ${item.lead?.name || 'лид'}`, sanitizeAiCopy('AI подготовил подтверждение demo-созвона для клиента. Проверьте и отправьте в Telegram.'), sanitizeAiActionPayload({ source: 'ai_meeting_scheduler', channel: 'telegram', sourceMessageId, customerText: confirmationText, draftText: confirmationText, text: confirmationText, message: confirmationText, meetingProposalQueueId: item.id, proposedStartTime, scheduledTime: proposedStartTime, detectedDateText: item.payload.detectedDateText || '', detectedTimeText: item.payload.detectedTimeText || '', leadName: item.lead?.name || '', inboundMessage: item.payload.inboundMessage || item.payload.customerMessage || '' })]
        )
        console.info('[meeting-execute] confirmation draft created', { workspaceId, leadId: item.leadId, queueId: item.id, sourceMessageId })
      }
    }
    await client.query('COMMIT')
    return { scheduled: true, proposedStartTime, meetingRecord, icsReady, confirmationDraftCreated: (item.payload.channel || 'telegram').toLowerCase() === 'telegram' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

function buildMessage(item) {
  if (item.executionType === 'send_demo_link') return item.recommendation || 'Демо AS6 AI CRM Platform: https://www.as6.ru'
  return resolveCustomerMessage(item)
}

async function loadFollowupLead(workspaceId, leadId) {
  if (!leadId) return null
  const result = await pool.query(
    `SELECT id, user_id, workspace_id, name, email, telegram_chat_id, metadata, status
       FROM crm_leads
      WHERE workspace_id = $1 AND id = $2`,
    [workspaceId, leadId]
  )
  return result.rows[0] || null
}

function getLeadTelegramChatId(lead) {
  return lead?.telegram_chat_id || lead?.metadata?.telegramChatId || ''
}

function getFollowupText(item) {
  return resolveCustomerMessage(item)
}

function getEmailSubject(item, lead) {
  return String(item.payload.subject || `Follow-up — ${lead?.name || item.lead?.name || 'лид'}`).trim()
}

async function createEmailFollowupDraftQueueItem(client, { workspaceId, item, leadId, leadName, email, subject, body, sequenceStep }) {
  const safeBody = assertSafeCustomerCopy(body, { actionId: item.id, actionType: EMAIL_FOLLOWUP_DRAFT, source: item.payload?.source || '' })
  const payload = {
    leadId,
    email,
    subject,
    body: safeBody,
    customerText: safeBody,
    draftText: safeBody,
    text: safeBody,
    message: safeBody,
    channel: 'email',
    sourceFollowupActionId: item.id,
    sequenceStep,
  }
  const result = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)
     RETURNING id`,
    [item.workerId, workspaceId, leadId, EMAIL_FOLLOWUP_DRAFT, `Email follow-up — ${leadName || 'лид'}`, sanitizeAiCopy(safeBody), sanitizeAiActionPayload(payload)]
  )
  const draft = result.rows[0] || {}
  console.info('[followup-execute] email draft created', { actionId: item.id, leadId })
  return { id: draft.id, payload }
}

function getTelegramResponseMessageId(telegramResponse) {
  return telegramResponse?.result?.message_id || telegramResponse?.message_id || telegramResponse?.id || null
}

function getTelegramResponseChatId(telegramResponse) {
  return telegramResponse?.result?.chat?.id || telegramResponse?.chat?.id || telegramResponse?.chat_id || null
}

async function ensureFollowupTelegramMessagePersisted(client, { userId, workspaceId, leadId, text, result, item }) {
  if (result?.delivery !== 'telegram') return null
  const safeText = assertSafeCustomerCopy(text, { actionId: item.id, actionType: item.executionType, source: item.payload?.source || '' })

  const existing = result.telegramMessage || null
  if (existing?.id) {
    console.info('[followup-execute] telegram message persisted', { actionId: item.id, leadId })
    return existing
  }

  const telegramResponse = result.telegramResponse || null
  const telegramMessage = await crmModel.addTelegramMessage(client, {
    userId,
    workspaceId,
    leadId,
    role: 'assistant',
    message: safeText,
    telegramChatId: result.chatId || item.lead?.telegramChatId || getTelegramResponseChatId(telegramResponse) || null,
    telegramMessageId: getTelegramResponseMessageId(telegramResponse),
  })
  console.info('[followup-execute] telegram message persisted', { actionId: item.id, leadId })
  return telegramMessage
}

async function executeFollowupSequenceDraft(userId, workspaceId, item) {
  const leadId = item.payload.leadId || item.payload.lead_id || item.leadId
  console.info('[followup-execute] requested', { actionId: item.id, leadId })
  if (!leadId) throw russianError('Для выполнения нужен привязанный лид')

  const lead = await loadFollowupLead(workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })

  const text = getFollowupText(item)
  if (!text) throw russianError('Follow-up text is required')

  const requestedChannel = String(item.payload.channel || item.payload.suggestedChannel || '').trim().toLowerCase()
  const telegramChatId = getLeadTelegramChatId(lead)
  const email = String(item.payload.email || item.payload.to || lead.email || '').trim()
  const sequenceStep = item.payload.sequenceStep || ''

  if (requestedChannel === 'email') {
    if (!email) throw russianError('No email available for follow-up')
    return { delivery: 'email_draft', leadId, leadName: lead.name || item.lead?.name || '', email, subject: getEmailSubject(item, lead), text, body: text, sequenceStep }
  }

  if (requestedChannel === 'telegram' || telegramChatId) {
    const result = await sendTelegramMessageToLead({ userId, workspaceId, leadId, text, actionId: item.id })
    console.info('[followup-execute] telegram sent', { actionId: item.id, leadId })
    return { ...result, delivery: 'telegram', leadId, text, sequenceStep }
  }

  if (email) {
    return { delivery: 'email_draft', leadId, leadName: lead.name || item.lead?.name || '', email, subject: getEmailSubject(item, lead), text, body: text, sequenceStep }
  }

  throw russianError('No Telegram or email channel available')
}

async function executeByType(userId, workspaceId, item) {
  if (!item.leadId && item.executionType !== 'create_reminder' && item.executionType !== FOLLOWUP_SEQUENCE_DRAFT) throw russianError('Для выполнения нужен привязанный лид')
  const type = item.executionType
  const channel = item.payload.channel || item.payload.suggestedChannel || (item.lead?.hasTelegramChatId ? 'telegram' : item.lead?.email ? 'email' : 'crm')
  if (type === 'meeting_schedule_proposal') return executeMeetingScheduleProposal(userId, workspaceId, item)
  if (type === FOLLOWUP_SEQUENCE_DRAFT) return executeFollowupSequenceDraft(userId, workspaceId, item)
  if (type === EMAIL_FOLLOWUP_DRAFT) return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.email || item.payload.to || item.lead?.email, subject: item.payload.subject || item.title, text: buildMessage(item), html: item.payload.html || '' })
  if (type === 'telegram_reply_draft' || type === TELEGRAM_MEETING_CONFIRMATION_DRAFT || type === 'telegram_followup') {
    return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text: buildMessage(item), actionId: item.id })
  }
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
      if (executionType === 'stage_change_recommendation') {
        const fromStage = getStageFrom(item) || item.lead?.status
        const toStage = getStageTo(item)
        await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'ai_stage_changed', title: 'AI изменил этап после approval', body: `AI рекомендовал перевести лида в стадию ${stageLabel(toStage)}. Стадия изменена: ${stageLabel(fromStage)} → ${stageLabel(toStage)}.`, metadata: { queueId, actionType: item.actionType, executionType, from: fromStage, to: toStage, confidence: item.payload.confidence, reason: item.payload.reason } })
      } else if (executionType === 'meeting_schedule_proposal') {
        // Meeting execution writes the dedicated meeting_scheduled timeline event inside executeMeetingScheduleProposal.
      } else if (executionType === FOLLOWUP_SEQUENCE_DRAFT) {
        const followupLeadId = result?.leadId || item.payload?.leadId || item.payload?.lead_id || item.leadId
        const followupText = result?.text || buildMessage(item)
        if (result?.delivery === 'email_draft') {
          const draft = await createEmailFollowupDraftQueueItem(client, { workspaceId, item, leadId: followupLeadId, leadName: result.leadName || item.lead?.name || '', email: result.email, subject: result.subject, body: result.body || followupText, sequenceStep: result.sequenceStep || item.payload.sequenceStep || '' })
          await saveAudit(client, { workspaceId, leadId: followupLeadId, userId, type: 'followup_email_drafted', title: 'Email follow-up подготовлен', body: followupText, source: 'email', metadata: { queueId, emailFollowupDraftQueueId: draft.id, actionType: item.actionType, executionType, sequenceStep: result?.sequenceStep || item.payload.sequenceStep, confidence: item.payload.confidence, reason: item.payload.reason } })
        } else {
          await ensureFollowupTelegramMessagePersisted(client, { userId, workspaceId, leadId: followupLeadId, text: followupText, result, item })
          await saveAudit(client, { workspaceId, leadId: followupLeadId, userId, type: 'followup_sent', title: 'Follow-up отправлен', body: followupText, source: 'telegram', metadata: { queueId, actionType: item.actionType, executionType, sequenceStep: result?.sequenceStep || item.payload.sequenceStep, confidence: item.payload.confidence, reason: item.payload.reason } })
        }
      } else {
        await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT ? 'telegram_meeting_confirmation_sent' : executionType === EMAIL_FOLLOWUP_DRAFT || executionType === 'email_followup' || item.payload.channel === 'email' ? 'email_sent' : executionType === 'telegram_reply_draft' || executionType === 'telegram_followup' || item.payload.channel === 'telegram' ? 'telegram_sent' : 'ai_action_executed', title: executionType === EMAIL_FOLLOWUP_DRAFT || executionType === 'email_followup' || item.payload.channel === 'email' ? 'Email отправлен' : executionType === 'telegram_reply_draft' || executionType === TELEGRAM_MEETING_CONFIRMATION_DRAFT || executionType === 'telegram_followup' || item.payload.channel === 'telegram' ? 'Telegram отправлен' : 'AI действие выполнено', body: item.title, source: item.payload.channel || 'ai', metadata: { queueId, actionType: item.actionType, executionType } })
      }
      await client.query("UPDATE ai_worker_queue SET status = $3, executed_at = NOW(), error_message = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId, 'completed'])
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
    return { success: true, actionId: queueId, status: 'completed', item: await assertQueueItem(userId, workspaceId, queueId), result }
  } catch (error) {
    const message = error.message || 'Не удалось выполнить AI действие'
    if (executionType === FOLLOWUP_SEQUENCE_DRAFT) console.info('[followup-execute] failed', { actionId: queueId, error: message })
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("UPDATE ai_worker_queue SET status = 'failed', error_message = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId, message])
      await saveAudit(client, { workspaceId, leadId: item.payload?.leadId || item.payload?.lead_id || item.leadId, userId, type: 'send_failed', title: 'Отправка не выполнена', body: message, metadata: { queueId, actionType: item.actionType, executionType } })
      await client.query('COMMIT')
    } catch (auditError) { await client.query('ROLLBACK'); throw auditError } finally { client.release() }
    return { success: false, actionId: queueId, status: 'failed', item: await assertQueueItem(userId, workspaceId, queueId), error: message }
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
       COUNT(*) FILTER (WHERE action_type = 'followup_sequence_draft' AND status IN ('pending_approval','approved'))::int AS followups_pending,
       COUNT(*) FILTER (WHERE action_type = 'followup_sequence_draft' AND status IN ('completed','executed') AND executed_at::date = CURRENT_DATE)::int AS followups_sent_today,
       COUNT(*) FILTER (WHERE status IN ('completed','executed','failed'))::int AS finished_total
     FROM ai_worker_queue q
     WHERE q.workspace_id = $1
       AND EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $2)
       AND ${IMPORTANT_LEAD_PRIORITY_RECOMMENDATION_SQL}`,
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
    followupsPending: Number(row.followups_pending || 0),
    followupsSentToday: Number(row.followups_sent_today || 0),
  }
}

module.exports = { approveQueueItem, buildMeetingConfirmationDraftText, executeQueueItem, getMetrics, getQueueItemLogContext, listQueue, rejectQueueItem, updateQueueItem }
