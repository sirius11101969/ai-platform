const pool = require('../db/pool')
const { addTimelineEvent } = require('./timelineService')
const { sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')
const { shouldSkipFollowupForCooldown, DEFAULT_FOLLOWUP_COOLDOWN_HOURS } = require('./followupCooldownService')
const { VOICE_OUTREACH_CALL_JOB_TYPE } = require('./voiceOutreachService')

const SALES_SEQUENCE_STEP_GENERATION_JOB_TYPE = 'sales_sequence_step_generation'
const SEQUENCE_ACTION_TYPE = 'sales_sequence_followup_draft'
const STOPPED_LEAD_STAGES = ['won', 'lost']
const REPLY_EVENT_TYPES = ['telegram_inbound', 'telegram_reply_received', 'email_reply_received', 'customer_reply_received']
const MEETING_EVENT_TYPES = ['meeting_booked', 'meeting_scheduled', 'calendar_meeting_created']
const DEFAULT_QUEUE_NAME = process.env.AI_EXECUTION_QUEUE_NAME || 'ai-execution'

function safeJsonb(value) {
  return JSON.stringify(value ?? {})
}

function normalizeNullableText(value) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text || null
}

function normalizePositiveInteger(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? Math.trunc(number) : fallback
}

function normalizeChannel(channel) {
  const normalized = String(channel || '').trim().toLowerCase()
  if (normalized === 'email') return 'email'
  if (normalized === 'voice') return 'voice'
  return 'telegram'
}

function mapLeadSequence(row = {}) {
  return {
    id: row.id,
    leadId: row.lead_id,
    templateId: row.template_id,
    status: row.status,
    currentStep: Number(row.current_step || 0),
    nextRunAt: row.next_run_at,
    lastGeneratedAt: row.last_generated_at,
    stopReason: row.stop_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    leadName: row.lead_name,
    templateName: row.template_name,
    channel: row.channel,
  }
}

async function query(client, sql, params = []) {
  return (client || pool).query(sql, params.map((param) => (param === undefined ? null : param)))
}

async function getDefaultTemplate(workspaceId, client = pool) {
  const result = await query(client,
    `SELECT * FROM ai_sequence_templates
      WHERE workspace_id = $1::uuid AND is_active = TRUE
      ORDER BY CASE WHEN name = 'Enterprise Demo Follow-up' THEN 0 ELSE 1 END, created_at ASC
      LIMIT 1`,
    [workspaceId]
  )
  return result.rows[0] || null
}

async function startSequence({ workspaceId, userId = null, leadId, templateId = null, nextRunAt = null }, client = pool) {
  if (!workspaceId) throw Object.assign(new Error('workspaceId is required'), { statusCode: 400 })
  if (!leadId) throw Object.assign(new Error('leadId is required'), { statusCode: 400 })
  const leadResult = await query(client, 'SELECT id, name, workspace_id, user_id FROM crm_leads WHERE id = $1::uuid AND workspace_id = $2::uuid LIMIT 1', [leadId, workspaceId])
  const lead = leadResult.rows[0]
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  let template = null
  if (templateId) {
    const templateResult = await query(client, 'SELECT * FROM ai_sequence_templates WHERE id = $1::uuid AND workspace_id = $2::uuid AND is_active = TRUE LIMIT 1', [templateId, workspaceId])
    template = templateResult.rows[0] || null
  } else {
    template = await getDefaultTemplate(workspaceId, client)
  }
  if (!template) throw Object.assign(new Error('Active sequence template not found'), { statusCode: 404 })

  const firstStep = await query(client, 'SELECT delay_hours FROM ai_sequence_steps WHERE template_id = $1::uuid ORDER BY step_order ASC LIMIT 1', [template.id])
  const firstDelay = Number(firstStep.rows[0]?.delay_hours || 0)
  const scheduleAt = nextRunAt ? new Date(nextRunAt) : new Date(Date.now() + firstDelay * 60 * 60 * 1000)
  const result = await query(client,
    `INSERT INTO ai_lead_sequences(lead_id, template_id, status, current_step, next_run_at, created_at, updated_at)
     VALUES($1::uuid, $2::uuid, 'active', 0, $3::timestamptz, NOW(), NOW())
     ON CONFLICT (lead_id, template_id) WHERE status IN ('active', 'paused') DO UPDATE
       SET status = 'active', next_run_at = COALESCE(ai_lead_sequences.next_run_at, EXCLUDED.next_run_at), stop_reason = NULL, updated_at = NOW()
     RETURNING *`,
    [leadId, template.id, scheduleAt.toISOString()]
  )
  await addTimelineEvent(client, {
    workspaceId,
    leadId,
    userId: userId || lead.user_id,
    eventType: 'ai_sequence_started',
    title: 'AI sequence started',
    body: template.name,
    source: 'ai',
    metadata: { leadSequenceId: result.rows[0].id, templateId: template.id, templateName: template.name, nextRunAt: scheduleAt.toISOString() },
  })
  return mapLeadSequence({ ...result.rows[0], lead_name: lead.name, template_name: template.name, channel: template.channel })
}

async function pauseSequence({ workspaceId, userId = null, leadSequenceId, leadId = null }) {
  if (!leadSequenceId && !leadId) throw Object.assign(new Error('leadSequenceId or leadId is required'), { statusCode: 400 })
  const params = [workspaceId]
  const filters = ['t.workspace_id = $1::uuid', "s.status = 'active'"]
  if (leadSequenceId) { params.push(leadSequenceId); filters.push(`s.id = $${params.length}::uuid`) }
  if (leadId) { params.push(leadId); filters.push(`s.lead_id = $${params.length}::uuid`) }
  const result = await query(pool,
    `UPDATE ai_lead_sequences s
        SET status = 'paused', updated_at = NOW()
       FROM ai_sequence_templates t
      WHERE s.template_id = t.id AND ${filters.join(' AND ')}
      RETURNING s.*, t.name AS template_name, t.channel`,
    params
  )
  for (const row of result.rows) {
    await addTimelineEvent(pool, { workspaceId, leadId: row.lead_id, userId, eventType: 'ai_sequence_paused', title: 'AI sequence paused', body: row.template_name, source: 'ai', metadata: { leadSequenceId: row.id } })
  }
  return { updatedCount: result.rowCount, sequences: result.rows.map(mapLeadSequence) }
}

async function stopSequence({ workspaceId, userId = null, leadSequenceId, leadId = null, reason = 'manual_stop' }) {
  if (!leadSequenceId && !leadId) throw Object.assign(new Error('leadSequenceId or leadId is required'), { statusCode: 400 })
  const params = [workspaceId, reason]
  const filters = ['t.workspace_id = $1::uuid', "s.status IN ('active','paused')"]
  if (leadSequenceId) { params.push(leadSequenceId); filters.push(`s.id = $${params.length}::uuid`) }
  if (leadId) { params.push(leadId); filters.push(`s.lead_id = $${params.length}::uuid`) }
  const result = await query(pool,
    `UPDATE ai_lead_sequences s
        SET status = 'stopped', stop_reason = $2::text, next_run_at = NULL, updated_at = NOW()
       FROM ai_sequence_templates t
      WHERE s.template_id = t.id AND ${filters.join(' AND ')}
      RETURNING s.*, t.name AS template_name, t.channel`,
    params
  )
  for (const row of result.rows) {
    await addTimelineEvent(pool, { workspaceId, leadId: row.lead_id, userId, eventType: 'ai_sequence_stopped', title: 'AI sequence stopped', body: reason, source: 'ai', metadata: { leadSequenceId: row.id, reason } })
  }
  return { updatedCount: result.rowCount, sequences: result.rows.map(mapLeadSequence) }
}

async function getSequenceStopReason(sequence, client = pool) {
  const lead = sequence
  const metadata = lead.metadata || {}
  const status = String(lead.status || lead.stage || '').toLowerCase()
  const stage = String(lead.stage || '').toLowerCase()
  if (metadata.unsubscribed === true || metadata.unsubscribe === true || metadata.optedOut === true || metadata.opted_out === true || Boolean(metadata.unsubscribedAt || metadata.unsubscribed_at)) return 'unsubscribed'
  if (STOPPED_LEAD_STAGES.includes(status) || STOPPED_LEAD_STAGES.includes(stage)) return status === 'won' || stage === 'won' ? 'deal_won' : 'deal_lost'
  if (status === 'booked' || stage === 'booked') return 'meeting_booked'

  const since = sequence.last_generated_at || sequence.created_at
  const events = await query(client,
    `SELECT event_type
       FROM lead_timeline_events
      WHERE workspace_id = $1::uuid AND lead_id = $2::uuid AND created_at > COALESCE($3::timestamptz, '-infinity'::timestamptz)
        AND event_type = ANY($4::text[])
      LIMIT 1`,
    [sequence.workspace_id, sequence.lead_id, since, [...REPLY_EVENT_TYPES, ...MEETING_EVENT_TYPES]]
  )
  const eventType = events.rows[0]?.event_type
  if (REPLY_EVENT_TYPES.includes(eventType)) return 'replied'
  if (MEETING_EVENT_TYPES.includes(eventType)) return 'meeting_booked'
  return null
}

async function stopSequenceSafely(client, sequence, reason) {
  const result = await query(client,
    `UPDATE ai_lead_sequences SET status = 'stopped', stop_reason = $2::text, next_run_at = NULL, updated_at = NOW()
      WHERE id = $1::uuid AND status = 'active' RETURNING *`,
    [sequence.id, reason]
  )
  if (result.rowCount > 0) {
    await addTimelineEvent(client, { workspaceId: sequence.workspace_id, leadId: sequence.lead_id, userId: sequence.user_id, eventType: 'ai_sequence_stopped', title: 'AI sequence stopped', body: reason, source: 'ai', metadata: { leadSequenceId: sequence.id, reason } })
  }
  return result.rows[0] || null
}

async function completeSequenceIfNoStep(client, sequence, nextStep) {
  if (nextStep) return false
  const result = await query(client,
    `UPDATE ai_lead_sequences SET status = 'completed', next_run_at = NULL, updated_at = NOW()
      WHERE id = $1::uuid AND status = 'active' RETURNING *`,
    [sequence.id]
  )
  if (result.rowCount > 0) {
    await addTimelineEvent(client, { workspaceId: sequence.workspace_id, leadId: sequence.lead_id, userId: sequence.user_id, eventType: 'ai_sequence_completed', title: 'AI sequence completed', body: sequence.template_name, source: 'ai', metadata: { leadSequenceId: sequence.id, completedStep: sequence.current_step } })
  }
  return result.rowCount > 0
}

async function reconcileApprovedSequences({ client = pool, limit = 25 } = {}) {
  const result = await query(client,
    `SELECT s.*, t.workspace_id, t.name AS template_name, l.name AS lead_name, l.user_id
       FROM ai_lead_sequences s
       JOIN ai_sequence_templates t ON t.id = s.template_id
       JOIN crm_leads l ON l.id = s.lead_id
      WHERE s.status = 'active' AND s.next_run_at IS NULL AND s.current_step > 0
      ORDER BY s.updated_at ASC
      LIMIT $1::integer`,
    [limit]
  )
  let scheduled = 0
  let completed = 0
  for (const sequence of result.rows) {
    const sent = await query(client,
      `SELECT COALESCE(executed_at, updated_at, created_at) AS sent_at
         FROM ai_worker_queue
        WHERE workspace_id = $1::uuid AND lead_id = $2::uuid AND payload->>'leadSequenceId' = $3::text AND payload->>'step' = $4::text
          AND status IN ('completed','executed')
        ORDER BY COALESCE(executed_at, updated_at, created_at) DESC
        LIMIT 1`,
      [sequence.workspace_id, sequence.lead_id, sequence.id, String(sequence.current_step)]
    )
    if (!sent.rows[0]) continue
    const nextStepOrder = Number(sequence.current_step || 0) + 1
    const stepResult = await query(client, 'SELECT * FROM ai_sequence_steps WHERE template_id = $1::uuid AND step_order = $2::integer LIMIT 1', [sequence.template_id, nextStepOrder])
    const nextStep = stepResult.rows[0]
    if (!nextStep) {
      const didComplete = await completeSequenceIfNoStep(client, sequence, null)
      if (didComplete) completed += 1
      continue
    }
    const runAt = new Date(new Date(sent.rows[0].sent_at).getTime() + Number(nextStep.delay_hours || 0) * 60 * 60 * 1000)
    const update = await query(client,
      `UPDATE ai_lead_sequences SET next_run_at = $2::timestamptz, updated_at = NOW()
        WHERE id = $1::uuid AND status = 'active' AND next_run_at IS NULL RETURNING *`,
      [sequence.id, runAt.toISOString()]
    )
    if (update.rowCount > 0) scheduled += 1
  }
  return { scheduled, completed }
}

async function enqueueDueSequenceSteps({ client = pool, queueName = DEFAULT_QUEUE_NAME, limit = 25, cooldownHours = DEFAULT_FOLLOWUP_COOLDOWN_HOURS } = {}) {
  await reconcileApprovedSequences({ client, limit })
  const dueResult = await query(client,
    `SELECT s.*, t.workspace_id, t.name AS template_name, t.channel, l.name AS lead_name, l.user_id, l.status, l.stage, l.metadata
       FROM ai_lead_sequences s
       JOIN ai_sequence_templates t ON t.id = s.template_id AND t.is_active = TRUE
       JOIN crm_leads l ON l.id = s.lead_id
      WHERE s.status = 'active' AND s.next_run_at IS NOT NULL AND s.next_run_at <= NOW()
      ORDER BY s.next_run_at ASC
      LIMIT $1::integer
      FOR UPDATE SKIP LOCKED`,
    [limit]
  )
  const enqueued = []
  const skipped = []
  const stopped = []
  for (const sequence of dueResult.rows) {
    const stopReason = await getSequenceStopReason(sequence, client)
    if (stopReason) {
      await stopSequenceSafely(client, sequence, stopReason)
      stopped.push({ leadSequenceId: sequence.id, reason: stopReason })
      continue
    }
    const nextStepOrder = Number(sequence.current_step || 0) + 1
    const stepResult = await query(client, 'SELECT * FROM ai_sequence_steps WHERE template_id = $1::uuid AND step_order = $2::integer LIMIT 1', [sequence.template_id, nextStepOrder])
    const step = stepResult.rows[0]
    if (!step) {
      await completeSequenceIfNoStep(client, sequence, null)
      stopped.push({ leadSequenceId: sequence.id, reason: 'completed' })
      continue
    }
    const cooldown = await shouldSkipFollowupForCooldown({ client, workspaceId: sequence.workspace_id, leadId: sequence.lead_id, leadName: sequence.lead_name, userId: sequence.user_id, cooldownHours })
    if (cooldown.active) {
      const retryAt = cooldown.lastOutboundAt ? new Date(new Date(cooldown.lastOutboundAt).getTime() + Number(cooldown.cooldownHours || cooldownHours) * 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000)
      await query(client, 'UPDATE ai_lead_sequences SET next_run_at = $2::timestamptz, updated_at = NOW() WHERE id = $1::uuid', [sequence.id, retryAt.toISOString()])
      skipped.push({ leadSequenceId: sequence.id, reason: cooldown.reason, retryAt: retryAt.toISOString() })
      continue
    }
    const isVoiceStep = normalizeChannel(sequence.channel) === 'voice'
    const idempotencyKey = `${isVoiceStep ? 'voice-sequence' : 'sales-sequence'}:${sequence.id}:step:${nextStepOrder}`
    const payload = sanitizeAiActionPayload(isVoiceStep
      ? { leadId: sequence.lead_id, sequenceId: sequence.id, leadSequenceId: sequence.id, step: nextStepOrder, provider: 'mock_provider', mockMode: true }
      : { leadSequenceId: sequence.id, step: nextStepOrder })
    const jobType = isVoiceStep ? VOICE_OUTREACH_CALL_JOB_TYPE : SALES_SEQUENCE_STEP_GENERATION_JOB_TYPE
    const jobResult = await query(client,
      `INSERT INTO ai_execution_jobs(workspace_id, user_id, queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
       VALUES($1::uuid, $2::uuid, $3::text, $4::text, 80, 'queued', $5::jsonb, 3, NOW(), $6::text)
       ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
       RETURNING *`,
      [sequence.workspace_id, sequence.user_id, queueName, jobType, safeJsonb(payload), idempotencyKey]
    )
    if (jobResult.rowCount > 0) {
      await query(client, 'UPDATE ai_lead_sequences SET last_generated_at = NOW(), next_run_at = NULL, updated_at = NOW() WHERE id = $1::uuid', [sequence.id])
      enqueued.push({ leadSequenceId: sequence.id, jobId: jobResult.rows[0].id, step: nextStepOrder, jobType })
    } else {
      skipped.push({ leadSequenceId: sequence.id, reason: 'duplicate_job' })
    }
  }
  return { scanned: dueResult.rowCount, enqueued, skipped, stopped, enqueuedCount: enqueued.length, skippedCount: skipped.length, stoppedCount: stopped.length }
}

async function markStepGenerated({ client = pool, leadSequenceId, step, queueId, executionJobId }) {
  const result = await query(client,
    `UPDATE ai_lead_sequences
        SET current_step = GREATEST(current_step, $2::integer), last_generated_at = NOW(), next_run_at = NULL, updated_at = NOW()
      WHERE id = $1::uuid
      RETURNING *`,
    [leadSequenceId, step]
  )
  const sequence = result.rows[0]
  if (sequence) {
    const template = await query(client, 'SELECT workspace_id, name FROM ai_sequence_templates WHERE id = $1::uuid', [sequence.template_id])
    await addTimelineEvent(client, {
      workspaceId: template.rows[0]?.workspace_id,
      leadId: sequence.lead_id,
      userId: null,
      eventType: 'ai_sequence_step_generated',
      title: 'AI sequence step generated',
      body: `Step ${step} generated for manager approval`,
      source: 'ai',
      metadata: { leadSequenceId, step, queueId, executionJobId, templateName: template.rows[0]?.name },
    })
  }
  return sequence
}

async function getSequenceDashboard({ workspaceId }) {
  const active = await query(pool,
    `SELECT s.*, l.name AS lead_name, t.name AS template_name, t.channel
       FROM ai_lead_sequences s JOIN ai_sequence_templates t ON t.id = s.template_id JOIN crm_leads l ON l.id = s.lead_id
      WHERE t.workspace_id = $1::uuid AND s.status = 'active'
      ORDER BY COALESCE(s.next_run_at, s.updated_at) ASC LIMIT 100`,
    [workspaceId]
  )
  const upcoming = active.rows.filter((row) => row.next_run_at).slice(0, 25).map(mapLeadSequence)
  const stoppedRows = await query(pool,
    `SELECT s.*, l.name AS lead_name, t.name AS template_name, t.channel
       FROM ai_lead_sequences s JOIN ai_sequence_templates t ON t.id = s.template_id JOIN crm_leads l ON l.id = s.lead_id
      WHERE t.workspace_id = $1::uuid AND s.status IN ('stopped','completed')
      ORDER BY s.updated_at DESC LIMIT 100`,
    [workspaceId]
  )
  const metrics = await query(pool,
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE s.status = 'active')::int AS active,
            COUNT(*) FILTER (WHERE s.status = 'stopped')::int AS stopped,
            COUNT(*) FILTER (WHERE s.status = 'completed')::int AS completed
       FROM ai_lead_sequences s JOIN ai_sequence_templates t ON t.id = s.template_id
      WHERE t.workspace_id = $1::uuid`,
    [workspaceId]
  )
  const m = metrics.rows[0] || {}
  const total = Number(m.total || 0)
  const completedCount = Number(m.completed || 0)
  return {
    activeSequences: active.rows.map(mapLeadSequence),
    upcomingSteps: upcoming,
    stoppedSequences: stoppedRows.rows.map(mapLeadSequence),
    completionRate: total > 0 ? Math.round((completedCount / total) * 1000) / 10 : 0,
    metrics: { total, active: Number(m.active || 0), stopped: Number(m.stopped || 0), completed: completedCount },
  }
}

module.exports = {
  SALES_SEQUENCE_STEP_GENERATION_JOB_TYPE,
  SEQUENCE_ACTION_TYPE,
  enqueueDueSequenceSteps,
  getDefaultTemplate,
  getSequenceDashboard,
  markStepGenerated,
  normalizeChannel,
  normalizeNullableText,
  normalizePositiveInteger,
  startSequence,
  pauseSequence,
  stopSequence,
  _private: { getSequenceStopReason, reconcileApprovedSequences, stopSequenceSafely },
}
