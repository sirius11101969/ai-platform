const { addTimelineEvent } = require('./timelineService')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')
const { auditFollowupCooldownEarlySkip, shouldSkipFollowupForCooldown } = require('./followupCooldownService')

const ACTION_TYPE = 'followup_sequence_draft'
const ACTIVE_DEDUP_STATUSES = ['pending_approval', 'approved', 'completed', 'executed']
const CLOSED_STAGES = ['closed_won', 'closed_lost', 'won', 'lost']

const SEQUENCE_STEPS = [
  { sequenceStep: 'followup_24h', thresholdHours: 24, confidence: 0.82 },
  { sequenceStep: 'followup_3d', thresholdHours: 72, confidence: 0.78 },
  { sequenceStep: 'followup_7d', thresholdHours: 168, confidence: 0.72 },
]

function normalizeLeadName(lead) {
  return String(lead?.name || lead?.first_name || lead?.telegram_first_name || 'добрый день').trim()
}

function getFirstName(lead) {
  const raw = normalizeLeadName(lead)
  return raw.split(/\s+/)[0] || raw
}

function buildSuggestedText(lead, sequenceStep) {
  const name = getFirstName(lead)
  if (sequenceStep === 'followup_3d') {
    return `${name}, подскажите, пожалуйста, актуальна ли ещё задача по AI CRM? Если удобно, могу коротко прислать план внедрения.`
  }
  if (sequenceStep === 'followup_7d') {
    return `${name}, не буду отвлекать. Если тема AI CRM станет актуальной позже — напишите, я быстро вернусь с вариантом решения.`
  }
  return `${name}, добрый день! Возвращаюсь к нашему demo AS6 AI CRM. Актуально ещё обсудить автоматизацию Telegram и follow-up?`
}

function normalizeStage(stage) {
  return String(stage || 'new').trim().toLowerCase()
}

function formatHoursSince(dateValue) {
  if (!dateValue) return 0
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 0
  return Math.max(0, (Date.now() - date.getTime()) / 36e5)
}

function chooseChannel(lead) {
  if (lead.telegram_chat_id) return 'telegram'
  return 'email'
}

function buildReason({ sequenceStep, inactiveHours, channel }) {
  const roundedHours = Math.round(inactiveHours)
  return `Последнее касание было ${roundedHours} ч. назад; шаг ${sequenceStep}; канал ${channel}; автоотправка отключена, требуется approval менеджера.`
}

async function getOrCreateFollowupWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI Follow-up Engine', 'ai_followup_worker', 'active', 'approval_required', 'Находит stale conversations и готовит безопасные follow-up drafts без автоотправки.')
     ON CONFLICT (workspace_id, type) DO UPDATE
       SET name = 'AI Follow-up Engine',
           mode = 'approval_required',
           description = EXCLUDED.description,
           updated_at = NOW()
     RETURNING *`,
    [workspaceId]
  )
  return result.rows[0]
}

async function fetchStaleCandidateLeads(client, workspaceId) {
  const result = await client.query(
    `WITH latest_touch AS (
       SELECT DISTINCT ON (touch.lead_id)
              touch.lead_id,
              touch.last_message_at,
              touch.last_message_text,
              touch.channel,
              touch.direction
         FROM (
           SELECT tm.lead_id,
                  tm.created_at AS last_message_at,
                  COALESCE(NULLIF(tm.body, ''), tm.message, '') AS last_message_text,
                  'telegram'::text AS channel,
                  COALESCE(tm.direction, CASE WHEN tm.role = 'user' THEN 'inbound' ELSE 'outbound' END) AS direction
             FROM telegram_messages tm
            WHERE tm.workspace_id = $1
           UNION ALL
           SELECT em.lead_id,
                  COALESCE(em.sent_at, em.created_at) AS last_message_at,
                  COALESCE(NULLIF(em.text_body, ''), em.subject, '') AS last_message_text,
                  'email'::text AS channel,
                  'outbound'::text AS direction
             FROM email_messages em
            WHERE em.workspace_id = $1 AND em.lead_id IS NOT NULL
           UNION ALL
           SELECT l.id AS lead_id,
                  l.last_message_at AS last_message_at,
                  COALESCE(NULLIF(l.first_message, ''), NULLIF(l.notes, ''), '') AS last_message_text,
                  CASE WHEN l.telegram_chat_id IS NOT NULL THEN 'telegram' ELSE 'email' END AS channel,
                  'unknown'::text AS direction
             FROM crm_leads l
            WHERE l.workspace_id = $1 AND l.last_message_at IS NOT NULL
         ) touch
        WHERE touch.lead_id IS NOT NULL AND touch.last_message_at IS NOT NULL
        ORDER BY touch.lead_id, touch.last_message_at DESC
     )
     SELECT l.*, lt.last_message_at, lt.last_message_text, lt.channel AS last_message_channel, lt.direction AS last_message_direction
       FROM crm_leads l
       JOIN latest_touch lt ON lt.lead_id = l.id
      WHERE l.workspace_id = $1
        AND (NULLIF(l.telegram_chat_id, '') IS NOT NULL OR NULLIF(l.email, '') IS NOT NULL)
        AND LOWER(TRIM(COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new'))) <> ALL($2::text[])
      ORDER BY lt.last_message_at ASC
      LIMIT 500`,
    [workspaceId, CLOSED_STAGES]
  )
  return result.rows
}

async function hasExistingSequenceDraft(client, workspaceId, leadId, sequenceStep) {
  const result = await client.query(
    `SELECT id, status
       FROM ai_worker_queue
      WHERE workspace_id = $1
        AND lead_id = $2
        AND action_type = $3
        AND payload->>'sequenceStep' = $4
        AND status = ANY($5::text[])
      ORDER BY created_at DESC
      LIMIT 1`,
    [workspaceId, leadId, ACTION_TYPE, sequenceStep, ACTIVE_DEDUP_STATUSES]
  )
  return result.rows[0] || null
}

async function selectNextDueStep(client, workspaceId, lead, inactiveHours) {
  for (const step of SEQUENCE_STEPS) {
    if (inactiveHours < step.thresholdHours) continue
    const duplicate = await hasExistingSequenceDraft(client, workspaceId, lead.id, step.sequenceStep)
    if (!duplicate) return step
  }
  return null
}

async function createFollowupSequenceDrafts({ client, userId, workspaceId, workerId = null, runId = null }) {
  const worker = workerId ? { id: workerId } : await getOrCreateFollowupWorker(client, workspaceId)
  const leads = await fetchStaleCandidateLeads(client, workspaceId)
  const created = []
  const skipped = []

  for (const lead of leads) {
    const inactiveHours = formatHoursSince(lead.last_message_at)
    const step = await selectNextDueStep(client, workspaceId, lead, inactiveHours)
    if (!step) {
      const skipReason = 'threshold_not_met_or_duplicate'
      await auditFollowupCooldownEarlySkip({ client, workspaceId, leadId: lead.id, leadName: lead.name || lead.email || '', userId, skipReason })
      skipped.push({ leadId: lead.id, reason: skipReason })
      continue
    }

    const cooldownState = await shouldSkipFollowupForCooldown({ client, workspaceId, leadId: lead.id, leadName: lead.name || lead.email || '', userId })
    if (cooldownState.active) {
      skipped.push({ leadId: lead.id, reason: cooldownState.reason, lastOutboundAt: cooldownState.lastOutboundAt, cooldownHours: cooldownState.cooldownHours })
      continue
    }

    const channel = chooseChannel(lead)
    const suggestedText = buildSuggestedText(lead, step.sequenceStep)
    const reason = buildReason({ sequenceStep: step.sequenceStep, inactiveHours, channel })
    const payload = {
      leadId: lead.id,
      channel,
      sequenceStep: step.sequenceStep,
      lastMessageAt: lead.last_message_at,
      lastMessageText: lead.last_message_text || '',
      suggestedText,
      text: suggestedText,
      message: suggestedText,
      reason,
      confidence: step.confidence,
      thresholdHours: step.thresholdHours,
      inactiveHours: Math.round(inactiveHours * 10) / 10,
      lastMessageChannel: lead.last_message_channel,
      lastMessageDirection: lead.last_message_direction,
      noAutoSend: true,
    }

    const queued = await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, run_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, $4, $5, 'pending_approval', $6, $7, $8)
       RETURNING *`,
      [worker.id, workspaceId, runId, lead.id, ACTION_TYPE, `Follow-up ${step.sequenceStep} — ${lead.name || lead.email || 'лид'}`, sanitizeAiCopy(suggestedText), sanitizeAiActionPayload(payload)]
    )
    await addTimelineEvent(client, {
      workspaceId,
      leadId: lead.id,
      userId,
      eventType: 'followup_draft_created',
      title: 'AI follow-up draft created',
      body: suggestedText,
      source: 'ai',
      metadata: { queueId: queued.rows[0].id, sequenceStep: step.sequenceStep, channel, reason, confidence: step.confidence },
    })
    created.push(queued.rows[0])
  }

  return { scannedLeadsCount: leads.length, created, skipped, createdCount: created.length, skippedCount: skipped.length }
}

async function getAutonomousFollowupMetrics(client, workspaceId) {
  const result = await client.query(
    `WITH stale AS (
       SELECT l.id,
              GREATEST(COALESCE(l.last_message_at, l.updated_at, l.created_at), COALESCE(MAX(tm.created_at), COALESCE(l.last_message_at, l.updated_at, l.created_at)), COALESCE(MAX(em.created_at), COALESCE(l.last_message_at, l.updated_at, l.created_at))) AS last_touch_at
         FROM crm_leads l
         LEFT JOIN telegram_messages tm ON tm.lead_id = l.id AND tm.workspace_id = l.workspace_id
         LEFT JOIN email_messages em ON em.lead_id = l.id AND em.workspace_id = l.workspace_id
        WHERE l.workspace_id = $1
          AND (NULLIF(l.telegram_chat_id, '') IS NOT NULL OR NULLIF(l.email, '') IS NOT NULL)
          AND LOWER(TRIM(COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new'))) <> ALL($2::text[])
        GROUP BY l.id
     )
     SELECT
       (SELECT COUNT(*)::int FROM ai_worker_queue q WHERE q.workspace_id = $1 AND q.action_type = $3 AND q.status IN ('pending_approval','approved')) AS followups_pending,
       (SELECT COUNT(*)::int FROM ai_worker_queue q WHERE q.workspace_id = $1 AND q.action_type = $3 AND q.status IN ('completed','executed') AND q.executed_at::date = CURRENT_DATE) AS followups_sent_today,
       COUNT(*) FILTER (WHERE last_touch_at < NOW() - INTERVAL '24 hours')::int AS stale_conversations
      FROM stale`,
    [workspaceId, CLOSED_STAGES, ACTION_TYPE]
  )
  const row = result.rows[0] || {}
  return {
    followupsPending: Number(row.followups_pending || 0),
    followupsSentToday: Number(row.followups_sent_today || 0),
    staleConversations: Number(row.stale_conversations || 0),
  }
}

module.exports = {
  ACTION_TYPE,
  SEQUENCE_STEPS,
  createFollowupSequenceDrafts,
  getAutonomousFollowupMetrics,
}
