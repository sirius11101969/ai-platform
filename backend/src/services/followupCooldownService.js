const pool = require('../db/pool')
const { addTimelineEvent } = require('./timelineService')

const DEFAULT_FOLLOWUP_COOLDOWN_HOURS = 48
const SKIP_TIMELINE_COOLDOWN_HOURS = 24
const FOLLOWUP_COOLDOWN_SKIP_REASON = 'recent_outbound_customer_message'
const FOLLOWUP_COOLDOWN_MANAGER_REASON = 'Follow-up cooldown: клиенту уже отправлено сообщение недавно.'
const COOLDOWN_SKIP_EVENT_TYPE = 'ai_followup_skipped_cooldown'
const COOLDOWN_SKIP_EVENT_TITLE = 'AI follow-up пропущен'
const COOLDOWN_SKIP_EVENT_BODY = 'Недавнее исходящее сообщение клиенту — cooldown 48 часов.'

const FOLLOWUP_DRAFT_ACTION_TYPES = new Set([
  'followup_sequence_draft',
  'telegram_reply_draft',
  'telegram_followup',
  'telegram_followup_draft',
  'telegram_follow_up',
  'telegram_draft',
  'email_followup_draft',
  'email_followup',
  'email_follow_up',
])

const FOLLOWUP_RECOMMENDATION_CODES = new Set([
  'meeting_follow_up',
  'deal_loss_risk',
  'risk_follow_up',
  'urgent_follow_up',
  'needs_follow_up',
  'contact_today',
  'reply_today',
])

const OUTBOUND_TIMELINE_EVENT_TYPES = [
  'followup_sent',
  'follow_up_sent',
  'telegram_message_sent',
  'telegram_sent',
  'email_sent',
  'ai_action_executed',
]

let emailTableColumnsPromise = null

function getExecutor(client) {
  return client || pool
}

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

function hoursBetween(later, earlier) {
  const laterDate = toDate(later) || new Date()
  const earlierDate = toDate(earlier)
  if (!earlierDate) return null
  return (laterDate.getTime() - earlierDate.getTime()) / 3600000
}

function isFollowupDraftActionType(actionType) {
  return FOLLOWUP_DRAFT_ACTION_TYPES.has(String(actionType || '').trim())
}

function isFollowupRecommendationCode(code) {
  return FOLLOWUP_RECOMMENDATION_CODES.has(String(code || '').trim())
}

function buildCooldownLogPayload({ leadId, leadName, lastOutboundAt, cooldownHours = DEFAULT_FOLLOWUP_COOLDOWN_HOURS }) {
  return {
    leadId,
    leadName,
    lastOutboundAt: toDate(lastOutboundAt)?.toISOString() || lastOutboundAt || null,
    cooldownHours,
    reason: FOLLOWUP_COOLDOWN_SKIP_REASON,
  }
}

async function getEmailMessageColumns(client) {
  if (!emailTableColumnsPromise) {
    emailTableColumnsPromise = getExecutor(client).query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'email_messages'`
    ).then((result) => new Set(result.rows.map((row) => row.column_name)))
  }
  return emailTableColumnsPromise
}

async function fetchLatestOutboundCustomerMessage({ client, workspaceId, leadId }) {
  const executor = getExecutor(client)
  const emailColumns = await getEmailMessageColumns(client)
  const hasEmailMessages = emailColumns.has('lead_id') && emailColumns.has('created_at')
  const hasEmailDirection = emailColumns.has('direction')

  const parts = [
    `SELECT MAX(created_at) AS outbound_at
       FROM lead_timeline_events
      WHERE workspace_id = $1
        AND lead_id = $2
        AND event_type = ANY($3::text[])`,
    `SELECT MAX(created_at) AS outbound_at
       FROM telegram_messages
      WHERE workspace_id = $1
        AND lead_id = $2
        AND COALESCE(direction, CASE WHEN role = 'user' THEN 'inbound' ELSE 'outbound' END) = 'outbound'`,
  ]

  if (hasEmailMessages) {
    parts.push(hasEmailDirection
      ? `SELECT MAX(COALESCE(sent_at, created_at)) AS outbound_at
           FROM email_messages
          WHERE workspace_id = $1
            AND lead_id = $2
            AND direction = 'outbound'`
      : `SELECT MAX(COALESCE(sent_at, created_at)) AS outbound_at
           FROM email_messages
          WHERE workspace_id = $1
            AND lead_id = $2
            AND status = 'sent'`)
  }

  const result = await executor.query(
    `SELECT MAX(outbound_at) AS last_outbound_at FROM (${parts.join(' UNION ALL ')}) outbound_sources`,
    [workspaceId, leadId, OUTBOUND_TIMELINE_EVENT_TYPES]
  )
  return result.rows[0]?.last_outbound_at || null
}

async function getFollowupCooldownState({ client, workspaceId, leadId, cooldownHours = DEFAULT_FOLLOWUP_COOLDOWN_HOURS, now = new Date() }) {
  const lastOutboundAt = await fetchLatestOutboundCustomerMessage({ client, workspaceId, leadId })
  const elapsedHours = hoursBetween(now, lastOutboundAt)
  const active = elapsedHours !== null && elapsedHours >= 0 && elapsedHours < cooldownHours
  return {
    active,
    leadId,
    lastOutboundAt,
    cooldownHours,
    elapsedHours,
    reason: active ? FOLLOWUP_COOLDOWN_SKIP_REASON : null,
    managerReason: active ? FOLLOWUP_COOLDOWN_MANAGER_REASON : null,
  }
}

async function recordCooldownSkipTimelineEvent({ client, workspaceId, leadId, userId = null, leadName = '', cooldownHours = DEFAULT_FOLLOWUP_COOLDOWN_HOURS, lastOutboundAt = null }) {
  const executor = getExecutor(client)
  const workspaceFilter = workspaceId ? 'AND workspace_id = $1' : ''
  const existingParams = workspaceId
    ? [workspaceId, leadId, COOLDOWN_SKIP_EVENT_TYPE, SKIP_TIMELINE_COOLDOWN_HOURS]
    : [leadId, COOLDOWN_SKIP_EVENT_TYPE, SKIP_TIMELINE_COOLDOWN_HOURS]
  const leadIdParam = workspaceId ? '$2' : '$1'
  const eventTypeParam = workspaceId ? '$3' : '$2'
  const cooldownHoursParam = workspaceId ? '$4' : '$3'

  const existing = await executor.query(
    `SELECT COUNT(*)::int AS existing_audit_count
       FROM lead_timeline_events
      WHERE lead_id = ${leadIdParam}
        ${workspaceFilter}
        AND event_type = ${eventTypeParam}
        AND created_at >= NOW() - (${cooldownHoursParam}::int * INTERVAL '1 hour')`,
    existingParams
  )
  const existingAuditCount = Number(existing.rows[0]?.existing_audit_count || 0)
  const auditLogPayload = { leadId, leadName, existingAuditCount }
  console.info('[followup-cooldown] timeline audit check', auditLogPayload)

  if (existingAuditCount > 0) {
    console.info('[followup-cooldown] timeline audit already exists', auditLogPayload)
    return { created: false, existingAuditCount }
  }

  await addTimelineEvent(executor, {
    workspaceId,
    leadId,
    userId,
    eventType: COOLDOWN_SKIP_EVENT_TYPE,
    title: COOLDOWN_SKIP_EVENT_TITLE,
    body: COOLDOWN_SKIP_EVENT_BODY,
    source: 'ai',
    metadata: {
      reason: FOLLOWUP_COOLDOWN_SKIP_REASON,
      leadName,
      lastOutboundAt: toDate(lastOutboundAt)?.toISOString() || null,
      cooldownHours,
    },
  })
  console.info('[followup-cooldown] timeline audit event created', { leadId, leadName })
  return { created: true, existingAuditCount }
}

async function shouldSkipFollowupForCooldown({ client, workspaceId, leadId, leadName = '', userId = null, cooldownHours = DEFAULT_FOLLOWUP_COOLDOWN_HOURS, writeTimelineEvent = true }) {
  const state = await getFollowupCooldownState({ client, workspaceId, leadId, cooldownHours })
  if (!state.active) return state

  const logPayload = buildCooldownLogPayload({ leadId, leadName, lastOutboundAt: state.lastOutboundAt, cooldownHours })
  console.info('[followup-cooldown] lead skipped', logPayload)

  if (writeTimelineEvent) {
    await recordCooldownSkipTimelineEvent({ client, workspaceId, leadId, userId, leadName, cooldownHours, lastOutboundAt: state.lastOutboundAt })
  }

  return state
}

module.exports = {
  DEFAULT_FOLLOWUP_COOLDOWN_HOURS,
  FOLLOWUP_COOLDOWN_MANAGER_REASON,
  FOLLOWUP_COOLDOWN_SKIP_REASON,
  COOLDOWN_SKIP_EVENT_TYPE,
  COOLDOWN_SKIP_EVENT_TITLE,
  COOLDOWN_SKIP_EVENT_BODY,
  isFollowupDraftActionType,
  isFollowupRecommendationCode,
  getFollowupCooldownState,
  shouldSkipFollowupForCooldown,
}
