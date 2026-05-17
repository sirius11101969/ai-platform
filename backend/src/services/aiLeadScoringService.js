const pool = require('../db/pool')
const { addTimelineEvent } = require('./timelineService')
const { sanitizeAiCopy, sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')

const AI_LEAD_SCORING_WORKER_TYPE = 'ai_lead_scoring_engine'
const AI_LEAD_SCORING_WORKER_NAME = 'AI Lead Scoring Engine'
const LEAD_SCORING_ACTION = 'lead_scoring_update'
const PRIORITY_RECOMMENDATION_ACTION = 'lead_priority_recommendation'

function clampScore(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, Math.min(100, Math.round(number)))
}

function daysSince(value) {
  if (!value) return null
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return null
  return (Date.now() - time) / 86400000
}

function textIncludes(text, patterns) {
  return patterns.some((pattern) => pattern.test(text))
}

function temperatureForScore(score) {
  if (score <= 24) return 'cold'
  if (score <= 49) return 'warm'
  if (score <= 84) return 'hot'
  return 'priority'
}

function priorityForScore(score, { hasStrongBuyingSignal = false, riskLevel = 'low', isClosedWon = false, isClosedLost = false } = {}) {
  if (isClosedWon || isClosedLost) return 'low'
  if (score >= 85 && (hasStrongBuyingSignal || riskLevel === 'high')) return 'urgent'
  if (score >= 70) return 'priority'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

function isUrgentNextBestAction(result = {}) {
  const text = [result.nextBestAction, result.recommendedNextStep, result.nextBestActionCode, result.actionCode]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return /urgent|asap|сроч|немедленно|эскал|escalate/.test(text)
}

function shouldCreatePriorityRecommendation(result = {}) {
  const score = Number(result.score ?? result.aiScore ?? 0)
  const priority = result.priority || result.aiPriority
  const riskLevel = result.riskLevel || result.aiRiskLevel
  return ['priority', 'urgent'].includes(priority)
    || ['medium', 'high'].includes(riskLevel)
    || score >= 70
    || isUrgentNextBestAction(result)
}

function normalizeLeadStage(lead = {}) {
  return String(lead.status || lead.stage || lead.pipeline_stage || lead.stage_code || '').toLowerCase()
}

function isClosedWonStage(stage) {
  return ['won', 'closed_won'].includes(stage)
}

function isClosedLostStage(stage) {
  return ['lost', 'closed_lost'].includes(stage)
}

function isMeetingBooked(lead, meetings) {
  const stage = normalizeLeadStage(lead)
  return ['booked', 'meeting_booked', 'demo_booked'].includes(stage) || meetings.some((m) => !['cancelled', 'canceled', 'completed', 'done'].includes(String(m.status || '').toLowerCase()))
}

function hasEnterpriseTeamSignal(text) {
  return textIncludes(text, [/(?:team|команд[ауы]?|people|users|сотрудник(?:ов|а)?|человек|пользовател(?:ей|я))\D{0,18}(?:2[1-9]|[3-9]\d|\d{3,})/i, /(?:2[1-9]|[3-9]\d|\d{3,})\D{0,18}(?:team|команд[ауы]?|people|users|сотрудник(?:ов|а)?|человек|пользовател(?:ей|я))/i, /enterprise|энтерпрайз|корпоративн/i])
}

function compactReason(parts, fallback) {
  const text = parts.filter(Boolean).join('; ') || fallback
  if (text.length <= 500) return text
  return `${text.slice(0, 497).trim()}...`
}

function normalizeMessage(row) {
  return {
    ...row,
    text: row.message || row.body || row.text_body || row.subject || '',
    direction: row.direction || (row.role === 'user' ? 'inbound' : 'outbound'),
    createdAt: row.created_at || row.sent_at || row.createdAt,
  }
}

function calculateLeadScoring(context = {}) {
  const lead = context.lead || {}
  const telegramMessages = (context.telegramMessages || []).map(normalizeMessage)
  const emails = (context.emails || []).map(normalizeMessage)
  const followups = context.followups || []
  const meetings = context.meetings || []
  const notes = context.notes || []
  const activity = (context.activity || []).filter((a) => !['lead_scored', 'lead_risk_detected'].includes(String(a.type || a.event_type || '').toLowerCase()))
  const allText = [lead.notes, lead.notesText, lead.first_message, lead.firstMessage, lead.company, ...telegramMessages.map((m) => m.text), ...emails.map((m) => `${m.subject || ''} ${m.text || m.text_body || ''}`), ...notes.map((n) => n.body), ...activity.map((a) => `${a.title || ''} ${a.body || ''}`)].join('\n').toLowerCase()
  const inboundMessages = telegramMessages.filter((m) => m.direction === 'inbound' || m.role === 'user')
  const outboundMessages = telegramMessages.filter((m) => m.direction === 'outbound' || m.role === 'assistant')
  const lastInboundAt = inboundMessages.map((m) => m.createdAt).filter(Boolean).sort().at(-1) || null
  const lastOutboundAt = outboundMessages.map((m) => m.createdAt).filter(Boolean).sort().at(-1) || null
  const lastActivityAt = [lead.last_message_at, lead.lastMessageAt, lastInboundAt, lastOutboundAt, ...emails.map((m) => m.createdAt), ...followups.map((f) => f.created_at || f.createdAt), ...activity.map((a) => a.created_at || a.createdAt)].filter(Boolean).sort().at(-1) || lead.updated_at || lead.updatedAt || lead.created_at || lead.createdAt || null
  const inactiveDays = daysSince(lastActivityAt)
  const lastInboundDays = daysSince(lastInboundAt)
  const lastOutboundDays = daysSince(lastOutboundAt)
  const stage = normalizeLeadStage(lead)
  const isClosedWon = isClosedWonStage(stage)
  const isClosedLost = isClosedLostStage(stage)
  const bookedMeeting = isMeetingBooked(lead, meetings)
  const scheduledMeetings = meetings.filter((m) => ['scheduled', 'confirmed'].includes(String(m.status || '').toLowerCase()))
  const pastScheduledMeetings = scheduledMeetings.filter((m) => m.starts_at && new Date(m.starts_at).getTime() < Date.now())
  const hasPricingIntent = textIncludes(allText, [/цен[ауы]?|стоимост|прайс|price|pricing|budget|бюджет|тариф/i])
  const hasDemoIntent = textIncludes(allText, [/demo|демо|созвон|встреч|звонок|meet|calendar|календар/i])
  const hasCompanyIntent = Boolean(lead.company) || textIncludes(allText, [/команд|team|company|компан|отдел|менеджер|sales|crm/i])
  const hasEnterpriseIntent = hasEnterpriseTeamSignal(allText)
  const hasUrgencyIntent = textIncludes(allText, [/сроч|сегодня|завтра|urgent|asap|быстр|немедленно|this week|на этой неделе/i])
  const hotStages = ['hot', 'proposal', 'booked', 'meeting_booked', 'demo_booked']

  const factors = []
  const risks = []
  let score = 20
  const add = (code, points, reason) => { score += points; factors.push({ code, points, reason }) }
  const risk = (code, level, reason) => { risks.push({ code, level, reason }) }

  if (lastInboundDays !== null && lastInboundDays <= 2) add('recent_inbound', 8, 'недавний inbound')
  if (hasPricingIntent && hasDemoIntent) add('pricing_demo_intent', 18, 'цена + demo intent')
  else if (hasPricingIntent) add('pricing_intent', 10, 'pricing intent')
  else if (hasDemoIntent) add('demo_intent', 10, 'demo intent')
  if (bookedMeeting) add('meeting_booked', 18, 'встреча забронирована')
  if (hasEnterpriseIntent) add('enterprise_team', 12, 'enterprise/team >20')
  else if (hasCompanyIntent) add('company_context', 8, 'компания/команда указана')
  if (inboundMessages.length >= 2) add('multiple_inbound_messages', 8, 'несколько inbound сообщений')
  if (lead.telegram_chat_id || lead.telegramChatId || lead.telegram || lead.source === 'telegram') add('telegram_connected', 5, 'Telegram подключён')
  if (stage === 'booked') add('stage_booked', 12, 'stage booked')
  if (stage === 'proposal') add('stage_proposal', 14, 'stage proposal')
  if (hasUrgencyIntent) add('urgency_wording', 8, 'срочность в формулировках')

  if (!bookedMeeting && inactiveDays !== null && inactiveDays > 14) add('inactive_14d', -35, 'inactive >14d')
  else if (!bookedMeeting && inactiveDays !== null && inactiveDays > 7) add('inactive_7d', -20, 'inactive >7d')
  else if (!bookedMeeting && inactiveDays !== null && inactiveDays > 3) add('inactive_3d', -10, 'inactive >3d')

  if (inactiveDays !== null && inactiveDays > 7 && hotStages.includes(stage)) risk('inactive_hot_deal', 'high', 'inactive >7d на hot/proposal/booked stage')
  else if (inactiveDays !== null && inactiveDays > 3) risk('inactive_lead', 'medium', 'inactive >3d')
  if (lastOutboundDays !== null && (lastInboundDays === null || lastInboundDays > lastOutboundDays) && outboundMessages.length + followups.length >= 2) risk('ghosting_risk', 'high', 'несколько касаний без ответа')
  if (textIncludes(allText, [/не интересно|откаж|declin|cancel|отмена|не актуально|позже не нужно/i])) { add('declined_meeting', -22, 'отказ/отмена'); risk('deal_stalled', 'high', 'отказ или отмена следующего шага') }
  if (textIncludes(allText, [/bounce|bounced|delivery failed|undeliver|недостав/i])) { add('bounced_email', -18, 'email bounced'); risk('inactive_lead', 'medium', 'email канал недоступен') }
  if (pastScheduledMeetings.length && !textIncludes(allText, [/провели|итог|результат|спасибо за встреч/i])) risk('meeting_no_show_risk', 'medium', 'нет итога прошедшей встречи')

  if (isClosedLost) {
    const lostPenalty = -Math.max(0, score - 20)
    if (lostPenalty) add('closed_lost', lostPenalty, 'closed lost')
    score = Math.min(score, 20)
  }
  score = clampScore(score)
  const detectedRisk = risks.some((item) => item.level === 'high') ? 'high' : risks.some((item) => item.level === 'medium') ? 'medium' : 'low'
  const highestRisk = isClosedWon || isClosedLost ? 'low' : detectedRisk
  const temperature = isClosedLost ? 'cold' : temperatureForScore(score)
  const hasStrongBuyingSignal = (hasPricingIntent && hasDemoIntent) || bookedMeeting || hasEnterpriseIntent || hasUrgencyIntent
  const priority = priorityForScore(score, { hasStrongBuyingSignal, riskLevel: highestRisk, isClosedWon, isClosedLost })
  const positiveParts = factors.filter((f) => f.points > 0).map((f) => `+${f.points} ${f.reason}`)
  const negativeParts = factors.filter((f) => f.points < 0).map((f) => `${f.points} ${f.reason}`)
  const category = `${temperature}/${priority}`
  const scoringReason = compactReason([positiveParts.length ? `Плюсы: ${positiveParts.join(', ')}` : 'Плюсы: слабые сигналы', negativeParts.length ? `Минусы: ${negativeParts.join(', ')}` : 'Минусы: нет', risks.length ? `Риск: ${risks.map((r) => r.reason).join(', ')}` : null, `Итог: ${score}/100 ${category}`], 'Недостаточно сигналов, применён базовый cold/warm score.')
  const nextBestAction = priority === 'urgent' ? 'Срочно связаться с лидом и зафиксировать следующий шаг' : priority === 'priority' ? 'Зафиксировать следующий шаг в ближайшее время' : highestRisk === 'high' ? 'Рекомендуется срочный follow-up по риску' : score >= 50 ? 'Продолжить квалификацию и назначить demo' : score <= 24 ? 'Нужен прогрев и уточнение интереса' : 'Продолжить квалификацию лида'

  return {
    score,
    aiScore: score,
    priority,
    riskLevel: highestRisk,
    temperature,
    scoringReason,
    factors,
    risks,
    riskSignals: risks.map((item) => item.code),
    nextBestAction,
    recommendedNextStep: nextBestAction,
    probabilityToClose: score,
    dealProbability: score,
    engagementScore: Math.max(0, Math.min(100, score + (inboundMessages.length ? 5 : 0))),
    expectedRevenue: Math.round(Number(lead.value || 0) * score / 100),
  }
}

async function ensureLeadScoringWorker(client, workspaceId) {
  const executor = client || pool
  const result = await executor.query(
    `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
     VALUES($1, $2, $3, 'active', 'approval_required', 'Scores leads, detects priority/risk, updates CRM and recommendations.')
     ON CONFLICT (workspace_id, type) DO UPDATE
        SET name = EXCLUDED.name, status = 'active', mode = EXCLUDED.mode, description = EXCLUDED.description, updated_at = NOW()
     RETURNING id`,
    [workspaceId, AI_LEAD_SCORING_WORKER_NAME, AI_LEAD_SCORING_WORKER_TYPE]
  )
  return result.rows[0]
}

async function buildLeadScoringContext(executor, userId, workspaceId, leadId) {
  const [lead, telegramMessages, emails, notes, followups, activity, meetings] = await Promise.all([
    executor.query('SELECT * FROM crm_leads WHERE user_id = $1 AND workspace_id = $2 AND id = $3', [userId, workspaceId, leadId]),
    executor.query('SELECT * FROM telegram_messages WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 50', [workspaceId, leadId]),
    executor.query('SELECT * FROM email_messages WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 50', [workspaceId, leadId]),
    executor.query('SELECT * FROM crm_notes WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 25', [workspaceId, leadId]),
    executor.query('SELECT * FROM crm_followups WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 25', [workspaceId, leadId]),
    executor.query('SELECT * FROM crm_activity WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 50', [workspaceId, leadId]),
    executor.query('SELECT * FROM crm_meetings WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 10', [workspaceId, leadId]).catch(() => ({ rows: [] })),
  ])
  if (!lead.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  return { lead: lead.rows[0], telegramMessages: telegramMessages.rows, emails: emails.rows, notes: notes.rows, followups: followups.rows, activity: activity.rows, meetings: meetings.rows }
}

async function createPriorityRecommendation(client, { workspaceId, userId, leadId, lead, result, source }) {
  const stage = normalizeLeadStage(lead)
  if (isClosedWonStage(stage) || isClosedLostStage(stage)) {
    console.info('[lead-scoring] recommendation skipped low priority', { workspaceId, leadId, score: result.score, priority: result.priority, riskLevel: result.riskLevel, reason: 'closed_lead' })
    return null
  }
  if (!shouldCreatePriorityRecommendation(result)) {
    console.info('[lead-scoring] recommendation skipped low priority', { workspaceId, leadId, score: result.score, priority: result.priority, riskLevel: result.riskLevel })
    return null
  }
  const worker = await ensureLeadScoringWorker(client, workspaceId)
  const title = result.riskLevel === 'high' ? 'Риск потери лида' : result.priority === 'urgent' ? 'Срочный приоритетный лид' : result.priority === 'priority' ? 'Высокий шанс сделки' : 'Рекомендуется follow-up по риску'
  const recommendation = result.riskLevel === 'high' ? 'Рекомендуется срочный follow-up: высокий риск потери лида.' : result.nextBestAction
  const duplicate = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1 AND lead_id = $2 AND action_type = $3
        AND status IN ('pending_approval','approved')
        AND (
          payload->>'priority' = $4 OR payload->>'aiPriority' = $4
          OR payload->>'riskLevel' = $5 OR payload->>'aiRiskLevel' = $5
        )
      LIMIT 1`,
    [workspaceId, leadId, PRIORITY_RECOMMENDATION_ACTION, result.priority, result.riskLevel]
  )
  if (duplicate.rows[0]) {
    console.info('[lead-scoring] recommendation skipped low priority', { workspaceId, leadId, score: result.score, priority: result.priority, riskLevel: result.riskLevel, reason: 'duplicate_active_recommendation' })
    return duplicate.rows[0]
  }
  const inserted = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)
     RETURNING id`,
    [worker.id, workspaceId, leadId, PRIORITY_RECOMMENDATION_ACTION, title, sanitizeAiCopy(recommendation), sanitizeAiActionPayload({ source, score: result.score, aiScore: result.score, priority: result.priority, aiPriority: result.priority, temperature: result.temperature, riskLevel: result.riskLevel, aiRiskLevel: result.riskLevel, riskSignals: result.riskSignals, scoringReason: result.scoringReason, leadName: lead.name, recommendedNextStep: result.recommendedNextStep })]
  )
  console.info('[lead-scoring] recommendation created', { workspaceId, leadId, score: result.score, priority: result.priority, riskLevel: result.riskLevel, queueId: inserted.rows[0]?.id })
  return inserted.rows[0]
}

async function scoreLead({ userId, workspaceId, leadId, source = 'manual', client = null } = {}) {
  const executor = client || pool
  console.info('[lead-scoring] scoring started', { workspaceId, leadId, source })
  const context = await buildLeadScoringContext(executor, userId, workspaceId, leadId)
  const result = calculateLeadScoring(context)
  const run = async (tx) => {
    const scoringWorker = await ensureLeadScoringWorker(tx, workspaceId)
    await tx.query(
      `UPDATE crm_leads
          SET ai_score = $4,
              ai_priority = $5,
              ai_risk_level = $6,
              ai_temperature = $7,
              ai_last_scored_at = NOW(),
              ai_scoring_reason = $8,
              probability_to_close = GREATEST(COALESCE(probability_to_close, 0), $4),
              estimated_revenue = GREATEST(COALESCE(estimated_revenue, 0), $9),
              updated_at = NOW()
        WHERE user_id = $1 AND workspace_id = $2 AND id = $3`,
      [userId, workspaceId, leadId, result.score, result.priority, result.riskLevel, result.temperature, result.scoringReason, result.expectedRevenue]
    )
    await tx.query(
      `INSERT INTO lead_ai_scores(workspace_id, lead_id, score, temperature, deal_probability, probability_to_close, urgency_level, engagement_level, ai_summary, next_best_action, risk_level, recommended_next_step, confidence, engagement_score, expected_revenue, forecast_category, risk_signals, ai_reasoning, next_best_action_code)
       VALUES($1, $2, $3, CASE WHEN $4 = 'priority' THEN 'hot' ELSE $4 END, $3, $3, $5, CASE WHEN $3 >= 50 THEN 'hot' WHEN $3 >= 25 THEN 'warm' ELSE 'cold' END, $6, $7, $8, $7, $3, $9, $10, $11, $12, $6, $13)`,
      [workspaceId, leadId, result.score, result.temperature, result.priority === 'urgent' || result.priority === 'priority' ? 'high' : result.priority === 'high' ? 'medium' : 'low', result.scoringReason, result.nextBestAction, result.riskLevel, result.engagementScore, result.expectedRevenue, result.riskLevel === 'high' ? 'at_risk' : result.score >= 70 ? 'committed' : result.score >= 50 ? 'likely' : 'possible', JSON.stringify(result.riskSignals), result.riskLevel === 'high' ? 'escalate_to_manager' : result.score >= 50 ? 'schedule_demo' : 'follow_up_in_telegram']
    )
    await tx.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload, executed_at)
       VALUES($1, $2, $3, $4, 'completed', $5, $6, $7, NOW())`,
      [scoringWorker.id, workspaceId, leadId, LEAD_SCORING_ACTION, `AI Lead Scoring update — ${context.lead.name}`, sanitizeAiCopy(result.nextBestAction), sanitizeAiActionPayload({ source, score: result.score, priority: result.priority, temperature: result.temperature, riskLevel: result.riskLevel, scoringReason: result.scoringReason })]
    )
    await addTimelineEvent(tx, { workspaceId, leadId, userId, eventType: 'lead_scored', title: 'AI Lead Scoring обновлён', body: `Score ${result.score}/100 · ${result.temperature} · ${result.priority}. ${result.scoringReason}`, source: 'ai', metadata: result })
    if (result.riskLevel !== 'low') {
      console.info('[lead-scoring] risk detected', { workspaceId, leadId, riskLevel: result.riskLevel, riskSignals: result.riskSignals })
      await addTimelineEvent(tx, { workspaceId, leadId, userId, eventType: 'lead_risk_detected', title: 'AI Lead Scoring обнаружил риск', body: result.risks.map((item) => item.reason).join('; ') || result.scoringReason, source: 'ai', metadata: { riskLevel: result.riskLevel, riskSignals: result.riskSignals, risks: result.risks } })
    }
    await tx.query(
      `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
       VALUES($1, $2, $3, 'lead_scored', 'AI Lead Scoring обновлён', $4, $5)`,
      [userId, workspaceId, leadId, result.scoringReason, result]
    )
    await createPriorityRecommendation(tx, { workspaceId, userId, leadId, lead: context.lead, result, source })
  }

  if (client) await run(client)
  else {
    const tx = await pool.connect()
    try {
      await tx.query('BEGIN')
      await run(tx)
      await tx.query('COMMIT')
    } catch (error) {
      await tx.query('ROLLBACK')
      throw error
    } finally {
      tx.release()
    }
  }
  console.info('[lead-scoring] calibrated scoring applied', { workspaceId, leadId, score: result.score, priority: result.priority, riskLevel: result.riskLevel })
  console.info('[lead-scoring] lead updated', { workspaceId, leadId, score: result.score, priority: result.priority, riskLevel: result.riskLevel })
  return result
}

async function scoreActiveLeads(userId, workspaceId, { limit = 500, source = 'manual_scan' } = {}) {
  console.info('[lead-scoring] scoring started', { workspaceId, source, scope: 'active_leads' })
  const numericLimit = limit === null || limit === undefined ? null : Math.max(1, Math.min(Number(limit) || 500, 1000))
  const leads = await pool.query(
    `SELECT id FROM crm_leads
      WHERE user_id = $1 AND workspace_id = $2 AND status NOT IN ('won','lost','closed_won','closed_lost')
      ORDER BY COALESCE(ai_last_scored_at, created_at) ASC, updated_at DESC
      ${numericLimit ? 'LIMIT $3' : ''}`,
    numericLimit ? [userId, workspaceId, numericLimit] : [userId, workspaceId]
  )
  const scored = []
  for (const row of leads.rows) {
    try {
      scored.push({ leadId: row.id, result: await scoreLead({ userId, workspaceId, leadId: row.id, source }) })
    } catch (error) {
      scored.push({ leadId: row.id, error: error.message })
    }
  }
  return scored
}

module.exports = {
  AI_LEAD_SCORING_WORKER_NAME,
  AI_LEAD_SCORING_WORKER_TYPE,
  LEAD_SCORING_ACTION,
  PRIORITY_RECOMMENDATION_ACTION,
  calculateLeadScoring,
  ensureLeadScoringWorker,
  scoreActiveLeads,
  scoreLead,
  shouldCreatePriorityRecommendation,
  temperatureForScore,
}
