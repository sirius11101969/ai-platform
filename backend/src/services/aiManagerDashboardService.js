const pool = require('../db/pool')

const RANGE_DAYS = {
  today: 1,
  '7d': 7,
  '30d': 30,
}

const FOLLOWUP_ACTION_TYPES = [
  'followup_sequence_draft',
  'telegram_followup',
  'telegram_followup_draft',
  'telegram_follow_up',
  'email_followup',
  'email_followup_draft',
  'email_follow_up',
]

const CUSTOMER_FACING_ACTION_TYPES = [
  ...FOLLOWUP_ACTION_TYPES,
  'telegram_draft',
  'telegram_reply_draft',
  'telegram_meeting_confirmation_draft',
  'email_draft',
  'meeting_schedule_proposal',
  'send_demo_link',
  'send_presentation',
]

const SAFETY_EVENT_TYPES = [
  'ai_followup_skipped_cooldown',
  'send_failed',
  'copy_guard_blocked',
  'ai_copy_guard_blocked',
  'duplicate_followup_prevented',
  'route_highlight_recovered',
  'fallback_to_email',
]

function normalizeRange(range) {
  const key = String(range || '7d').trim().toLowerCase()
  return RANGE_DAYS[key] ? key : '7d'
}

function rangeStartSql(rangeKey) {
  if (rangeKey === 'today') return 'CURRENT_DATE::timestamptz'
  return `NOW() - INTERVAL '${RANGE_DAYS[rangeKey]} days'`
}

function toNumber(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number : 0
}

function money(value) {
  return Math.round(toNumber(value) * 100) / 100
}

function rowNumbers(row = {}) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') || key.toLowerCase().includes('revenue') ? money(value) : toNumber(value)]))
}

function isCopyGuardTextSql(alias = 'q') {
  return `(COALESCE(${alias}.error_message, '') || ' ' || COALESCE(${alias}.title, '') || ' ' || COALESCE(${alias}.recommendation, '') || ' ' || COALESCE(${alias}.payload::text, '')) ~* '(copy guard|unsafe copy|internal context leak|sanitizer test|safety test)'`
}

async function getActionFunnel(workspaceId, rangeStart) {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS actions_generated,
       COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS pending_approval,
       COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
       COUNT(*) FILTER (WHERE status IN ('completed', 'executed'))::int AS sent_completed,
       COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
       COUNT(*) FILTER (WHERE status = 'failed' AND NOT ${isCopyGuardTextSql('q')})::int AS failed_unresolved,
       COUNT(*) FILTER (WHERE ${isCopyGuardTextSql('q')})::int AS blocked_by_safety_copy_guard
     FROM ai_worker_queue q
     WHERE q.workspace_id = $1
       AND q.created_at >= ${rangeStart}`,
    [workspaceId]
  )
  return rowNumbers(result.rows[0])
}

async function getCommunicationOutcomes(workspaceId, rangeStart) {
  const result = await pool.query(
    `WITH queue_counts AS (
       SELECT
         COUNT(*) FILTER (WHERE q.action_type = ANY($2::text[]) AND q.status IN ('completed', 'executed'))::int AS followups_sent,
         COUNT(*) FILTER (WHERE ${isCopyGuardTextSql('q')})::int AS unsafe_copy_blocked
       FROM ai_worker_queue q
       WHERE q.workspace_id = $1
         AND COALESCE(q.executed_at, q.updated_at, q.created_at) >= ${rangeStart}
     ), timeline_counts AS (
       SELECT
         COUNT(*) FILTER (WHERE event_type = 'ai_followup_skipped_cooldown')::int AS cooldown_skips,
         COUNT(*) FILTER (WHERE event_type IN ('duplicate_followup_prevented', 'ai_followup_skipped_cooldown') OR title ~* 'duplicate|дубликат' OR body ~* 'duplicate|дубликат')::int AS duplicate_followups_prevented
       FROM lead_timeline_events
       WHERE workspace_id = $1
         AND created_at >= ${rangeStart}
     ), email_counts AS (
       SELECT COUNT(*)::int AS emails_sent
       FROM email_messages
       WHERE workspace_id = $1
         AND status = 'sent'
         AND COALESCE(sent_at, updated_at, created_at) >= ${rangeStart}
     ), telegram_counts AS (
       SELECT COUNT(*)::int AS telegram_messages_sent
       FROM telegram_messages
       WHERE workspace_id = $1
         AND COALESCE(direction, CASE WHEN role = 'user' THEN 'inbound' ELSE 'outbound' END) = 'outbound'
         AND created_at >= ${rangeStart}
     )
     SELECT * FROM queue_counts CROSS JOIN timeline_counts CROSS JOIN email_counts CROSS JOIN telegram_counts`,
    [workspaceId, FOLLOWUP_ACTION_TYPES]
  )
  return rowNumbers(result.rows[0])
}

async function getWorkloadReduction(workspaceId, rangeStart) {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS actions_prepared_by_ai,
       COUNT(*) FILTER (WHERE status IN ('pending_approval', 'approved', 'rejected'))::int AS actions_requiring_manager_decision,
       COUNT(*) FILTER (WHERE status IN ('completed', 'executed') AND approved_at IS NOT NULL)::int AS completed_after_approval,
       COUNT(*) FILTER (WHERE status IN ('completed', 'executed') AND action_type = ANY($2::text[]))::int AS completed_customer_facing_actions
     FROM ai_worker_queue
     WHERE workspace_id = $1
       AND created_at >= ${rangeStart}`,
    [workspaceId, CUSTOMER_FACING_ACTION_TYPES]
  )
  const data = rowNumbers(result.rows[0])
  return {
    ...data,
    estimated_minutes_saved: data.completed_customer_facing_actions * 7,
  }
}

async function getPipelineHealth(workspaceId, rangeStart) {
  const result = await pool.query(
    `WITH latest_scores AS (
       SELECT DISTINCT ON (lead_id) lead_id, risk_level, forecast_category, generated_at, expected_revenue
       FROM lead_ai_scores
       WHERE workspace_id = $1
       ORDER BY lead_id, generated_at DESC
     )
     SELECT
       COUNT(*) FILTER (WHERE COALESCE(l.ai_temperature, '') = 'hot' OR COALESCE(l.ai_score, 0) >= 80 OR COALESCE(l.ai_priority, '') = 'urgent')::int AS urgent_leads,
       COUNT(*) FILTER (WHERE COALESCE(l.ai_priority, '') IN ('high', 'urgent') OR COALESCE(l.ai_score, 0) >= 70)::int AS priority_leads,
       COUNT(*) FILTER (WHERE COALESCE(s.risk_level, l.ai_risk_level, 'low') = 'high')::int AS high_risk,
       COUNT(*) FILTER (WHERE COALESCE(s.risk_level, l.ai_risk_level, 'low') = 'medium')::int AS medium_risk,
       COUNT(*) FILTER (WHERE COALESCE(s.risk_level, l.ai_risk_level, 'low') = 'low')::int AS low_risk,
       COALESCE(SUM(CASE WHEN COALESCE(s.forecast_category, '') = 'committed' OR l.probability_to_close >= 80 THEN COALESCE(NULLIF(s.expected_revenue, 0), NULLIF(l.estimated_revenue, 0), l.value * GREATEST(l.probability_to_close, 0) / 100.0, l.value, 0) ELSE 0 END), 0)::numeric AS committed_forecast_amount,
       COUNT(*) FILTER (WHERE s.generated_at::date = CURRENT_DATE)::int AS ai_generated_forecast_updates_today
     FROM crm_leads l
     LEFT JOIN latest_scores s ON s.lead_id = l.id
     WHERE l.workspace_id = $1
       AND l.status NOT IN ('lost')`,
    [workspaceId]
  )
  return rowNumbers(result.rows[0])
}

async function getRevenueAttribution(workspaceId, rangeStart) {
  const result = await pool.query(
    `WITH latest_scores AS (
       SELECT DISTINCT ON (lead_id) lead_id, forecast_category, expected_revenue
       FROM lead_ai_scores
       WHERE workspace_id = $1
       ORDER BY lead_id, generated_at DESC
     ), queue_revenue AS (
       SELECT COUNT(DISTINCT q.id)::int AS actions_linked_to_revenue_opportunities
       FROM ai_worker_queue q
       JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
       WHERE q.workspace_id = $1
         AND COALESCE(l.value, 0) > 0
         AND q.created_at >= ${rangeStart}
     ), meeting_counts AS (
       SELECT COUNT(*)::int AS meetings_scheduled_by_ai
       FROM crm_meetings
       WHERE workspace_id = $1
         AND created_by_ai IS TRUE
         AND created_at >= ${rangeStart}
     )
     SELECT
       COALESCE(SUM(COALESCE(NULLIF(s.expected_revenue, 0), NULLIF(l.estimated_revenue, 0), l.value * GREATEST(COALESCE(NULLIF(l.probability_to_close, 0), 50), 0) / 100.0, l.value, 0)), 0)::numeric AS total_pipeline_value_under_ai_monitoring,
       COALESCE(SUM(CASE WHEN COALESCE(s.forecast_category, '') = 'committed' OR l.probability_to_close >= 80 THEN COALESCE(NULLIF(s.expected_revenue, 0), NULLIF(l.estimated_revenue, 0), l.value * GREATEST(l.probability_to_close, 0) / 100.0, l.value, 0) ELSE 0 END), 0)::numeric AS expected_revenue_from_committed_leads,
       qr.actions_linked_to_revenue_opportunities,
       mc.meetings_scheduled_by_ai
     FROM crm_leads l
     LEFT JOIN latest_scores s ON s.lead_id = l.id
     CROSS JOIN queue_revenue qr
     CROSS JOIN meeting_counts mc
     WHERE l.workspace_id = $1
       AND l.status NOT IN ('lost')
     GROUP BY qr.actions_linked_to_revenue_opportunities, mc.meetings_scheduled_by_ai`,
    [workspaceId]
  )
  return rowNumbers(result.rows[0])
}

async function getRecentWins(workspaceId, rangeStart) {
  const result = await pool.query(
    `SELECT * FROM (
       SELECT 'email_sent' AS type,
              'Email sent to ' || COALESCE(l.name, e.to_email) AS title,
              COALESCE(e.subject, '') AS detail,
              COALESCE(e.sent_at, e.updated_at, e.created_at) AS created_at
       FROM email_messages e
       LEFT JOIN crm_leads l ON l.id = e.lead_id AND l.workspace_id = e.workspace_id
       WHERE e.workspace_id = $1 AND e.status = 'sent' AND COALESCE(e.sent_at, e.updated_at, e.created_at) >= ${rangeStart}
       UNION ALL
       SELECT 'cooldown_skip' AS type,
              'Follow-up cooldown prevented duplicate for ' || COALESCE(NULLIF(t.metadata->>'leadName', ''), l.name, 'lead') AS title,
              COALESCE(t.body, t.title, '') AS detail,
              t.created_at
       FROM lead_timeline_events t
       LEFT JOIN crm_leads l ON l.id = t.lead_id AND l.workspace_id = t.workspace_id
       WHERE t.workspace_id = $1 AND t.event_type = 'ai_followup_skipped_cooldown' AND t.created_at >= ${rangeStart}
       UNION ALL
       SELECT 'copy_guard_block' AS type,
              'Copy guard blocked unsafe draft' AS title,
              COALESCE(q.error_message, q.title) AS detail,
              COALESCE(q.updated_at, q.created_at) AS created_at
       FROM ai_worker_queue q
       WHERE q.workspace_id = $1 AND ${isCopyGuardTextSql('q')} AND COALESCE(q.updated_at, q.created_at) >= ${rangeStart}
       UNION ALL
       SELECT 'meeting_scheduled' AS type,
              'Meeting scheduled by AI' || CASE WHEN l.name IS NULL THEN '' ELSE ' for ' || l.name END AS title,
              COALESCE(m.title, '') AS detail,
              m.created_at
       FROM crm_meetings m
       LEFT JOIN crm_leads l ON l.id = m.lead_id AND l.workspace_id = m.workspace_id
       WHERE m.workspace_id = $1 AND m.created_by_ai IS TRUE AND m.created_at >= ${rangeStart}
     ) wins
     ORDER BY created_at DESC
     LIMIT 12`,
    [workspaceId]
  )
  return result.rows.map((row) => ({
    type: row.type,
    title: row.title,
    detail: row.detail || '',
    createdAt: row.created_at,
  }))
}

async function getSafetyEvents(workspaceId, rangeStart) {
  const result = await pool.query(
    `WITH queue_safety AS (
       SELECT
         COUNT(*) FILTER (WHERE ${isCopyGuardTextSql('q')})::int AS copy_guard_blocks,
         COUNT(*) FILTER (WHERE status = 'failed' AND NOT ${isCopyGuardTextSql('q')})::int AS failed_unresolved,
         COUNT(*) FILTER (WHERE COALESCE(payload->>'fallbackReason', payload->>'channelFallbackReason', '') = 'telegram_missing' OR COALESCE(payload->>'preferredChannel', payload->>'channel', '') = 'email' AND COALESCE(payload->>'fallbackReason', payload->>'channelFallbackReason', '') <> '')::int AS fallback_to_email_events
       FROM ai_worker_queue q
       WHERE q.workspace_id = $1
         AND COALESCE(q.updated_at, q.created_at) >= ${rangeStart}
     ), timeline_safety AS (
       SELECT
         COUNT(*) FILTER (WHERE event_type = 'ai_followup_skipped_cooldown')::int AS cooldown_skips,
         COUNT(*) FILTER (WHERE event_type = 'route_highlight_recovered' OR title ~* 'route-highlight|route highlight|highlight recovered')::int AS route_highlight_recoveries
       FROM lead_timeline_events
       WHERE workspace_id = $1
         AND created_at >= ${rangeStart}
     )
     SELECT * FROM queue_safety CROSS JOIN timeline_safety`,
    [workspaceId]
  )
  const counts = rowNumbers(result.rows[0])

  const events = await pool.query(
    `SELECT * FROM (
       SELECT 'copy_guard_block' AS type, COALESCE(q.title, 'Copy guard blocked unsafe draft') AS title, COALESCE(q.error_message, q.recommendation, '') AS detail, COALESCE(q.updated_at, q.created_at) AS created_at
       FROM ai_worker_queue q
       WHERE q.workspace_id = $1 AND ${isCopyGuardTextSql('q')} AND COALESCE(q.updated_at, q.created_at) >= ${rangeStart}
       UNION ALL
       SELECT event_type AS type, title, COALESCE(body, '') AS detail, created_at
       FROM lead_timeline_events
       WHERE workspace_id = $1 AND (event_type = ANY($2::text[]) OR title ~* 'cooldown|copy guard|duplicate|fallback|route highlight') AND created_at >= ${rangeStart}
       UNION ALL
       SELECT 'failed_unresolved' AS type, q.title, COALESCE(q.error_message, '') AS detail, COALESCE(q.updated_at, q.created_at) AS created_at
       FROM ai_worker_queue q
       WHERE q.workspace_id = $1 AND q.status = 'failed' AND NOT ${isCopyGuardTextSql('q')} AND COALESCE(q.updated_at, q.created_at) >= ${rangeStart}
     ) safety
     ORDER BY created_at DESC
     LIMIT 12`,
    [workspaceId, SAFETY_EVENT_TYPES]
  )

  return {
    ...counts,
    items: events.rows.map((row) => ({ type: row.type, title: row.title, detail: row.detail || '', createdAt: row.created_at })),
  }
}

async function getManagerDashboard(userId, workspaceId, options = {}) {
  const rangeKey = normalizeRange(options.range)
  const rangeStart = rangeStartSql(rangeKey)
  const [actionFunnel, communicationOutcomes, workloadReduction, pipelineHealth, revenueAttribution, recentWins, safetyEvents] = await Promise.all([
    getActionFunnel(workspaceId, rangeStart),
    getCommunicationOutcomes(workspaceId, rangeStart),
    getWorkloadReduction(workspaceId, rangeStart),
    getPipelineHealth(workspaceId, rangeStart),
    getRevenueAttribution(workspaceId, rangeStart),
    getRecentWins(workspaceId, rangeStart),
    getSafetyEvents(workspaceId, rangeStart),
  ])

  return {
    range: rangeKey,
    actionFunnel,
    communicationOutcomes,
    workloadReduction,
    pipelineHealth,
    revenueAttribution,
    recentWins,
    safetyEvents,
  }
}

module.exports = { getManagerDashboard, normalizeRange }
