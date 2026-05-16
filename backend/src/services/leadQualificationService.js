const pool = require('../db/pool')
const { addTimelineEvent } = require('./timelineService')
const { scoreLeadContext, buildFollowUpDraft } = require('./leadIntelligenceService')

let intervalId = null
let running = false

function priorityFromScore(score) {
  if (score >= 75) return 'hot'
  if (score >= 45) return 'warm'
  return 'cold'
}

function buildRecommendation(lead, intelligence) {
  const channelLabel = {
    telegram: 'Telegram',
    email: 'email',
    phone: 'телефону',
    crm_task: 'CRM-задачу',
    Telegram: 'Telegram',
    Email: 'email',
  }[intelligence.recommendedChannel] || 'CRM-задачу'
  const timing = intelligence.score >= 75 ? 'в течение 15 минут' : intelligence.score >= 45 ? 'сегодня' : 'после уточнения контекста'
  const interest = intelligence.temperature === 'hot'
    ? 'Лид проявил высокий интерес к AI CRM и автоматизации продаж.'
    : intelligence.temperature === 'warm'
      ? 'Лид проявил умеренный интерес, нужно уточнить потребность и сроки.'
      : 'Лид требует дополнительной квалификации перед активной продажей.'
  const details = []
  if (!lead.company) details.push('размер команды')
  details.push('текущую CRM')
  if (!lead.phone && !lead.telegram) details.push('предпочтительный канал связи')
  return `Рекомендуется связаться в ${channelLabel} ${timing}. ${interest} Запросить ${details.join(' и ')}.`
}

async function ensureSdrWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, 'AI SDR', 'ai_sdr_agent', 'active', 'approval_required', 'Автоматически квалифицирует новых лидов, считает AI score и готовит рекомендации менеджеру.')
     ON CONFLICT (workspace_id, type) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [workspaceId]
  )
  return result.rows[0]
}

function buildContext(lead) {
  const metadata = lead.metadata || {}
  const message = lead.notes || lead.first_message || metadata.message || ''
  return {
    lead: {
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      telegram: lead.telegram || lead.telegram_username,
      source: lead.source,
      stage: lead.status,
      value: Number(lead.value || 0),
      notesText: message,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    },
    notes: message ? [{ body: message, source: lead.source || 'crm' }] : [],
    followUps: [],
    telegramMessages: [],
    emails: [],
    activity: [],
    landing: metadata,
  }
}

async function createQualificationQueueItem(client, { workspaceId, leadId, workerId, title, recommendation, payload = {} }) {
  const result = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, 'lead_prioritization', 'pending_approval', $4, $5, $6)
     RETURNING id`,
    [workerId, workspaceId, leadId, title, recommendation, payload]
  )
  return result.rows[0]
}

async function qualifyLead(client, { lead, userId, workspaceId, queueId = null }) {
  const context = buildContext(lead)
  const intelligence = scoreLeadContext(context, {})
  const priority = priorityFromScore(intelligence.score)
  const recommendation = buildRecommendation(lead, intelligence)
  const confidence = intelligence.confidence ?? Math.min(98, Math.max(45, Math.round(55 + intelligence.score * 0.35)))
  const scoreResult = await client.query(
    `INSERT INTO lead_ai_scores(workspace_id, lead_id, score, temperature, urgency, budget_probability, intent_summary, recommended_channel, recommended_next_step, confidence, deal_probability, urgency_level, engagement_level, ai_summary, next_best_action, risk_level, ideal_contact_timing, objections_detected, recommended_cta)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING *`,
    [workspaceId, lead.id, intelligence.score, priority, intelligence.urgencyLevel, intelligence.budgetProbability, intelligence.aiSummary, intelligence.recommendedChannel, recommendation, confidence, intelligence.dealProbability, intelligence.urgencyLevel, intelligence.engagementLevel, intelligence.aiSummary, recommendation, intelligence.riskLevel, intelligence.idealContactTiming, JSON.stringify(intelligence.objectionsDetected || []), intelligence.recommendedCta]
  )

  await client.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, 'ai_lead_qualified', 'AI квалификация лида', $4, $5)`,
    [userId, workspaceId, lead.id, `${intelligence.score}/100 · ${priority.toUpperCase()} · ${recommendation}`, { ...intelligence, priority, confidence, queueId }]
  )
  await addTimelineEvent(client, {
    workspaceId,
    leadId: lead.id,
    userId,
    eventType: 'ai_lead_qualified',
    title: 'AI квалификация лида',
    body: recommendation,
    source: 'ai',
    metadata: { score: intelligence.score, priority, recommendedChannel: intelligence.recommendedChannel, confidence, queueId },
  })

  let followUpJob = null
  if (intelligence.score > 75) {
    const draft = buildFollowUpDraft(context, intelligence)
    const suggestedChannel = ['telegram', 'email'].includes(draft.followupType) ? draft.followupType : 'crm'
    const followup = await client.query(
      `INSERT INTO ai_followup_jobs(workspace_id, lead_id, rule_type, status, suggested_channel, generated_message, scheduled_for, reason, urgency, metadata)
       VALUES($1, $2, 'hot_lead_auto_qualification', 'suggested', $3, $4, $5, $6, 'high', $7)
       RETURNING *`,
      [workspaceId, lead.id, suggestedChannel, draft.message, draft.scheduledFor, `AI score ${intelligence.score}/100: горячий лид требует быстрого касания`, { score: intelligence.score, priority, source: 'lead_qualification' }]
    )
    followUpJob = followup.rows[0]
  }

  if (queueId) {
    await client.query(
      `UPDATE ai_worker_queue
          SET recommendation = $3,
              payload = payload || $4::jsonb,
              updated_at = NOW()
        WHERE workspace_id = $1 AND id = $2`,
      [workspaceId, queueId, recommendation, { score: intelligence.score, priority, recommendedChannel: intelligence.recommendedChannel, confidence, followUpJobId: followUpJob?.id || null }]
    )
  }

  return { score: scoreResult.rows[0], intelligence, priority, recommendation, followUpJob }
}

async function qualifyLeadById({ workspaceId, leadId, queueId = null }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const leadResult = await client.query('SELECT * FROM crm_leads WHERE workspace_id = $1 AND id = $2 FOR UPDATE', [workspaceId, leadId])
    const lead = leadResult.rows[0]
    if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    const owner = await client.query("SELECT user_id FROM workspace_members WHERE workspace_id = $1 AND role = 'owner' ORDER BY created_at ASC LIMIT 1", [workspaceId])
    const userId = lead.user_id || owner.rows[0]?.user_id
    const result = await qualifyLead(client, { lead, userId, workspaceId, queueId })
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

function scheduleLeadQualification({ workspaceId, leadId, queueId }) {
  if (process.env.AI_LEAD_QUALIFICATION_WORKER === 'false') return
  setImmediate(() => {
    qualifyLeadById({ workspaceId, leadId, queueId }).catch((error) => console.error('Lead qualification worker failed', error.message || error))
  })
}

async function runLeadQualificationCycle(limit = Number(process.env.AI_LEAD_QUALIFICATION_BATCH_SIZE || 20)) {
  if (running) return []
  running = true
  try {
    const result = await pool.query(
      `SELECT id, workspace_id, lead_id
         FROM ai_worker_queue
        WHERE action_type = 'lead_prioritization'
          AND status = 'pending_approval'
          AND lead_id IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM lead_ai_scores s WHERE s.workspace_id = ai_worker_queue.workspace_id AND s.lead_id = ai_worker_queue.lead_id AND s.generated_at > ai_worker_queue.created_at)
        ORDER BY created_at ASC
        LIMIT $1`,
      [limit]
    )
    const qualified = []
    for (const item of result.rows) {
      qualified.push(await qualifyLeadById({ workspaceId: item.workspace_id, leadId: item.lead_id, queueId: item.id }).catch((error) => ({ queueId: item.id, error: error.message })))
    }
    return qualified
  } finally {
    running = false
  }
}

function startLeadQualificationWorker() {
  if (process.env.AI_LEAD_QUALIFICATION_WORKER === 'false' || intervalId) return
  const intervalMs = Number(process.env.AI_LEAD_QUALIFICATION_INTERVAL_MS || 60 * 1000)
  intervalId = setInterval(() => runLeadQualificationCycle().catch((error) => console.error('AI lead qualification cycle failed', error)), intervalMs)
  intervalId.unref?.()
}

module.exports = { buildRecommendation, createQualificationQueueItem, ensureSdrWorker, priorityFromScore, qualifyLeadById, runLeadQualificationCycle, scheduleLeadQualification, startLeadQualificationWorker }
