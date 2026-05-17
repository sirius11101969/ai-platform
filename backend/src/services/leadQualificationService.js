const pool = require('../db/pool')
const { addTimelineEvent } = require('./timelineService')
const { scoreLeadContext, buildFollowUpDraft } = require('./leadIntelligenceService')
const { generateOutreachForLead } = require('./aiOutreachEngineService')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')

let intervalId = null
let running = false


function toInt(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : fallback
}

function toNumeric(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toText(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value)
}

function toJson(value, fallback) {
  return JSON.stringify(value === undefined ? fallback : value)
}

function buildLeadAiScoreParams({ workspaceId, leadId, intelligence, priority, recommendation, confidence }) {
  const probabilityToClose = toInt(intelligence.probabilityToClose ?? intelligence.dealProbability, 0)
  const score = toInt(intelligence.score, 0)
  const aiSummary = toText(intelligence.aiSummary, '')
  const nextBestAction = toText(intelligence.nextBestAction, recommendation)
  return [
    workspaceId,
    leadId,
    score,
    toText(priority || intelligence.temperature, 'cold'),
    toText(intelligence.urgencyLevel, 'low'),
    toInt(intelligence.budgetProbability ?? intelligence.dealProbability, probabilityToClose),
    aiSummary,
    toText(intelligence.recommendedChannel, 'crm_task'),
    toText(recommendation, nextBestAction),
    toInt(confidence ?? intelligence.confidence, 70),
    toInt(intelligence.dealProbability ?? probabilityToClose, probabilityToClose),
    probabilityToClose,
    toText(intelligence.urgencyLevel, 'low'),
    toText(intelligence.engagementLevel, 'cold'),
    aiSummary,
    nextBestAction,
    toText(intelligence.riskLevel, 'medium'),
    intelligence.idealContactTiming === undefined ? null : intelligence.idealContactTiming,
    toJson(intelligence.objectionsDetected || [], []),
    intelligence.recommendedCta === undefined ? null : intelligence.recommendedCta,
    toInt(intelligence.engagementScore ?? score, score),
    toNumeric(intelligence.expectedRevenue, 0),
    toText(intelligence.forecastCategory, 'possible'),
    toJson(intelligence.riskSignals || [], []),
    toText(intelligence.aiReasoning, aiSummary),
    toText(intelligence.nextBestActionCode, 'schedule_demo'),
  ]
}

function logLeadQualificationFailure({ leadId, workspaceId, error }) {
  console.error('[lead-qualification] failed', {
    leadId,
    workspaceId,
    errorCode: error?.code || error?.statusCode || null,
    errorMessage: error?.message || String(error),
  })
}

function priorityFromScore(score) {
  if (score >= 75) return 'hot'
  if (score >= 45) return 'warm'
  return 'cold'
}

function stageLabel(stage) {
  return ({ new: 'New', qualified: 'Qualified', proposal: 'Proposal', booked: 'Booked', won: 'Won', lost: 'Lost' }[stage] || stage || 'New')
}


function forecastTitle(actionType) {
  return ({
    risk_review: 'AI Risk Review',
    pipeline_health_alert: 'AI Pipeline Health Alert',
    stale_deal_followup: 'AI Stale Deal Follow-up',
  }[actionType] || 'AI Deal Forecast Action')
}

function buildRiskQueueTypes(lead, intelligence) {
  const riskSignals = intelligence.riskSignals || []
  const isHighValue = Number(lead.value || 0) >= 100000
  const isStalled = riskSignals.some((signal) => ['no_reply_3d', 'no_reply_7d', 'proposal_ignored', 'low_activity', 'high_value_stalled'].includes(signal))
  const needsRiskReview = intelligence.riskLevel !== 'low' || riskSignals.length > 0 || isHighValue || intelligence.forecastCategory === 'at_risk' || intelligence.forecastCategory === 'lost_risk'
  const actionTypes = []
  if (needsRiskReview) actionTypes.push('risk_review')
  if (isStalled || (isHighValue && intelligence.riskLevel !== 'low')) actionTypes.push('stale_deal_followup')
  if (['at_risk', 'lost_risk'].includes(intelligence.forecastCategory) || intelligence.riskLevel !== 'low') actionTypes.push('pipeline_health_alert')
  return [...new Set(actionTypes)]
}

function buildRiskRecommendation(lead, intelligence, actionType) {
  const probability = Number(intelligence.dealProbability || 0)
  const expectedRevenue = Number(intelligence.expectedRevenue || 0).toLocaleString('ru-RU')
  const signals = (intelligence.riskSignals || []).length ? ` Сигналы риска: ${(intelligence.riskSignals || []).join(', ')}.` : ''
  const prefix = actionType === 'stale_deal_followup'
    ? 'Сделка выглядит зависшей: нужен быстрый follow-up.'
    : actionType === 'pipeline_health_alert'
      ? 'AI обнаружил риск для здоровья воронки.'
      : 'AI рекомендует ручную проверку риска сделки.'
  return `${prefix} Вероятность закрытия ${probability}%, прогноз выручки ${expectedRevenue}. ${intelligence.aiReasoning || intelligence.aiSummary || ''}${signals} Следующее лучшее действие: ${intelligence.nextBestAction}.`
}

async function createForecastRiskQueueItems(client, { workspaceId, lead, intelligence }) {
  const worker = await ensureSdrWorker(client, workspaceId)
  const actionTypes = buildRiskQueueTypes(lead, intelligence)
  const created = []
  for (const actionType of actionTypes) {
    const duplicate = await client.query(
      `SELECT id FROM ai_worker_queue
        WHERE workspace_id = $1 AND lead_id = $2 AND action_type = $3
          AND status IN ('pending_approval', 'approved', 'executing')
          AND created_at > NOW() - INTERVAL '24 hours'
        LIMIT 1`,
      [workspaceId, lead.id, actionType]
    )
    if (duplicate.rows[0]) continue
    const payload = {
      source: 'ai_deal_risk_forecast_engine',
      leadId: lead.id,
      actionType,
      probabilityToClose: intelligence.probabilityToClose || intelligence.dealProbability,
      engagementScore: intelligence.engagementScore,
      expectedRevenue: intelligence.expectedRevenue,
      forecastCategory: intelligence.forecastCategory,
      riskLevel: intelligence.riskLevel,
      riskSignals: intelligence.riskSignals || [],
      nextBestAction: intelligence.nextBestAction,
      nextBestActionCode: intelligence.nextBestActionCode,
      aiReasoning: intelligence.aiReasoning || intelligence.aiSummary || '',
    }
    const result = await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)
       RETURNING id, action_type`,
      [worker.id, workspaceId, lead.id, actionType, forecastTitle(actionType), sanitizeAiCopy(buildRiskRecommendation(lead, intelligence, actionType)), sanitizeAiActionPayload(payload)]
    )
    created.push(result.rows[0])
  }
  return created
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
     VALUES($1, 'AI SDR', 'ai_sdr_agent', 'active', 'approval_required', 'Анализирует новых лидов, определяет приоритет и готовит рекомендации менеджеру.')
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
    [workerId, workspaceId, leadId, title, sanitizeAiCopy(recommendation), sanitizeAiActionPayload(payload)]
  )
  return result.rows[0]
}

async function qualifyLead(client, { lead, userId, workspaceId, queueId = null }) {
  const context = buildContext(lead)
  const intelligence = scoreLeadContext(context, {})
  const priority = priorityFromScore(intelligence.score)
  const recommendation = buildRecommendation(lead, intelligence)
  const confidence = intelligence.confidence ?? Math.min(98, Math.max(45, Math.round(55 + intelligence.score * 0.35)))
  const scoreParams = buildLeadAiScoreParams({ workspaceId, leadId: lead.id, intelligence, priority, recommendation, confidence })
  const scoreResult = await client.query(
    `INSERT INTO lead_ai_scores(
       workspace_id, lead_id, score, temperature, urgency, budget_probability, intent_summary,
       recommended_channel, recommended_next_step, confidence, deal_probability, probability_to_close,
       urgency_level, engagement_level, ai_summary, next_best_action, risk_level, ideal_contact_timing,
       objections_detected, recommended_cta, engagement_score, expected_revenue, forecast_category,
       risk_signals, ai_reasoning, next_best_action_code
     )
     VALUES(
       $1::uuid, $2::uuid, $3::integer, $4::text, $5::text, $6::integer, $7::text,
       $8::text, $9::text, $10::integer, $11::integer, $12::integer,
       $13::text, $14::text, $15::text, $16::text, $17::text, $18::text,
       $19::jsonb, $20::text, $21::integer, $22::numeric, $23::text,
       $24::jsonb, $25::text, $26::text
     )
     RETURNING *`,
    scoreParams
  )
  console.info('[lead-qualification] score saved', {
    leadId: lead.id,
    score: scoreParams[2],
    probabilityToClose: scoreParams[11],
    expectedRevenue: scoreParams[21],
  })

  await client.query(
    `UPDATE crm_leads
        SET probability_to_close = $3::integer,
            estimated_revenue = value * ($3::numeric / 100.0),
            expected_close_date = COALESCE(expected_close_date, (CURRENT_DATE + INTERVAL '30 days')::date),
            updated_at = NOW()
      WHERE workspace_id = $1::uuid AND id = $2::uuid`,
    [workspaceId, lead.id, scoreParams[11]]
  )

  const riskQueueItems = await createForecastRiskQueueItems(client, { workspaceId, lead, intelligence })

  await addTimelineEvent(client, {
    workspaceId,
    leadId: lead.id,
    userId,
    eventType: 'ai_forecast_updated',
    title: 'AI прогноз сделки обновлён',
    body: `AI обновил прогноз: вероятность закрытия ${intelligence.probabilityToClose || intelligence.dealProbability}%, ожидаемая выручка ${Number(intelligence.expectedRevenue || 0).toLocaleString('ru-RU')} ₽, категория ${intelligence.forecastCategory}.`,
    source: 'ai',
    metadata: { probabilityToClose: intelligence.probabilityToClose || intelligence.dealProbability, engagementScore: intelligence.engagementScore, expectedRevenue: intelligence.expectedRevenue, forecastCategory: intelligence.forecastCategory, riskLevel: intelligence.riskLevel },
  })
  if (intelligence.riskLevel !== 'low' || (intelligence.riskSignals || []).length) {
    await addTimelineEvent(client, {
      workspaceId,
      leadId: lead.id,
      userId,
      eventType: 'ai_risk_detected',
      title: 'AI обнаружил риск сделки',
      body: `${intelligence.aiReasoning || intelligence.aiSummary || 'Нужна проверка риска сделки.'} Следующее лучшее действие: ${intelligence.nextBestAction}.`,
      source: 'ai',
      metadata: { riskLevel: intelligence.riskLevel, riskSignals: intelligence.riskSignals || [], forecastCategory: intelligence.forecastCategory, queueItemIds: riskQueueItems.map((item) => item.id) },
    })
  }
  await addTimelineEvent(client, {
    workspaceId,
    leadId: lead.id,
    userId,
    eventType: 'ai_pipeline_health',
    title: 'AI оценил здоровье pipeline',
    body: `Pipeline health: риск ${intelligence.riskLevel}, engagement ${intelligence.engagementScore}/100, прогноз ${intelligence.forecastCategory}.`,
    source: 'ai',
    metadata: { riskLevel: intelligence.riskLevel, engagementScore: intelligence.engagementScore, forecastCategory: intelligence.forecastCategory, queueActionTypes: riskQueueItems.map((item) => item.action_type) },
  })

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

  let outreach = null
  try {
    outreach = await generateOutreachForLead(client, { workspaceId, userId, lead, intelligence: { ...intelligence, temperature: priority } })
  } catch (error) {
    console.error('AI outreach generation failed', { workspaceId, leadId: lead.id, error: error.message || error })
  }

  let stageSuggestion = null
  const temperature = intelligence.temperature || priority
  const shouldRecommendQualified = lead.status !== 'qualified' && !['won', 'lost'].includes(lead.status) && (intelligence.score >= 70 || temperature === 'hot')
  if (shouldRecommendQualified) {
    const fromStage = lead.status || 'new'
    const toStage = 'qualified'
    const reason = `${intelligence.aiSummary || 'Клиент проявил высокий интерес к AI CRM и запросил детали внедрения.'} Рекомендуется перевести лида в стадию Qualified.`
    const existingStage = await client.query(
      `SELECT id FROM ai_worker_queue
        WHERE workspace_id = $1 AND lead_id = $2 AND action_type = 'stage_change_recommendation'
          AND COALESCE(payload->>'toStage', payload->>'nextStatus', payload->>'status') = $3
          AND created_at > NOW() - INTERVAL '24 hours'
          AND status IN ('pending_approval', 'approved', 'executing', 'completed')
        LIMIT 1`,
      [workspaceId, lead.id, toStage]
    )
    if (!existingStage.rows[0]) {
      const suggested = await client.query(
        `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
         VALUES($1, $2, $3, 'stage_change_recommendation', 'pending_approval', $4, $5, $6)
         RETURNING id`,
        [lead.worker_id || (await ensureSdrWorker(client, workspaceId)).id, workspaceId, lead.id, `Перевести лида в Qualified — ${lead.name}`, sanitizeAiCopy(reason), sanitizeAiActionPayload({ source: 'lead_qualification', leadId: lead.id, fromStage, toStage, currentStatus: fromStage, nextStatus: toStage, status: toStage, confidence, reason, score: intelligence.score, temperature })]
      )
      stageSuggestion = suggested.rows[0]
      await addTimelineEvent(client, { workspaceId, leadId: lead.id, userId, eventType: 'ai_stage_recommendation', title: 'AI рекомендовал смену этапа', body: `AI рекомендовал перевести лида в стадию ${stageLabel(toStage)}.`, source: 'ai', metadata: { queueId: stageSuggestion.id, fromStage, toStage, confidence, reason, score: intelligence.score } })
    }
  }

  let followUpJob = null
  if (intelligence.score > 75) {
    const draft = buildFollowUpDraft(context, intelligence)
    const suggestedChannel = ['telegram', 'email'].includes(draft.followupType) ? draft.followupType : 'crm'
    const followup = await client.query(
      `INSERT INTO ai_followup_jobs(workspace_id, lead_id, rule_type, status, suggested_channel, generated_message, scheduled_for, reason, urgency, metadata)
       VALUES($1, $2, 'hot_lead_auto_qualification', 'suggested', $3, $4, $5, $6, 'high', $7)
       RETURNING *`,
      [workspaceId, lead.id, suggestedChannel, draft.message, draft.scheduledFor, 'Высокий приоритет: стоит быстро связаться с лидом', { score: intelligence.score, priority, source: 'lead_qualification' }]
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
      [workspaceId, queueId, sanitizeAiCopy(recommendation), sanitizeAiActionPayload({ score: intelligence.score, priority, recommendedChannel: intelligence.recommendedChannel, confidence, probabilityToClose: intelligence.probabilityToClose || intelligence.dealProbability, engagementScore: intelligence.engagementScore, expectedRevenue: intelligence.expectedRevenue, forecastCategory: intelligence.forecastCategory, riskLevel: intelligence.riskLevel, riskQueueItemIds: riskQueueItems.map((item) => item.id), followUpJobId: followUpJob?.id || null, outreach, stageSuggestionId: stageSuggestion?.id || null })]
    )
  }

  return { score: scoreResult.rows[0], intelligence, priority, recommendation, followUpJob, outreach, stageSuggestion }
}

async function qualifyLeadById({ workspaceId, leadId, queueId = null }) {
  let client
  try {
    client = await pool.connect()
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
    if (client) await client.query('ROLLBACK').catch(() => {})
    logLeadQualificationFailure({ leadId, workspaceId, error })
    throw error
  } finally {
    client?.release()
  }
}

function scheduleLeadQualification({ workspaceId, leadId, queueId }) {
  if (process.env.AI_LEAD_QUALIFICATION_WORKER === 'false') return
  setImmediate(() => {
    qualifyLeadById({ workspaceId, leadId, queueId }).catch(() => {})
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
