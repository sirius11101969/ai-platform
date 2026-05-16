const axios = require('axios')
const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const emailService = require('./emailService')
const { sendTelegramMessageToLead } = require('./telegramService')
const { addTimelineEvent } = require('./timelineService')
const { DEFAULT_FOLLOWUP_RULES, ensureDefaultRulesForWorkspace } = require('./aiFollowupRulesService')

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
const STATUSES = ['suggested', 'approved', 'rejected', 'sent', 'failed']
const CHANNELS = ['telegram', 'email', 'crm']

function extractResponseText(data) {
  if (data?.output_text) return data.output_text.trim()
  const chunks = []
  for (const item of data?.output || []) for (const content of item.content || []) if ((content.type === 'output_text' || content.type === 'text') && content.text) chunks.push(content.text)
  return chunks.join('\n').trim()
}

function normalize(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    ruleType: row.rule_type,
    status: row.status,
    suggestedChannel: row.suggested_channel,
    generatedMessage: row.generated_message || '',
    scheduledFor: row.scheduled_for,
    approvedAt: row.approved_at,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reason: row.reason || row.metadata?.reason || '',
    urgency: row.urgency || row.metadata?.urgency || 'medium',
    error: row.error || '',
    metadata: row.metadata || {},
    lead: row.lead || (row.lead_name ? { id: row.lead_id, name: row.lead_name, company: row.lead_company, email: row.lead_email, status: row.lead_status, telegramChatId: row.lead_telegram_chat_id } : null),
  }
}

function chooseChannel(lead) {
  if (lead.telegram_chat_id || lead.telegramChatId) return 'telegram'
  if (lead.email) return 'email'
  return 'crm'
}

function fallbackMessage({ lead, rule }) {
  const nextStep = rule.ruleType === 'meeting_no_next_step' ? 'зафиксировать следующий шаг после встречи' : rule.ruleType === 'proposal_no_reply' ? 'обсудить предложение и вопросы' : 'коротко сверить актуальность задачи'
  return [`Здравствуйте, ${lead.name}!`, `Возвращаюсь по вашему запросу${lead.company ? ` для ${lead.company}` : ''}: ${rule.reason}.`, `Предлагаю ${nextStep}. Подскажите, пожалуйста, когда удобно продолжить?`].join('\n\n')
}

async function generateMessage({ lead, rule, context }) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-4.1'
  if (!apiKey) return { message: fallbackMessage({ lead, rule }), model: 'fallback-no-openai-key', aiError: 'OPENAI_API_KEY is not configured; fallback draft generated' }

  const prompt = {
    lead: { name: lead.name, company: lead.company, email: lead.email, phone: lead.phone, stage: lead.status, value: lead.value, source: lead.source, notes: lead.notesText },
    rule,
    telegramMessages: context.telegramMessages,
    emailHistory: context.emailHistory,
    notes: context.notes,
    previousAiRecommendations: context.previousAiRecommendations,
  }
  const { data } = await axios.post(OPENAI_RESPONSES_URL, {
    model,
    input: [
      { role: 'system', content: 'Generate a concise Russian B2B CRM follow-up draft. Be helpful, honest, low-pressure, and include one clear next step. Do not claim anything was sent. Return only the message text.' },
      { role: 'user', content: JSON.stringify(prompt, null, 2) },
    ],
    temperature: 0.5,
    max_output_tokens: 420,
  }, { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: Number(process.env.OPENAI_TIMEOUT_MS || 60000) })
  const message = extractResponseText(data)
  if (!message) throw new Error('OpenAI returned an empty follow-up message')
  return { message, model, openaiResponseId: data.id }
}

async function getLeadContext(workspaceId, leadId) {
  const [telegram, emails, notes, aiActions] = await Promise.all([
    pool.query('SELECT role, message, created_at FROM telegram_messages WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 12', [workspaceId, leadId]),
    pool.query('SELECT subject, text_body, status, error, created_at, sent_at FROM email_messages WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 10', [workspaceId, leadId]),
    pool.query('SELECT body, created_at FROM crm_notes WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 10', [workspaceId, leadId]),
    pool.query("SELECT task_type, output_result, created_at FROM ai_agent_actions WHERE workspace_id = $1 AND lead_id = $2 AND status = 'completed' ORDER BY created_at DESC LIMIT 5", [workspaceId, leadId]),
  ])
  return { telegramMessages: telegram.rows.reverse(), emailHistory: emails.rows, notes: notes.rows, previousAiRecommendations: aiActions.rows }
}

function normalizeRule(row) {
  const fallback = DEFAULT_FOLLOWUP_RULES.find((rule) => rule.ruleType === row.rule_type) || {}
  return {
    ruleType: row.rule_type,
    suggestedChannel: CHANNELS.includes(row.suggested_channel) ? row.suggested_channel : fallback.suggestedChannel || 'crm',
    config: row.config || fallback.config || {},
    reason: row.config?.reason || fallback.reason || 'AI обнаружил необходимость касания',
    urgency: row.config?.urgency || fallback.urgency || 'medium',
    scheduledHours: Number(row.config?.scheduledHours ?? fallback.scheduledHours ?? 1),
  }
}


async function loadActiveRules(workspaceId) {
  const result = await pool.query(
    `SELECT rule_type, suggested_channel, config
       FROM ai_followup_rules
      WHERE workspace_id = $1 AND status = 'active'
      ORDER BY created_at ASC`,
    [workspaceId]
  )
  return result.rows.map(normalizeRule)
}

function normalizeComparable(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getLeadStage(lead) {
  return lead.followup_stage || lead.stage || lead.status || 'new'
}

function getNormalizedLeadStage(lead) {
  return normalizeComparable(getLeadStage(lead) || 'new') || 'new'
}

function getLeadLastActivityAt(lead) {
  const rawActivity = lead.last_message_at || lead.updated_at || lead.created_at
  const lastActivity = rawActivity ? new Date(rawActivity) : new Date()
  return Number.isNaN(lastActivity.getTime()) ? new Date() : lastActivity
}

function getLeadInactivityHours(lead) {
  const lastActivity = getLeadLastActivityAt(lead)
  return Math.max(0, (Date.now() - lastActivity.getTime()) / 36e5)
}

function getRuleThresholdHours(rule) {
  const configured = Number(rule.config?.thresholdHours)
  if (Number.isFinite(configured) && configured > 0) return configured
  if (rule.ruleType === 'no_reply_3d') return 72
  if (rule.ruleType === 'no_reply_7d') return 168
  return 24
}

function getLeadAiScore(lead) {
  return Number(lead.ai_score ?? lead.aiScore ?? lead.score ?? 0)
}

const CLOSED_LEAD_STAGES = new Set(['won', 'lost', 'closed_won', 'closed_lost', 'successful', 'потеряно', 'успешно'])

function isOpenLead(lead) {
  return !CLOSED_LEAD_STAGES.has(getNormalizedLeadStage(lead))
}

function buildSkipReason({ isOpen, stageMatches, inactivityMatches, scoreMatches }) {
  if (!isOpen) return 'lead stage is closed'
  if (!stageMatches) return 'stage mismatch'
  if (!inactivityMatches) return 'inactivity below threshold'
  if (!scoreMatches) return 'score below threshold'
  return null
}

function evaluateRule(lead, rule) {
  const leadStage = getLeadStage(lead)
  const normalizedLeadStage = getNormalizedLeadStage(lead)
  const configStage = rule.config?.stage
  const normalizedConfigStage = normalizeComparable(configStage)
  const thresholdHours = getRuleThresholdHours(rule)
  const inactiveHours = Math.round(getLeadInactivityHours(lead) * 10) / 10
  const aiScore = getLeadAiScore(lead)
  const minScore = Number(rule.config?.minScore)
  const isOpen = isOpenLead(lead)
  let stageMatches = true
  let inactivityMatches = inactiveHours >= thresholdHours
  let scoreMatches = true

  switch (rule.ruleType) {
    case 'proposal_no_reply':
      stageMatches = normalizedLeadStage === normalizedConfigStage
      inactivityMatches = inactiveHours >= Number(rule.config?.thresholdHours)
      break
    case 'no_reply_24h':
    case 'no_reply_3d':
    case 'no_reply_7d':
      stageMatches = isOpen
      break
    case 'meeting_no_next_step':
      stageMatches = normalizedLeadStage === normalizeComparable(configStage || 'booked')
      break
    case 'hot_lead_inactive':
      scoreMatches = Number.isFinite(minScore) ? aiScore >= minScore : aiScore >= 70
      break
    default:
      if (normalizedConfigStage) stageMatches = normalizedLeadStage === normalizedConfigStage
      if (Number.isFinite(minScore)) scoreMatches = aiScore >= minScore
      break
  }

  const matched = isOpen && stageMatches && inactivityMatches && scoreMatches
  const skipReason = matched ? null : buildSkipReason({ isOpen, stageMatches, inactivityMatches, scoreMatches })
  return {
    matched,
    finalMatch: matched,
    ruleType: rule.ruleType,
    leadStage,
    stage: leadStage,
    configStage,
    inactiveHours,
    thresholdHours,
    aiScore,
    stageMatches,
    inactivityMatches,
    scoreMatches,
    skipReason,
    reason: matched ? 'matched' : skipReason,
    rule: matched
      ? {
          ...rule,
          reason: rule.reason,
          urgency: rule.urgency,
          scheduledHours: rule.scheduledHours,
          inactiveHours,
        }
      : null,
  }
}

function leadSkipReason(evaluations, activeRules) {
  if (!activeRules.length) return 'no active follow-up rules'
  return evaluations.filter((evaluation) => !evaluation.matched).map((evaluation) => `${evaluation.ruleType}: ${evaluation.reason}`).slice(0, 3).join('; ') || 'no rule matched'
}

function buildRuleEvaluations(lead, activeRules) {
  return activeRules.map((rule) => evaluateRule(lead, rule))
}

async function getTableColumns(tableName) {
  const result = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = $1`,
    [tableName]
  )
  return new Set(result.rows.map((row) => row.column_name))
}

async function insertFollowupJob({ workspaceId, leadId, rule, channel, message, metadata }) {
  const columns = await getTableColumns('ai_followup_jobs')
  const insertColumns = ['workspace_id', 'lead_id', 'rule_type', 'status', 'suggested_channel', 'generated_message', 'scheduled_for', 'metadata']
  const values = [workspaceId, leadId, rule.ruleType, 'suggested', channel, message, rule.scheduledHours, metadata]
  const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6', "NOW() + ($7::int * INTERVAL '1 hour')", '$8']

  if (columns.has('reason')) {
    insertColumns.push('reason')
    values.push(rule.reason)
    placeholders.push(`$${values.length}`)
  }
  if (columns.has('urgency')) {
    insertColumns.push('urgency')
    values.push(rule.urgency)
    placeholders.push(`$${values.length}`)
  }

  return pool.query(
    `INSERT INTO ai_followup_jobs(${insertColumns.join(', ')})
     VALUES(${placeholders.join(', ')}) RETURNING *`,
    values
  )
}

async function scanWorkspace(userId, workspaceId) {
  const seedResult = await ensureDefaultRulesForWorkspace(workspaceId)
  const activeRules = await loadActiveRules(workspaceId)
  console.info('[ai-followups] scan started', {
    userId,
    workspaceId,
    activeRulesCount: activeRules.length,
    activeRules: activeRules.map((rule) => ({ ruleType: rule.ruleType, thresholdHours: getRuleThresholdHours(rule), config: rule.config })),
  })
  const leadsResult = await pool.query(
    `WITH activity AS (
       SELECT l.id AS lead_id,
              COALESCE(l.last_message_at, l.updated_at, l.created_at) AS last_activity_at
         FROM crm_leads l
        WHERE l.workspace_id = $1
          AND LOWER(TRIM(COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new'))) NOT IN ('won','lost','closed_won','closed_lost','successful','потеряно','успешно')
     ), latest_score AS (
       SELECT DISTINCT ON (lead_id) lead_id, score, temperature FROM lead_ai_scores WHERE workspace_id = $1 ORDER BY lead_id, generated_at DESC
     )
     SELECT l.*, COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new') AS followup_stage, a.last_activity_at, s.score, s.temperature
       FROM crm_leads l JOIN activity a ON a.lead_id = l.id LEFT JOIN latest_score s ON s.lead_id = l.id
      WHERE l.workspace_id = $1
        AND LOWER(TRIM(COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new'))) NOT IN ('won','lost','closed_won','closed_lost','successful','потеряно','успешно')`, [workspaceId]
  )
  console.info('[ai-followups] leads loaded for scan', { userId, workspaceId, scannedLeadsCount: leadsResult.rows.length })

  const createdJobs = []
  const skippedDuplicateJobs = []
  const debugEvaluations = []
  let matchedLeadsCount = 0
  for (const row of leadsResult.rows) {
    const stage = getLeadStage(row)
    const inactiveHours = Math.round(getLeadInactivityHours(row) * 10) / 10
    const aiScore = getLeadAiScore(row)
    console.info('[ai-followups] scanning lead', { workspaceId, leadId: row.id, name: row.name, stage, inactiveHours, aiScore, lastActivityAt: row.last_activity_at })

    const lead = crmModel.CRM_STATUSES ? { ...row, id: row.id, status: stage } : { ...row, status: stage }
    const evaluations = buildRuleEvaluations(row, activeRules)
    for (const evaluation of evaluations) {
      const debugEvaluation = {
        workspaceId,
        leadId: row.id,
        leadName: row.name,
        leadStage: evaluation.leadStage,
        ruleType: evaluation.ruleType,
        configStage: evaluation.configStage,
        thresholdHours: evaluation.thresholdHours,
        inactiveHours: evaluation.inactiveHours,
        stageMatches: evaluation.stageMatches,
        inactivityMatches: evaluation.inactivityMatches,
        scoreMatches: evaluation.scoreMatches,
        finalMatch: evaluation.finalMatch,
        skipReason: evaluation.skipReason,
      }
      debugEvaluations.push(debugEvaluation)
      console.info('[ai-followups] rule match evaluated', debugEvaluation)
    }

    const matchedRules = evaluations.filter((evaluation) => evaluation.matched).map((evaluation) => evaluation.rule)
    if (!matchedRules.length) {
      console.info('[ai-followups] lead skipped', { workspaceId, leadId: row.id, stage, inactiveHours, reason: leadSkipReason(evaluations, activeRules), lastActivityAt: row.last_activity_at })
      continue
    }

    matchedLeadsCount += 1
    console.info('[ai-followups] lead matched rules', { workspaceId, leadId: row.id, ruleTypes: matchedRules.map((rule) => rule.ruleType) })
    for (const rule of matchedRules) {
      const duplicate = await pool.query(
        `SELECT id FROM ai_followup_jobs
          WHERE workspace_id = $1
            AND lead_id = $2
            AND rule_type = $3
            AND created_at > NOW() - INTERVAL '24 hours'
            AND status IN ('suggested', 'approved', 'sent')
          LIMIT 1`,
        [workspaceId, row.id, rule.ruleType]
      )
      if (duplicate.rows[0]) {
        skippedDuplicateJobs.push({ leadId: row.id, ruleType: rule.ruleType, jobId: duplicate.rows[0].id })
        console.info('[ai-followups] skipped duplicate job', { workspaceId, leadId: row.id, ruleType: rule.ruleType, duplicateJobId: duplicate.rows[0].id })
        continue
      }

      const context = await getLeadContext(workspaceId, row.id)
      const generation = await generateMessage({ lead, rule, context }).catch((error) => ({ message: fallbackMessage({ lead, rule }), model: 'fallback-openai-error', aiError: error.message }))
      const message = (generation.message || fallbackMessage({ lead, rule })).trim()
      const channel = chooseChannel(row)
      const metadata = {
        model: generation.model,
        openaiResponseId: generation.openaiResponseId,
        aiError: generation.aiError,
        lastActivityAt: row.last_activity_at,
        ruleConfig: rule.config,
        inactiveHours: rule.inactiveHours,
        reason: rule.reason,
        urgency: rule.urgency,
      }
      const result = await insertFollowupJob({ workspaceId, leadId: row.id, rule, channel, message, metadata })
      console.info('[ai-followups] created job', { workspaceId, leadId: row.id, ruleType: rule.ruleType, jobId: result.rows[0].id, channel })
      await addTimelineEvent(pool, { workspaceId, leadId: row.id, userId, eventType: 'follow_up_suggested', title: 'Follow-up suggested', body: message, source: 'ai', metadata: { ruleType: rule.ruleType, channel, reason: rule.reason, urgency: rule.urgency, reminderType: rule.ruleType } })
      if (['no_reply_7d', 'proposal_no_reply', 'meeting_no_next_step', 'hot_lead_inactive'].includes(rule.ruleType) || rule.urgency === 'critical') {
        await addTimelineEvent(pool, { workspaceId, leadId: row.id, userId, eventType: 'opportunity_risk_detected', title: 'Opportunity risk detected', body: `${rule.reason}. AI предлагает follow-up, reminder и escalation для менеджера.`, source: 'ai', metadata: { ruleType: rule.ruleType, inactiveHours: rule.inactiveHours, escalationSuggestion: true, reminderSuggestion: true, followUpSuggestion: true } })
      }
      createdJobs.push(normalize({ ...result.rows[0], lead_name: row.name, lead_company: row.company, lead_email: row.email, lead_status: stage, lead_telegram_chat_id: row.telegram_chat_id }))
    }
  }

  const response = {
    scannedLeadsCount: leadsResult.rows.length,
    matchedLeadsCount,
    created: createdJobs.length,
    skippedDuplicates: skippedDuplicateJobs.length,
    activeRules: activeRules.length,
    createdCount: createdJobs.length,
    createdJobsCount: createdJobs.length,
    skippedDuplicatesCount: skippedDuplicateJobs.length,
    activeRulesCount: activeRules.length,
    skippedCount: skippedDuplicateJobs.length,
    createdJobs,
    skippedDuplicateJobs,
    debugSummary: {
      evaluationsCount: debugEvaluations.length,
      matchedEvaluationsCount: debugEvaluations.filter((evaluation) => evaluation.finalMatch).length,
      skippedEvaluationsCount: debugEvaluations.filter((evaluation) => !evaluation.finalMatch).length,
      evaluations: debugEvaluations.slice(0, 100),
    },
    rulesSeeded: seedResult.seeded,
    seededRuleTypes: seedResult.seededRuleTypes,
  }
  console.info('[ai-followups] scan finished', {
    userId,
    workspaceId,
    scannedLeadsCount: response.scannedLeadsCount,
    matchedLeadsCount: response.matchedLeadsCount,
    created: response.created,
    skippedDuplicates: response.skippedDuplicates,
    activeRules: response.activeRules,
  })
  return response
}

async function listFollowups(userId, workspaceId) {
  const result = await pool.query(
    `SELECT j.*, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.status AS lead_status, l.telegram_chat_id AS lead_telegram_chat_id
       FROM ai_followup_jobs j JOIN crm_leads l ON l.id = j.lead_id AND l.workspace_id = j.workspace_id
      WHERE j.workspace_id = $1
      ORDER BY CASE j.status WHEN 'suggested' THEN 1 WHEN 'approved' THEN 2 WHEN 'failed' THEN 3 ELSE 4 END, j.created_at DESC LIMIT 200`, [workspaceId]
  )
  const metrics = await getMetrics(userId, workspaceId)
  return { items: result.rows.map(normalize), metrics }
}

async function getFollowup(userId, workspaceId, id) {
  const result = await pool.query(`SELECT j.* FROM ai_followup_jobs j JOIN crm_leads l ON l.id = j.lead_id AND l.workspace_id = j.workspace_id WHERE j.id = $1 AND j.workspace_id = $2`, [id, workspaceId])
  if (!result.rows[0]) throw Object.assign(new Error('Follow-up job not found'), { statusCode: 404 })
  return normalize(result.rows[0])
}

async function getWorkspaceLead(workspaceId, leadId) {
  const result = await pool.query('SELECT id, user_id, email FROM crm_leads WHERE workspace_id = $1 AND id = $2', [workspaceId, leadId])
  if (!result.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  return result.rows[0]
}

function normalizeNullableText(value) {
  if (value === undefined || value === null) return ''
  return String(value)
}

async function transition(userId, workspaceId, id, status, reason = '') {
  if (!STATUSES.includes(status)) throw Object.assign(new Error('Invalid follow-up status'), { statusCode: 400 })
  const decisionReason = normalizeNullableText(reason)
  const current = await getFollowup(userId, workspaceId, id)
  const result = await pool.query(
    `UPDATE ai_followup_jobs
        SET status = $3::text,
            approved_at = CASE WHEN $3::text = 'approved' THEN NOW() ELSE approved_at END,
            updated_at = NOW(),
            metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('decisionReason', $4::text)
      WHERE workspace_id = $1 AND id = $2
      RETURNING *`,
    [workspaceId, id, status, decisionReason]
  )
  const updated = result.rows[0]
  if (!updated) throw Object.assign(new Error('Follow-up job not found'), { statusCode: 404 })
  const titles = { approved: 'Follow-up approved', rejected: 'Follow-up rejected' }
  await addTimelineEvent(pool, { workspaceId, leadId: current.leadId, userId, eventType: `follow_up_${status}`, title: titles[status] || 'Follow-up status changed', body: decisionReason || current.generatedMessage, source: 'ai', metadata: { followupJobId: id, status } })
  return normalize(updated)
}

async function updateFollowup(userId, workspaceId, id, payload) {
  const current = await getFollowup(userId, workspaceId, id)
  const channel = payload.suggestedChannel || current.suggestedChannel
  if (!CHANNELS.includes(channel)) throw Object.assign(new Error('Invalid follow-up channel'), { statusCode: 400 })
  const result = await pool.query(`UPDATE ai_followup_jobs SET generated_message = $3, suggested_channel = $4, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *`, [workspaceId, id, payload.generatedMessage ?? current.generatedMessage, channel])
  return normalize(result.rows[0])
}

async function send(userId, workspaceId, id) {
  const job = await getFollowup(userId, workspaceId, id)
  if (!['approved', 'failed'].includes(job.status)) throw Object.assign(new Error('Сначала одобрите follow-up'), { statusCode: 400 })

  try {
    let result
    const lead = await getWorkspaceLead(workspaceId, job.leadId)
    const leadOwnerUserId = lead.user_id
    if (job.suggestedChannel === 'telegram') {
      result = await sendTelegramMessageToLead({ userId: leadOwnerUserId, workspaceId, leadId: job.leadId, text: job.generatedMessage })
    } else if (job.suggestedChannel === 'email') {
      if (!lead.email) throw Object.assign(new Error('У лида нет email для отправки.'), { statusCode: 400 })
      result = await emailService.sendEmailNow(leadOwnerUserId, { workspaceId, leadId: job.leadId, to: lead.email, subject: 'Следующий шаг по AS6 AI CRM', text: job.generatedMessage })
    } else {
      result = await crmModel.createNote(leadOwnerUserId, workspaceId, job.leadId, `AI follow-up reminder: ${job.generatedMessage}`)
    }
    const updated = await pool.query("UPDATE ai_followup_jobs SET status = 'sent', sent_at = NOW(), error = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, id])
    await pool.query("INSERT INTO ai_followup_attempts(workspace_id, lead_id, job_id, rule_type, status, suggested_channel, generated_message, sent_at) VALUES($1,$2,$3,$4,'sent',$5,$6,NOW())", [workspaceId, job.leadId, id, job.ruleType, job.suggestedChannel, job.generatedMessage])
    await addTimelineEvent(pool, { workspaceId, leadId: job.leadId, userId, eventType: 'follow_up_sent', title: 'Follow-up sent', body: job.generatedMessage, source: job.suggestedChannel, metadata: { followupJobId: id, channel: job.suggestedChannel } })
    return { item: normalize(updated.rows[0]), result }
  } catch (error) {
    const errorMessage = error.message || 'Не удалось отправить follow-up'
    const updated = await pool.query("UPDATE ai_followup_jobs SET status = 'failed', error = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, id, errorMessage])
    await pool.query("INSERT INTO ai_followup_attempts(workspace_id, lead_id, job_id, rule_type, status, suggested_channel, generated_message, error) VALUES($1,$2,$3,$4,'failed',$5,$6,$7)", [workspaceId, job.leadId, id, job.ruleType, job.suggestedChannel, job.generatedMessage, errorMessage])
    await addTimelineEvent(pool, { workspaceId, leadId: job.leadId, userId, eventType: 'follow_up_failed', title: 'Follow-up failed', body: errorMessage, source: job.suggestedChannel, metadata: { followupJobId: id, channel: job.suggestedChannel } })
    return { item: normalize(updated.rows[0]), error: errorMessage }
  }
}

async function getMetrics(userId, workspaceId) {
  const result = await pool.query(
    `WITH latest AS (SELECT DISTINCT ON (lead_id) lead_id, score FROM lead_ai_scores WHERE workspace_id = $1 ORDER BY lead_id, generated_at DESC), activity AS (
       SELECT l.id, GREATEST(l.updated_at, COALESCE(MAX(tm.created_at), l.updated_at), COALESCE(MAX(em.created_at), l.updated_at), COALESCE(MAX(n.created_at), l.updated_at)) AS last_activity_at
       FROM crm_leads l LEFT JOIN telegram_messages tm ON tm.lead_id = l.id AND tm.workspace_id = l.workspace_id LEFT JOIN email_messages em ON em.lead_id = l.id AND em.workspace_id = l.workspace_id LEFT JOIN crm_notes n ON n.lead_id = l.id AND n.workspace_id = l.workspace_id
       WHERE l.workspace_id = $1 AND COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new') NOT IN ('won','lost') GROUP BY l.id)
     SELECT (SELECT COUNT(*)::int FROM ai_followup_jobs j JOIN crm_leads l ON l.id = j.lead_id AND l.workspace_id = j.workspace_id WHERE j.workspace_id = $1 AND j.status IN ('suggested','approved')) AS pending,
            (SELECT COUNT(*)::int FROM ai_followup_jobs j JOIN crm_leads l ON l.id = j.lead_id AND l.workspace_id = j.workspace_id WHERE j.workspace_id = $1 AND j.status = 'sent' AND j.sent_at::date = CURRENT_DATE) AS sent_today,
            COUNT(*) FILTER (WHERE latest.score >= 70 AND activity.last_activity_at < NOW() - INTERVAL '12 hours')::int AS hot_without_contact,
            0::int AS conversion_placeholder
       FROM activity LEFT JOIN latest ON latest.lead_id = activity.id`, [workspaceId]
  )
  const row = result.rows[0] || {}
  return { pending: Number(row.pending || 0), hotWithoutContact: Number(row.hot_without_contact || 0), sentToday: Number(row.sent_today || 0), conversionPlaceholder: Number(row.conversion_placeholder || 0) }
}

module.exports = { listFollowups, scanWorkspace, send, transition, updateFollowup, getMetrics }
