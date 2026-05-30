const pool = require('../db/pool')
const { OpenAiProvider } = require('../providers/openAiProvider')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')
const { addTimelineEvent } = require('./timelineService')

const LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE = 'lead_intelligence_analysis'
const REVENUE_FORECAST_GENERATION_JOB_TYPE = 'revenue_forecast_generation'
const AI_REVENUE_BRAIN_WORKER_TYPE = 'ai_revenue_brain'
const AI_REVENUE_BRAIN_WORKER_NAME = 'AI Revenue Brain'
const DEFAULT_QUEUE_NAME = process.env.AI_EXECUTION_QUEUE_NAME || 'ai-execution'
const DEFAULT_FORECAST_PERIOD = 'current_30_days'
const SILENT_LEAD_DAYS = 7
const STALLED_LEAD_DAYS = 10

function clampScore(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number)))
}

function clampMoney(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return 0
  return Number(number.toFixed(2))
}

function daysSince(value, now = Date.now()) {
  if (!value) return null
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return null
  return Math.max(0, (now - time) / 86400000)
}

function normalizeStage(stage) {
  return String(stage || '').trim().toLowerCase()
}

function stageScore(stage) {
  const scores = { new: 18, qualified: 42, proposal: 62, booked: 78, won: 100, lost: 0 }
  return scores[normalizeStage(stage)] ?? 30
}

function hasMeetingBooked(meetings = []) {
  return meetings.some((meeting) => ['scheduled', 'confirmed'].includes(String(meeting.status || '').toLowerCase()))
}

function inferRecommendedChannel({ lead = {}, inboundCount = 0, emailCount = 0, voiceCalls = [] }) {
  const lastVoice = voiceCalls[0]
  if (lastVoice?.sentiment === 'positive' && ['qualified_demo_interest', 'needs_nurture'].includes(String(lastVoice.outcome || ''))) return 'voice'
  if (lead.telegram_chat_id || lead.telegram || inboundCount > 0) return 'telegram'
  if (lead.email || emailCount > 0) return 'email'
  if (lead.phone || lead.phone_number || lead.contact) return 'voice'
  return 'crm'
}

function inferRecommendedAction({ priorityScore, closeProbability, churnRisk, pipelineHealth, silentDays, meetingBooked, stage }) {
  if (normalizeStage(stage) === 'lost') return 'Pause outreach'
  if (churnRisk >= 75 || pipelineHealth <= 35) return 'Escalate to manager'
  if (meetingBooked || closeProbability >= 72) return 'Schedule demo'
  if (normalizeStage(stage) === 'proposal' && silentDays !== null && silentDays >= 3) return 'Send pricing follow-up'
  if (priorityScore <= 25 && silentDays !== null && silentDays >= 14) return 'Pause outreach'
  return 'Send value follow-up'
}

function safeReason(parts) {
  const text = parts.filter(Boolean).join('; ')
  const fallback = 'Probabilistic score based only on available CRM activity and engagement signals.'
  return sanitizeAiCopy((text || fallback).slice(0, 700))
}

function calculateRevenueLeadScore(context = {}) {
  const now = context.now ? new Date(context.now).getTime() : Date.now()
  const lead = context.lead || {}
  const telegramMessages = context.telegramMessages || []
  const emailMessages = context.emailMessages || []
  const meetings = context.meetings || []
  const sequences = context.sequences || []
  const timeline = context.timeline || []
  const followups = context.followups || []
  const voiceCalls = context.voiceCalls || []
  const realtimeVoiceSessions = context.realtimeVoiceSessions || []
  const completedVoiceCalls = voiceCalls.filter((call) => call.status === 'completed')
  const positiveVoiceCalls = completedVoiceCalls.filter((call) => call.sentiment === 'positive')
  const completedRealtimeVoiceSessions = realtimeVoiceSessions.filter((session) => session.status === 'completed')
  const interruptedRealtimeVoiceSessions = realtimeVoiceSessions.filter((session) => session.status === 'interrupted' || session.session_metadata?.stateHistory?.some?.((entry) => entry.state === 'interrupted'))
  const stage = normalizeStage(lead.status || lead.stage)
  const inboundMessages = telegramMessages.filter((message) => ['inbound', 'user'].includes(String(message.direction || message.role || '').toLowerCase()))
  const outboundMessages = telegramMessages.filter((message) => ['outbound', 'assistant'].includes(String(message.direction || message.role || '').toLowerCase()))
  const recentInboundCount = inboundMessages.filter((message) => daysSince(message.created_at || message.createdAt, now) !== null && daysSince(message.created_at || message.createdAt, now) <= 7).length
  const recentEmailCount = emailMessages.filter((message) => daysSince(message.created_at || message.sent_at || message.createdAt, now) !== null && daysSince(message.created_at || message.sent_at || message.createdAt, now) <= 7).length
  const lastActivityCandidates = [lead.last_message_at, lead.last_seen_at, lead.updated_at, ...telegramMessages.map((m) => m.created_at || m.createdAt), ...emailMessages.map((m) => m.created_at || m.sent_at || m.createdAt), ...meetings.map((m) => m.starts_at || m.created_at), ...timeline.map((t) => t.created_at || t.createdAt), ...followups.map((f) => f.created_at || f.createdAt)].filter(Boolean)
  const lastActivityAt = lastActivityCandidates.sort().at(-1) || lead.created_at || null
  const silentDays = daysSince(lastActivityAt, now)
  const meetingBooked = hasMeetingBooked(meetings) || ['booked', 'demo_booked', 'meeting_booked'].includes(stage)
  const activeSequence = sequences.some((sequence) => String(sequence.status || '').toLowerCase() === 'active')
  const sequenceProgress = sequences.reduce((max, sequence) => Math.max(max, Number(sequence.current_step || sequence.currentStep || 0)), 0)
  const pastFollowupSuccess = timeline.some((event) => /reply|meeting|sent/i.test(`${event.event_type || event.type || ''} ${event.title || ''}`))
  const value = Number(lead.value || lead.estimated_revenue || 0)

  let engagementScore = 20
  engagementScore += Math.min(30, recentInboundCount * 12)
  engagementScore += Math.min(16, recentEmailCount * 6)
  engagementScore += outboundMessages.length > 0 ? 6 : 0
  engagementScore += meetingBooked ? 20 : 0
  engagementScore += activeSequence ? 8 : 0
  engagementScore += Math.min(10, sequenceProgress * 3)
  engagementScore += positiveVoiceCalls.length ? 30 : completedVoiceCalls.length ? 16 : 0
  engagementScore += completedRealtimeVoiceSessions.length ? 18 : realtimeVoiceSessions.length ? 10 : 0
  engagementScore += interruptedRealtimeVoiceSessions.length ? 6 : 0
  if (silentDays !== null && silentDays >= 7) engagementScore -= Math.min(35, Math.round((silentDays - 6) * 4))
  engagementScore = clampScore(engagementScore)

  let closeProbability = Math.round(stageScore(stage) * 0.45 + engagementScore * 0.45)
  if (meetingBooked) closeProbability += 12
  if (pastFollowupSuccess) closeProbability += 6
  if (value > 0) closeProbability += 3
  if (positiveVoiceCalls.length) closeProbability += 14
  if (completedRealtimeVoiceSessions.length) closeProbability += 10
  if (silentDays !== null && silentDays >= STALLED_LEAD_DAYS) closeProbability -= 18
  if (stage === 'won') closeProbability = 100
  if (stage === 'lost') closeProbability = 0
  closeProbability = clampScore(closeProbability)

  let churnRisk = 100 - engagementScore
  if (silentDays !== null && silentDays >= SILENT_LEAD_DAYS) churnRisk += Math.min(25, Math.round((silentDays - 6) * 3))
  if (stage === 'proposal' && silentDays !== null && silentDays >= 5) churnRisk += 12
  if (meetingBooked) churnRisk -= 18
  if (positiveVoiceCalls.length) churnRisk -= 12
  if (completedRealtimeVoiceSessions.length) churnRisk -= 8
  if (stage === 'won') churnRisk = 12
  if (stage === 'lost') churnRisk = 95
  churnRisk = clampScore(churnRisk)

  const pipelineHealth = clampScore(Math.round((closeProbability * 0.5) + (engagementScore * 0.35) + ((100 - churnRisk) * 0.15)))
  const priorityScore = clampScore(Math.round(closeProbability * 0.48 + engagementScore * 0.35 + (100 - churnRisk) * 0.17))
  const recommendedChannel = inferRecommendedChannel({ lead, inboundCount: inboundMessages.length, emailCount: emailMessages.length, voiceCalls })
  const recommendedAction = inferRecommendedAction({ priorityScore, closeProbability, churnRisk, pipelineHealth, silentDays, meetingBooked, stage })
  const reasoningSummary = safeReason([
    `Priority ${priorityScore}/100 is probabilistic guidance`,
    `${recentInboundCount} recent reply signal(s)`,
    activeSequence ? `active AI sequence at step ${sequenceProgress}` : 'no active AI sequence signal',
    meetingBooked ? 'meeting/demo signal is present' : null,
    completedRealtimeVoiceSessions.length ? `${completedRealtimeVoiceSessions.length} realtime voice simulation signal(s)` : null,
    silentDays !== null ? `last detected activity about ${Math.round(silentDays)} day(s) ago` : null,
    `stage is ${stage || 'unknown'}`,
  ])

  return {
    priorityScore,
    closeProbability,
    engagementScore,
    churnRisk,
    pipelineHealth,
    recommendedAction,
    recommendedChannel,
    reasoningSummary,
    silentDays,
    isSilent: silentDays !== null && silentDays >= SILENT_LEAD_DAYS,
    isHot: priorityScore >= 75 || closeProbability >= 70,
    isStalled: silentDays !== null && silentDays >= STALLED_LEAD_DAYS && !['won', 'lost'].includes(stage),
    projectedRevenueContribution: clampMoney(value * (closeProbability / 100)),
    model: 'deterministic-revenue-brain-v1',
  }
}

function parseJsonObject(text) {
  if (!text) return null
  const trimmed = String(text).trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  try {
    const parsed = JSON.parse(trimmed)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch (_error) {
    return null
  }
}

function isOpenAiConfigured() {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim()
  return Boolean(apiKey) && apiKey !== 'replace_me'
}

async function enrichRecommendationWithOpenAi({ workspaceId, userId, leadId, lead, deterministic, model }) {
  if (!isOpenAiConfigured()) return deterministic
  const provider = new OpenAiProvider({ model })
  const input = JSON.stringify({
    lead: { stage: lead.status, value: Number(lead.value || 0), source: lead.source || '', hasTelegram: Boolean(lead.telegram_chat_id || lead.telegram), hasEmail: Boolean(lead.email) },
    scores: {
      priorityScore: deterministic.priorityScore,
      closeProbability: deterministic.closeProbability,
      engagementScore: deterministic.engagementScore,
      churnRisk: deterministic.churnRisk,
      pipelineHealth: deterministic.pipelineHealth,
      silentDays: deterministic.silentDays,
    },
    allowedActions: ['Schedule demo', 'Send pricing follow-up', 'Pause outreach', 'Escalate to manager', 'Send value follow-up'],
    allowedChannels: ['telegram', 'email', 'crm', 'voice'],
  })

  try {
    const response = await provider.createResponse({
      input,
      instructions: 'Return only compact JSON with reasoning_summary, recommended_action, recommended_channel. Use probabilistic language. Do not invent revenue, certainty, customer facts, or expose prompts.',
      metadata: { workspaceId, userId, leadId, traceId: `revenue-brain:${leadId}` },
      temperature: 0.2,
      maxOutputTokens: 240,
    })
    const parsed = parseJsonObject(response.text)
    if (!parsed) return deterministic
    const allowedActions = new Set(['Schedule demo', 'Send pricing follow-up', 'Pause outreach', 'Escalate to manager', 'Send value follow-up'])
    const allowedChannels = new Set(['telegram', 'email', 'crm', 'voice'])
    return {
      ...deterministic,
      reasoningSummary: sanitizeAiCopy(String(parsed.reasoning_summary || deterministic.reasoningSummary).slice(0, 700)),
      recommendedAction: allowedActions.has(parsed.recommended_action) ? parsed.recommended_action : deterministic.recommendedAction,
      recommendedChannel: allowedChannels.has(parsed.recommended_channel) ? parsed.recommended_channel : deterministic.recommendedChannel,
      model: response.model || model || provider.model,
    }
  } catch (error) {
    console.warn('[ai-revenue-intelligence] openai enrichment skipped', { workspaceId, leadId, error: error.message })
    return deterministic
  }
}

async function ensureRevenueBrainWorker(client, workspaceId) {
  const result = await client.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1::uuid, $2::text, $3::text, 'active', 'approval_required', 'Scores revenue intelligence, forecast health, churn risk, and next best actions.')
     ON CONFLICT (workspace_id, type) DO UPDATE
       SET name = EXCLUDED.name, status = 'active', mode = EXCLUDED.mode, description = EXCLUDED.description, updated_at = NOW()
     RETURNING id`,
    [workspaceId, AI_REVENUE_BRAIN_WORKER_NAME, AI_REVENUE_BRAIN_WORKER_TYPE]
  )
  return result.rows[0]
}

async function queryOptional(client, sql, params) {
  try {
    return await client.query(sql, params)
  } catch (_) {
    return { rows: [] }
  }
}

async function buildLeadRevenueContext(client, workspaceId, leadId) {
  const queries = [
    () => client.query('SELECT * FROM crm_leads WHERE workspace_id = $1 AND id = $2', [workspaceId, leadId]),
    () => client.query('SELECT * FROM telegram_messages WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 50', [workspaceId, leadId]),
    () => queryOptional(client, 'SELECT * FROM email_messages WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 50', [workspaceId, leadId]),
    () => queryOptional(client, 'SELECT * FROM crm_meetings WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 20', [workspaceId, leadId]),
    () => queryOptional(client, 'SELECT * FROM ai_lead_sequences WHERE lead_id = $1 ORDER BY updated_at DESC LIMIT 5', [leadId]),
    () => queryOptional(client, 'SELECT * FROM lead_timeline_events WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 50', [workspaceId, leadId]),
    () => queryOptional(client, 'SELECT * FROM crm_followups WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 20', [workspaceId, leadId]),
    () => queryOptional(client, 'SELECT * FROM ai_voice_calls WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 10', [workspaceId, leadId]),
    () => queryOptional(client, 'SELECT * FROM ai_realtime_voice_sessions WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 10', [workspaceId, leadId]),
  ]
  const results = []
  if (client === pool) {
    results.push(...await Promise.all(queries.map((query) => query())))
  } else {
    for (const query of queries) results.push(await query())
  }
  const [lead, telegramMessages, emailMessages, meetings, sequences, timeline, followups, voiceCalls, realtimeVoiceSessions] = results
  if (!lead.rows[0]) return null
  return { lead: lead.rows[0], telegramMessages: telegramMessages.rows, emailMessages: emailMessages.rows, meetings: meetings.rows, sequences: sequences.rows, timeline: timeline.rows, followups: followups.rows, voiceCalls: voiceCalls.rows, realtimeVoiceSessions: realtimeVoiceSessions.rows }
}

async function persistLeadRevenueScore(client, { workspaceId, userId, leadId, score }) {
  await ensureRevenueBrainWorker(client, workspaceId)
  const result = await client.query(
    `INSERT INTO ai_lead_scores(
       workspace_id, lead_id, priority_score, close_probability, engagement_score, churn_risk,
       pipeline_health, recommended_action, recommended_channel, reasoning_summary, model, created_at, updated_at
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
     ON CONFLICT (workspace_id, lead_id) DO UPDATE SET
       priority_score = EXCLUDED.priority_score,
       close_probability = EXCLUDED.close_probability,
       engagement_score = EXCLUDED.engagement_score,
       churn_risk = EXCLUDED.churn_risk,
       pipeline_health = EXCLUDED.pipeline_health,
       recommended_action = EXCLUDED.recommended_action,
       recommended_channel = EXCLUDED.recommended_channel,
       reasoning_summary = EXCLUDED.reasoning_summary,
       model = EXCLUDED.model,
       updated_at = NOW()
     RETURNING *`,
    [workspaceId, leadId, score.priorityScore, score.closeProbability, score.engagementScore, score.churnRisk, score.pipelineHealth, score.recommendedAction, score.recommendedChannel, score.reasoningSummary, score.model]
  )

  await client.query(
    `UPDATE crm_leads
        SET ai_score = GREATEST(COALESCE(ai_score, 0), $3::integer),
            probability_to_close = $4::numeric,
            estimated_revenue = CASE WHEN COALESCE(value, 0) > 0 THEN ROUND((value * $4::numeric / 100.0)::numeric, 2) ELSE COALESCE(estimated_revenue, 0) END,
            ai_priority = CASE WHEN $3::integer >= 80 THEN 'urgent' WHEN $3::integer >= 65 THEN 'priority' WHEN $3::integer >= 45 THEN 'high' WHEN $3::integer >= 25 THEN 'medium' ELSE 'low' END,
            ai_risk_level = CASE WHEN $5::integer >= 70 THEN 'high' WHEN $5::integer >= 45 THEN 'medium' ELSE 'low' END,
            ai_temperature = CASE WHEN $3::integer >= 80 THEN 'priority' WHEN $3::integer >= 60 THEN 'hot' WHEN $3::integer >= 35 THEN 'warm' ELSE 'cold' END,
            ai_last_scored_at = NOW(),
            ai_scoring_reason = $6::text,
            updated_at = NOW()
      WHERE workspace_id = $1::uuid AND id = $2::uuid`,
    [workspaceId, leadId, score.priorityScore, score.closeProbability, score.churnRisk, score.reasoningSummary]
  )

  await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload, executed_at)
     SELECT w.id, $1::uuid, $2::uuid, 'revenue_next_best_action', 'completed', $3::text, $4::text, $5::jsonb, NOW()
       FROM ai_workers w
      WHERE w.workspace_id = $1::uuid AND w.type = $6::text
        AND NOT EXISTS (
          SELECT 1
            FROM ai_worker_queue q
           WHERE q.workspace_id = $1::uuid
             AND q.lead_id = $2::uuid
             AND q.action_type = 'revenue_next_best_action'
             AND q.created_at > NOW() - INTERVAL '6 hours'
        )
      LIMIT 1`,
    [workspaceId, leadId, `AI Revenue Brain — ${score.recommendedAction}`, sanitizeAiCopy(score.reasoningSummary), sanitizeAiActionPayload({ source: 'ai_revenue_intelligence', recommendedAction: score.recommendedAction, recommendedChannel: score.recommendedChannel, priorityScore: score.priorityScore, closeProbability: score.closeProbability, churnRisk: score.churnRisk }), AI_REVENUE_BRAIN_WORKER_TYPE]
  )

  await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'ai_revenue_intelligence_updated', title: 'AI Revenue Intelligence updated', body: `${score.recommendedAction} via ${score.recommendedChannel}. ${score.reasoningSummary}`, metadata: { priorityScore: score.priorityScore, closeProbability: score.closeProbability, churnRisk: score.churnRisk, pipelineHealth: score.pipelineHealth } }).catch(() => {})
  return result.rows[0]
}

async function analyzeLeadRevenueIntelligence({ workspaceId, userId = null, leadId, model = null, client = null } = {}) {
  const executor = client || pool
  const context = await buildLeadRevenueContext(executor, workspaceId, leadId)
  if (!context) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const deterministic = calculateRevenueLeadScore(context)
  const score = await enrichRecommendationWithOpenAi({ workspaceId, userId, leadId, lead: context.lead, deterministic, model })

  if (client) return persistLeadRevenueScore(client, { workspaceId, userId, leadId, score })

  const tx = await pool.connect()
  try {
    await tx.query('BEGIN')
    const saved = await persistLeadRevenueScore(tx, { workspaceId, userId, leadId, score })
    await tx.query('COMMIT')
    return saved
  } catch (error) {
    await tx.query('ROLLBACK')
    throw error
  } finally {
    tx.release()
  }
}

function normalizeLeadScoreRow(row = {}) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    leadName: row.lead_name || '',
    company: row.company || '',
    status: row.status || '',
    value: Number(row.value || 0),
    priorityScore: Number(row.priority_score || 0),
    closeProbability: Number(row.close_probability || 0),
    engagementScore: Number(row.engagement_score || 0),
    churnRisk: Number(row.churn_risk || 0),
    pipelineHealth: Number(row.pipeline_health || 0),
    recommendedAction: row.recommended_action || '',
    recommendedChannel: row.recommended_channel || '',
    reasoningSummary: row.reasoning_summary || '',
    model: row.model || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}


async function getLeadScores({ workspaceId, filter = '', sortBy = 'priorityScore', sortDirection = 'desc' } = {}) {
  const result = await pool.query(
    `SELECT s.*, l.name AS lead_name, l.company, l.status, l.value
       FROM ai_lead_scores s
       JOIN crm_leads l ON l.id = s.lead_id AND l.workspace_id = s.workspace_id
      WHERE s.workspace_id = $1::uuid
      ORDER BY s.priority_score DESC, s.close_probability DESC, s.updated_at DESC`,
    [workspaceId]
  )
  let scores = result.rows.map(normalizeLeadScoreRow)
  const activeFilter = String(filter || '').toLowerCase()
  if (activeFilter === 'hot') scores = scores.filter((score) => score.priorityScore >= 75 || score.closeProbability >= 70)
  if (activeFilter === 'high_probability') scores = scores.filter((score) => score.closeProbability >= 70)
  if (activeFilter === 'stalled') scores = scores.filter((score) => score.pipelineHealth <= 40 || score.churnRisk >= 70)
  if (activeFilter === 'at_risk') scores = scores.filter((score) => score.churnRisk >= 65)

  const sortFields = { priorityScore: 'priorityScore', closeProbability: 'closeProbability', churnRisk: 'churnRisk', updatedAt: 'updatedAt' }
  const field = sortFields[sortBy] || 'priorityScore'
  const direction = sortDirection === 'asc' ? 1 : -1
  return scores.sort((a, b) => {
    if (field === 'updatedAt') return (new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)) * direction
    return (Number(a[field] || 0) - Number(b[field] || 0)) * direction
  })
}

async function generateRevenueForecast({ workspaceId, forecastPeriod = DEFAULT_FORECAST_PERIOD, client = null } = {}) {
  const executor = client || pool
  const result = await executor.query(
    `WITH active_leads AS (
       SELECT l.id, l.value, l.status, l.updated_at,
              COALESCE(s.priority_score, l.ai_score, 0) AS priority_score,
              COALESCE(s.close_probability, l.probability_to_close, 0) AS close_probability,
              COALESCE(s.churn_risk, CASE WHEN l.updated_at < NOW() - INTERVAL '10 days' THEN 75 ELSE 35 END) AS churn_risk,
              COALESCE(s.pipeline_health, 50) AS pipeline_health
         FROM crm_leads l
         LEFT JOIN ai_lead_scores s ON s.workspace_id = l.workspace_id AND s.lead_id = l.id
        WHERE l.workspace_id = $1::uuid AND l.status NOT IN ('won','lost')
     )
     SELECT
       COALESCE(SUM(COALESCE(value, 0) * COALESCE(close_probability, 0) / 100.0), 0)::numeric AS projected_revenue,
       COALESCE(AVG(CASE WHEN close_probability > 0 THEN LEAST(95, GREATEST(35, pipeline_health)) END), 0)::numeric AS confidence_score,
       COALESCE(SUM(COALESCE(value, 0)), 0)::numeric AS active_pipeline_value,
       COUNT(*) FILTER (WHERE priority_score >= 75 OR close_probability >= 70)::integer AS hot_leads_count,
       COUNT(*) FILTER (WHERE churn_risk >= 70 OR updated_at < NOW() - INTERVAL '10 days')::integer AS stalled_leads_count
      FROM active_leads`,
    [workspaceId]
  )
  const row = result.rows[0] || {}
  const forecast = {
    forecastPeriod,
    projectedRevenue: clampMoney(row.projected_revenue),
    confidenceScore: clampScore(row.confidence_score),
    activePipelineValue: clampMoney(row.active_pipeline_value),
    hotLeadsCount: Number(row.hot_leads_count || 0),
    stalledLeadsCount: Number(row.stalled_leads_count || 0),
  }

  const save = await executor.query(
    `INSERT INTO ai_revenue_forecasts(workspace_id, forecast_period, projected_revenue, confidence_score, active_pipeline_value, hot_leads_count, stalled_leads_count, generated_at)
     VALUES($1,$2,$3,$4,$5,$6,$7,NOW())
     RETURNING *`,
    [workspaceId, forecast.forecastPeriod, forecast.projectedRevenue, forecast.confidenceScore, forecast.activePipelineValue, forecast.hotLeadsCount, forecast.stalledLeadsCount]
  )
  return save.rows[0]
}

async function getRevenueIntelligenceDashboard({ workspaceId } = {}) {
  const [scoresResult, forecastResult, metricsResult] = await Promise.all([
    pool.query(
      `SELECT s.*, l.name AS lead_name, l.company, l.status, l.value
         FROM ai_lead_scores s
         JOIN crm_leads l ON l.id = s.lead_id AND l.workspace_id = s.workspace_id
        WHERE s.workspace_id = $1::uuid
        ORDER BY s.priority_score DESC, s.close_probability DESC, s.updated_at DESC`,
      [workspaceId]
    ),
    pool.query('SELECT * FROM ai_revenue_forecasts WHERE workspace_id = $1::uuid ORDER BY generated_at DESC LIMIT 1', [workspaceId]),
    pool.query(
      `SELECT
         COALESCE((
           SELECT AVG(EXTRACT(EPOCH FROM (j.completed_at - j.created_at)) * 1000)
           FROM ai_execution_jobs j
           WHERE j.workspace_id = $1::uuid
             AND j.job_type IN ($2::text, $3::text)
             AND j.status = 'completed'
             AND j.completed_at IS NOT NULL
             AND j.created_at IS NOT NULL
             AND j.created_at >= NOW() - INTERVAL '30 days'
         ), 0)::numeric AS analysis_latency_ms,

         COALESCE((
           SELECT COUNT(*)
           FROM ai_execution_jobs j
           WHERE j.workspace_id = $1::uuid
             AND j.job_type = $2::text
             AND j.status = 'completed'
             AND j.created_at >= NOW() - INTERVAL '30 days'
         ), 0)::integer AS forecast_generation_count,

         COALESCE((
           SELECT COUNT(DISTINCT s.lead_id)
           FROM ai_lead_scores s
           JOIN crm_leads l ON l.id = s.lead_id AND l.workspace_id = s.workspace_id
           WHERE s.workspace_id = $1::uuid
             AND l.status NOT IN ('won','lost')
         ), 0)::integer AS scored_leads,

         COALESCE((
           SELECT COUNT(DISTINCT l.id)
           FROM crm_leads l
           WHERE l.workspace_id = $1::uuid
             AND l.status NOT IN ('won','lost')
         ), 0)::integer AS active_leads,

         COALESCE((
           SELECT COUNT(*)
           FROM ai_worker_queue q
           WHERE q.workspace_id = $1::uuid
             AND q.action_type = 'revenue_next_best_action'
             AND q.status IN ('approved','completed','executed')
             AND q.created_at >= NOW() - INTERVAL '30 days'
         ), 0)::integer AS recommendation_acceptance`,
      [workspaceId, REVENUE_FORECAST_GENERATION_JOB_TYPE, LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE]
    ),
  ])
  const scores = scoresResult.rows.map(normalizeLeadScoreRow)
  const latestForecast = forecastResult.rows[0] || null
  const metrics = metricsResult.rows[0] || {}
  const avgPipelineHealth = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.pipelineHealth, 0) / scores.length) : 0
  console.info('[ai-revenue-intelligence] revenue_intelligence_metrics_loaded', {
    workspaceId,
    scoredLeads: Number(metrics.scored_leads || 0),
    activeLeads: Number(metrics.active_leads || 0),
    forecastGenerationCount: Number(metrics.forecast_generation_count || 0),
  })
  return {
    hotLeads: scores.filter((score) => score.priorityScore >= 75 || score.closeProbability >= 70).slice(0, 10),
    highestCloseProbability: [...scores].sort((a, b) => b.closeProbability - a.closeProbability).slice(0, 10),
    stalledLeads: scores.filter((score) => score.churnRisk >= 70 || score.pipelineHealth <= 40).slice(0, 10),
    churnRisks: scores.filter((score) => score.churnRisk >= 65).slice(0, 10),
    nextBestActions: scores.filter((score) => score.recommendedAction).slice(0, 12),
    forecast: latestForecast ? {
      id: latestForecast.id,
      forecastPeriod: latestForecast.forecast_period,
      projectedRevenue: Number(latestForecast.projected_revenue || 0),
      confidenceScore: Number(latestForecast.confidence_score || 0),
      activePipelineValue: Number(latestForecast.active_pipeline_value || 0),
      hotLeadsCount: Number(latestForecast.hot_leads_count || 0),
      stalledLeadsCount: Number(latestForecast.stalled_leads_count || 0),
      generatedAt: latestForecast.generated_at,
    } : null,
    widgets: {
      forecastedRevenue: Number(latestForecast?.projected_revenue || 0),
      hotLeadsCount: scores.filter((score) => score.priorityScore >= 75 || score.closeProbability >= 70).length,
      aiPipelineHealth: avgPipelineHealth,
      engagementTrend: scores.length ? Math.round(scores.reduce((sum, score) => sum + score.engagementScore, 0) / scores.length) : 0,
      aiRecommendationsQueue: scores.filter((score) => score.recommendedAction).length,
    },
    metrics: {
      analysisLatencyMs: Math.round(Number(metrics.analysis_latency_ms || 0)),
      forecastGenerationCount: Number(metrics.forecast_generation_count || 0),
      scoringCoverage: Number(metrics.active_leads || 0) ? Math.round((Number(metrics.scored_leads || 0) / Number(metrics.active_leads || 1)) * 100) : 0,
      recommendationAcceptance: Number(metrics.recommendation_acceptance || 0),
    },
  }
}

async function enqueueDueRevenueIntelligence({ client = pool, queueName = DEFAULT_QUEUE_NAME, limit = 25, workspaceId = null } = {}) {
  const leadResult = await client.query(
    `SELECT l.id, l.workspace_id, l.user_id, COALESCE(MAX(s.updated_at), 'epoch'::timestamptz) AS last_scored_at
       FROM crm_leads l
       LEFT JOIN ai_lead_scores s ON s.workspace_id = l.workspace_id AND s.lead_id = l.id
      WHERE l.status NOT IN ('won','lost')
        AND ($2::uuid IS NULL OR l.workspace_id = $2::uuid)
      GROUP BY l.id, l.workspace_id, l.user_id
     HAVING COALESCE(MAX(s.updated_at), 'epoch'::timestamptz) < NOW() - INTERVAL '6 hours'
      ORDER BY last_scored_at ASC
      LIMIT $1::integer`,
    [limit, workspaceId]
  )
  const enqueued = []
  for (const lead of leadResult.rows) {
    const idempotencyKey = `${LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE}:${lead.workspace_id}:${lead.id}:${new Date().toISOString().slice(0, 13)}`
    const inserted = await client.query(
      `INSERT INTO ai_execution_jobs(workspace_id, user_id, queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
       VALUES($1,$2,$3,$4,70,'queued',$5::jsonb,2,NOW(),$6)
       ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
       RETURNING id`,
      [lead.workspace_id, lead.user_id, queueName, LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE, JSON.stringify({ source: 'autonomous_revenue_brain', leadId: lead.id }), idempotencyKey]
    )
    if (inserted.rows[0]) enqueued.push({ leadId: lead.id, jobId: inserted.rows[0].id })
  }

  const workspaceResult = await client.query(
    `SELECT w.id AS workspace_id, w.owner_user_id AS user_id
       FROM workspaces w
      WHERE EXISTS (SELECT 1 FROM crm_leads l WHERE l.workspace_id = w.id AND l.status NOT IN ('won','lost'))
        AND ($1::uuid IS NULL OR w.id = $1::uuid)
        AND NOT EXISTS (
          SELECT 1 FROM ai_revenue_forecasts f WHERE f.workspace_id = w.id AND f.generated_at > NOW() - INTERVAL '12 hours'
        )
      LIMIT 50`,
    [workspaceId]
  )
  const forecasts = []
  for (const workspace of workspaceResult.rows) {
    const idempotencyKey = `${REVENUE_FORECAST_GENERATION_JOB_TYPE}:${workspace.workspace_id}:${new Date().toISOString().slice(0, 10)}`
    const inserted = await client.query(
      `INSERT INTO ai_execution_jobs(workspace_id, user_id, queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
       VALUES($1,$2,$3,$4,60,'queued',$5::jsonb,2,NOW(),$6)
       ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
       RETURNING id`,
      [workspace.workspace_id, workspace.user_id, queueName, REVENUE_FORECAST_GENERATION_JOB_TYPE, JSON.stringify({ source: 'autonomous_revenue_brain', forecastPeriod: DEFAULT_FORECAST_PERIOD }), idempotencyKey]
    )
    if (inserted.rows[0]) forecasts.push({ workspaceId: workspace.workspace_id, jobId: inserted.rows[0].id })
  }
  return { scanned: leadResult.rowCount, enqueued, forecasts, enqueuedCount: enqueued.length + forecasts.length }
}

async function executeLeadIntelligenceAnalysisJob(job) {
  const leadId = job.payload?.leadId || job.payload?.lead_id
  if (!leadId) throw Object.assign(new Error('lead_intelligence_analysis payload.leadId is missing'), { nonRetryable: true })
  const score = await analyzeLeadRevenueIntelligence({ workspaceId: job.workspace_id, userId: job.user_id, leadId, model: job.payload?.model })
  return { ok: true, jobType: LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE, leadId, scoreId: score.id, priorityScore: score.priority_score, closeProbability: score.close_probability, recommendedAction: score.recommended_action, recommendedChannel: score.recommended_channel }
}

async function executeRevenueForecastGenerationJob(job) {
  const forecast = await generateRevenueForecast({ workspaceId: job.workspace_id, forecastPeriod: job.payload?.forecastPeriod || DEFAULT_FORECAST_PERIOD })
  return { ok: true, jobType: REVENUE_FORECAST_GENERATION_JOB_TYPE, forecastId: forecast.id, projectedRevenue: Number(forecast.projected_revenue || 0), confidenceScore: Number(forecast.confidence_score || 0) }
}

module.exports = {
  AI_REVENUE_BRAIN_WORKER_TYPE,
  LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE,
  REVENUE_FORECAST_GENERATION_JOB_TYPE,
  calculateRevenueLeadScore,
  enqueueDueRevenueIntelligence,
  executeLeadIntelligenceAnalysisJob,
  executeRevenueForecastGenerationJob,
  generateRevenueForecast,
  getLeadScores,
  getRevenueIntelligenceDashboard,
  analyzeLeadRevenueIntelligence,
  _private: { daysSince, inferRecommendedAction },
}
