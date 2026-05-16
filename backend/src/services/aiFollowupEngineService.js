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

function getLeadStage(lead) {
  return lead.followup_stage || lead.stage || lead.status
}

function getLeadLastActivityAt(lead) {
  return lead.last_activity_at ? new Date(lead.last_activity_at) : new Date(lead.last_message_at || lead.updated_at || lead.created_at)
}

function getLeadInactivityHours(lead) {
  const lastActivity = getLeadLastActivityAt(lead)
  return Math.max(0, (Date.now() - lastActivity.getTime()) / 36e5)
}

function leadSkipReason(lead, activeRules) {
  const stage = getLeadStage(lead)
  if (stage === 'won' || stage === 'lost') return `terminal status ${stage}`
  if (!activeRules.length) return 'no active follow-up rules'
  const inactiveHours = getLeadInactivityHours(lead)
  const stageRules = activeRules.filter((rule) => rule.config?.stage && rule.config.stage !== stage).map((rule) => `${rule.ruleType}: stage ${stage} != ${rule.config.stage}`)
  const thresholdRules = activeRules.filter((rule) => inactiveHours < Number(rule.config?.thresholdHours || 24)).map((rule) => `${rule.ruleType}: inactive ${Math.round(inactiveHours * 10) / 10}h < ${Number(rule.config?.thresholdHours || 24)}h`)
  const scoreRules = activeRules.filter((rule) => rule.config?.minScore && !(lead.temperature === 'hot' || Number(lead.score || 0) >= Number(rule.config.minScore))).map((rule) => `${rule.ruleType}: score ${Number(lead.score || 0)} below ${Number(rule.config.minScore)}`)
  return [...stageRules, ...thresholdRules, ...scoreRules].slice(0, 3).join('; ') || 'no rule matched'
}

function leadMatchesRule(lead, rule) {
  const inactiveHours = getLeadInactivityHours(lead)
  const config = rule.config || {}
  const thresholdHours = Number(config.thresholdHours || 24)
  if (inactiveHours < thresholdHours) return null

  if (config.stage && getLeadStage(lead) !== config.stage) return null
  if (config.minScore && !(lead.temperature === 'hot' || Number(lead.score || 0) >= Number(config.minScore))) return null

  return {
    ...rule,
    reason: rule.reason,
    urgency: rule.urgency,
    scheduledHours: rule.scheduledHours,
    inactiveHours: Math.round(inactiveHours * 10) / 10,
  }
}

function buildRules(lead, activeRules) {
  return activeRules.map((rule) => leadMatchesRule(lead, rule)).filter(Boolean)
}

async function scanWorkspace(userId, workspaceId) {
  const seedResult = await ensureDefaultRulesForWorkspace(workspaceId)
  const activeRules = await loadActiveRules(workspaceId)
  console.info('[ai-followups] scan started', { userId, workspaceId, activeRules: activeRules.map((rule) => rule.ruleType) })
  const leadsResult = await pool.query(
    `WITH activity AS (
       SELECT l.id AS lead_id,
              COALESCE(
                GREATEST(
                  l.last_message_at,
                  MAX(tm.created_at),
                  MAX(em.created_at)
                ),
                l.last_message_at,
                l.updated_at,
                l.created_at
              ) AS last_activity_at
         FROM crm_leads l
         LEFT JOIN telegram_messages tm ON tm.lead_id = l.id AND tm.workspace_id = l.workspace_id
         LEFT JOIN email_messages em ON em.lead_id = l.id AND em.workspace_id = l.workspace_id
        WHERE l.workspace_id = $1 AND COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new') NOT IN ('won','lost')
        GROUP BY l.id
     ), latest_score AS (
       SELECT DISTINCT ON (lead_id) lead_id, score, temperature FROM lead_ai_scores WHERE workspace_id = $1 ORDER BY lead_id, generated_at DESC
     )
     SELECT l.*, COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new') AS followup_stage, a.last_activity_at, s.score, s.temperature
       FROM crm_leads l JOIN activity a ON a.lead_id = l.id LEFT JOIN latest_score s ON s.lead_id = l.id
      WHERE l.workspace_id = $1 AND COALESCE(NULLIF(l.stage, ''), NULLIF(l.status, ''), 'new') NOT IN ('won','lost')`, [workspaceId]
  )
  const created = []
  const skippedDuplicates = []
  let matchedLeadsCount = 0
  for (const row of leadsResult.rows) {
    const lead = crmModel.CRM_STATUSES ? { ...row, id: row.id, status: getLeadStage(row) } : { ...row, status: getLeadStage(row) }
    const matchedRules = buildRules(row, activeRules)
    if (!matchedRules.length) {
      console.info('[ai-followups] lead skipped', { workspaceId, leadId: row.id, status: getLeadStage(row), reason: leadSkipReason(row, activeRules), lastActivityAt: row.last_activity_at })
      continue
    }
    matchedLeadsCount += 1
    console.info('[ai-followups] lead matched rules', { workspaceId, leadId: row.id, ruleTypes: matchedRules.map((rule) => rule.ruleType) })
    for (const rule of matchedRules) {
      console.info('[ai-followups] rule matched', { workspaceId, leadId: row.id, ruleType: rule.ruleType, inactiveHours: rule.inactiveHours })
      const duplicate = await pool.query(`SELECT id FROM ai_followup_jobs WHERE workspace_id = $1 AND lead_id = $2 AND rule_type = $3 AND created_at > NOW() - INTERVAL '24 hours' AND status IN ('suggested','approved','sent') LIMIT 1`, [workspaceId, row.id, rule.ruleType])
      if (duplicate.rows[0]) {
        skippedDuplicates.push({ leadId: row.id, ruleType: rule.ruleType, jobId: duplicate.rows[0].id })
        console.info('[ai-followups] lead skipped duplicate', { workspaceId, leadId: row.id, ruleType: rule.ruleType, duplicateJobId: duplicate.rows[0].id })
        continue
      }
      const context = await getLeadContext(workspaceId, row.id)
      const generation = await generateMessage({ lead, rule, context }).catch((error) => ({ message: fallbackMessage({ lead, rule }), model: 'fallback-openai-error', aiError: error.message }))
      const channel = chooseChannel(row) || rule.suggestedChannel
      const result = await pool.query(
        `INSERT INTO ai_followup_jobs(workspace_id, lead_id, rule_type, status, suggested_channel, generated_message, scheduled_for, reason, urgency, metadata)
         VALUES($1, $2, $3, 'suggested', $4, $5, NOW() + ($6::int * INTERVAL '1 hour'), $7, $8, $9) RETURNING *`,
        [workspaceId, row.id, rule.ruleType, channel, generation.message, rule.scheduledHours, rule.reason, rule.urgency, { model: generation.model, openaiResponseId: generation.openaiResponseId, aiError: generation.aiError, lastActivityAt: row.last_activity_at, ruleConfig: rule.config, inactiveHours: rule.inactiveHours }]
      )
      console.info('[ai-followups] follow-up created', { workspaceId, leadId: row.id, ruleType: rule.ruleType, followupId: result.rows[0].id, channel })
      await addTimelineEvent(pool, { workspaceId, leadId: row.id, userId, eventType: 'follow_up_suggested', title: 'Follow-up suggested', body: generation.message, source: 'ai', metadata: { ruleType: rule.ruleType, channel, reason: rule.reason, urgency: rule.urgency } })
      created.push(normalize({ ...result.rows[0], lead_name: row.name, lead_company: row.company, lead_email: row.email, lead_status: getLeadStage(row), lead_telegram_chat_id: row.telegram_chat_id }))
    }
  }
  const response = { scannedLeadsCount: leadsResult.rows.length, matchedLeadsCount, createdJobsCount: created.length, skippedDuplicatesCount: skippedDuplicates.length, created, skippedDuplicates, createdCount: created.length, skippedCount: skippedDuplicates.length, rulesSeeded: seedResult.seeded, seededRuleTypes: seedResult.seededRuleTypes }
  console.info('[ai-followups] scan finished', { userId, workspaceId, scannedLeadsCount: response.scannedLeadsCount, matchedLeadsCount, createdJobsCount: response.createdJobsCount, skippedDuplicatesCount: response.skippedDuplicatesCount })
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

async function transition(userId, workspaceId, id, status, reason = '') {
  if (!STATUSES.includes(status)) throw Object.assign(new Error('Invalid follow-up status'), { statusCode: 400 })
  const current = await getFollowup(userId, workspaceId, id)
  const result = await pool.query(`UPDATE ai_followup_jobs SET status = $3, approved_at = CASE WHEN $3 = 'approved' THEN NOW() ELSE approved_at END, updated_at = NOW(), metadata = metadata || jsonb_build_object('decisionReason', $4) WHERE workspace_id = $1 AND id = $2 RETURNING *`, [workspaceId, id, status, reason])
  const titles = { approved: 'Follow-up approved', rejected: 'Follow-up rejected' }
  await addTimelineEvent(pool, { workspaceId, leadId: current.leadId, userId, eventType: `follow_up_${status}`, title: titles[status] || 'Follow-up status changed', body: reason || current.generatedMessage, source: 'ai', metadata: { followupJobId: id, status } })
  return normalize(result.rows[0])
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
  if (job.status !== 'approved') throw Object.assign(new Error('Follow-up must be approved before sending'), { statusCode: 400 })
  try {
    let result
    const lead = await getWorkspaceLead(workspaceId, job.leadId)
    const leadOwnerUserId = lead.user_id
    if (job.suggestedChannel === 'telegram') result = await sendTelegramMessageToLead({ userId: leadOwnerUserId, workspaceId, leadId: job.leadId, text: job.generatedMessage })
    else if (job.suggestedChannel === 'email') {
      result = await emailService.sendEmailNow(leadOwnerUserId, { workspaceId, leadId: job.leadId, to: lead.email, subject: 'Следующий шаг по AS6 AI CRM', text: job.generatedMessage })
    } else result = await crmModel.createNote(leadOwnerUserId, workspaceId, job.leadId, `AI follow-up reminder: ${job.generatedMessage}`)
    const updated = await pool.query("UPDATE ai_followup_jobs SET status = 'sent', sent_at = NOW(), error = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, id])
    await pool.query("INSERT INTO ai_followup_attempts(workspace_id, lead_id, job_id, rule_type, status, suggested_channel, generated_message, sent_at) VALUES($1,$2,$3,$4,'sent',$5,$6,NOW())", [workspaceId, job.leadId, id, job.ruleType, job.suggestedChannel, job.generatedMessage])
    await addTimelineEvent(pool, { workspaceId, leadId: job.leadId, userId, eventType: 'follow_up_sent', title: 'Follow-up sent', body: job.generatedMessage, source: job.suggestedChannel, metadata: { followupJobId: id, channel: job.suggestedChannel } })
    return { item: normalize(updated.rows[0]), result }
  } catch (error) {
    const updated = await pool.query("UPDATE ai_followup_jobs SET status = 'failed', error = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, id, error.message])
    await pool.query("INSERT INTO ai_followup_attempts(workspace_id, lead_id, job_id, rule_type, status, suggested_channel, generated_message, error) VALUES($1,$2,$3,$4,'failed',$5,$6,$7)", [workspaceId, job.leadId, id, job.ruleType, job.suggestedChannel, job.generatedMessage, error.message])
    await addTimelineEvent(pool, { workspaceId, leadId: job.leadId, userId, eventType: 'follow_up_failed', title: 'Follow-up failed', body: error.message, source: job.suggestedChannel, metadata: { followupJobId: id, channel: job.suggestedChannel } })
    return { item: normalize(updated.rows[0]), error: error.message }
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
