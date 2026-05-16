const pool = require('../db/pool')
const { generateCrmFollowUp } = require('../services/crmAiService')
const { buildFollowUpDraft, scoreLeadContext } = require('../services/leadIntelligenceService')
const { createQualificationQueueItem, ensureSdrWorker, scheduleLeadQualification } = require('../services/leadQualificationService')
const { addTimelineEvent } = require('../services/timelineService')

const CRM_STATUSES = ['new', 'qualified', 'proposal', 'booked', 'won', 'lost']
const DEFAULT_STAGE_LABELS = {
  new: 'Новый',
  qualified: 'Квалификация',
  proposal: 'Предложение',
  booked: 'Встреча',
  won: 'Успешно',
  lost: 'Потеряно',
}
const STATUS_LABELS = DEFAULT_STAGE_LABELS
const LEAD_COLUMNS = ['id', 'user_id', 'workspace_id', 'name', 'email', 'phone', 'telegram', 'telegram_id', 'telegram_chat_id', 'telegram_username', 'telegram_first_name', 'telegram_last_name', 'first_name', 'last_name', 'first_message', 'last_message_at', 'last_seen_at', 'company', 'status', 'value', 'source', 'notes', 'metadata', 'probability_to_close', 'estimated_revenue', 'expected_close_date', 'created_at', 'updated_at']
const LEAD_SELECT = LEAD_COLUMNS.join(', ')

function leadSelect(alias) {
  return LEAD_COLUMNS.map((column) => `${alias}.${column}`).join(', ')
}

function normalizeLead(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id || null,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    telegram: row.telegram || '',
    telegramId: row.telegram_id || row.metadata?.telegramUserId || '',
    telegramChatId: row.telegram_chat_id || row.metadata?.telegramChatId || '',
    hasTelegramChatId: Boolean(row.telegram_chat_id || row.metadata?.telegramChatId),
    telegramUsername: row.telegram_username || row.telegram || '',
    telegramFirstName: row.telegram_first_name || row.first_name || '',
    telegramLastName: row.telegram_last_name || row.last_name || '',
    firstName: row.first_name || row.telegram_first_name || '',
    lastName: row.last_name || row.telegram_last_name || '',
    firstMessage: row.first_message || '',
    lastMessageAt: row.last_message_at || row.metadata?.telegramLastMessageAt || null,
    lastSeenAt: row.last_seen_at || row.last_message_at || null,
    telegramOnline: Boolean(row.last_seen_at && Date.now() - new Date(row.last_seen_at).getTime() < 5 * 60 * 1000),
    company: row.company || '',
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] || row.status,
    value: Number(row.value || 0),
    probabilityToClose: Number(row.probability_to_close ?? row.probabilityToClose ?? row.ai_score?.deal_probability ?? 0),
    estimatedRevenue: Number(row.estimated_revenue ?? row.estimatedRevenue ?? 0),
    expectedCloseDate: row.expected_close_date || row.expectedCloseDate || null,
    source: row.source || '',
    metadata: row.metadata || {},
    notesText: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: Array.isArray(row.notes_list) ? row.notes_list.map(normalizeNote).filter(Boolean) : [],
    followUps: Array.isArray(row.followups) ? row.followups.map(normalizeFollowUp).filter(Boolean) : [],
    telegramMessages: Array.isArray(row.telegram_messages) ? row.telegram_messages.map(normalizeTelegramMessage).filter(Boolean) : [],
    aiRecommendation: row.ai_recommendation || null,
    aiStageRecommendation: normalizeAiStageRecommendation(row.ai_stage_recommendation || null),
    aiScore: normalizeAiScore(row.ai_score || row.ai_score_row || null),
    aiFollowUpSequences: Array.isArray(row.ai_followup_sequences) ? row.ai_followup_sequences.map(normalizeAiFollowUpSequence).filter(Boolean) : [],
    aiActions: Array.isArray(row.ai_actions) ? row.ai_actions : [],
    aiFollowupJobs: Array.isArray(row.ai_followup_jobs) ? row.ai_followup_jobs.map(normalizeAiFollowupJob).filter(Boolean) : [],
    aiOutreachDrafts: Array.isArray(row.ai_outreach_drafts) ? row.ai_outreach_drafts.map(normalizeAiOutreachDraft).filter(Boolean) : [],
  }
}

function normalizeAiStageRecommendation(row) {
  if (!row) return null
  const payload = row.payload || {}
  return {
    id: row.id,
    leadId: row.lead_id || row.leadId,
    workspaceId: row.workspace_id || row.workspaceId,
    actionType: row.action_type || row.actionType || 'stage_change_recommendation',
    status: row.status || 'pending_approval',
    currentStage: payload.currentStatus || payload.currentStage || payload.fromStage || '',
    recommendedStage: payload.nextStatus || payload.recommendedStage || payload.status || '',
    reason: payload.reason || row.recommendation || '',
    confidence: Number(payload.confidence ?? 0),
    riskType: payload.riskType || '',
    title: row.title || '',
    recommendation: row.recommendation || '',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  }
}

function normalizeAiScore(row) {
  if (!row) return null
  return {
    id: row.id,
    leadId: row.lead_id || row.leadId,
    workspaceId: row.workspace_id || row.workspaceId,
    score: Number(row.score || 0),
    temperature: row.temperature || 'cold',
    dealProbability: Number(row.probability_to_close ?? row.probabilityToClose ?? row.deal_probability ?? row.dealProbability ?? 0),
    probabilityToClose: Number(row.probability_to_close ?? row.probabilityToClose ?? row.deal_probability ?? row.dealProbability ?? 0),
    urgency: row.urgency || row.urgency_level || row.urgencyLevel || 'low',
    urgencyLevel: row.urgency_level || row.urgencyLevel || row.urgency || 'low',
    engagementLevel: row.engagement_level || row.engagementLevel || row.temperature || 'cold',
    riskLevel: row.risk_level || row.riskLevel || 'medium',
    budgetProbability: Number(row.budget_probability ?? row.budgetProbability ?? row.deal_probability ?? row.dealProbability ?? 0),
    aiSummary: row.ai_summary || row.aiSummary || row.intent_summary || row.intentSummary || '',
    intentSummary: row.intent_summary || row.intentSummary || row.ai_summary || row.aiSummary || '',
    nextBestAction: row.next_best_action || row.nextBestAction || row.recommended_next_step || row.recommendedNextStep || '',
    recommendedNextStep: row.recommended_next_step || row.recommendedNextStep || row.next_best_action || row.nextBestAction || '',
    idealContactTiming: row.ideal_contact_timing || row.idealContactTiming || '',
    objectionsDetected: row.objections_detected || row.objectionsDetected || [],
    recommendedCta: row.recommended_cta || row.recommendedCta || '',
    recommendedChannel: row.recommended_channel || row.recommendedChannel || '',
    confidence: Number(row.confidence ?? 0),
    engagementScore: Number(row.engagement_score ?? row.engagementScore ?? row.score ?? 0),
    expectedRevenue: Number(row.expected_revenue ?? row.expectedRevenue ?? 0),
    forecastCategory: row.forecast_category || row.forecastCategory || 'possible',
    riskSignals: row.risk_signals || row.riskSignals || [],
    aiReasoning: row.ai_reasoning || row.aiReasoning || row.ai_summary || row.aiSummary || '',
    nextBestActionCode: row.next_best_action_code || row.nextBestActionCode || '',
    generatedAt: row.generated_at || row.generatedAt || row.created_at || row.createdAt,
    createdAt: row.created_at || row.createdAt || row.generated_at || row.generatedAt,
  }
}

function normalizeAiFollowUpSequence(row) {
  if (!row) return null
  return {
    id: row.id,
    leadId: row.lead_id || row.leadId,
    workspaceId: row.workspace_id || row.workspaceId,
    status: row.status,
    followupType: row.followup_type || row.followupType,
    generatedMessage: row.generated_message || row.generatedMessage,
    recommendedAt: row.recommended_at || row.recommendedAt,
    scheduledFor: row.scheduled_for || row.scheduledFor,
    approvedByUser: row.approved_by_user || row.approvedByUser || null,
    sentAt: row.sent_at || row.sentAt || null,
    metadata: row.metadata || {},
  }
}


function normalizeAiFollowupJob(row) {
  if (!row) return null
  return {
    id: row.id,
    leadId: row.lead_id || row.leadId,
    workspaceId: row.workspace_id || row.workspaceId,
    ruleType: row.rule_type || row.ruleType,
    status: row.status,
    suggestedChannel: row.suggested_channel || row.suggestedChannel,
    generatedMessage: row.generated_message || row.generatedMessage || '',
    scheduledFor: row.scheduled_for || row.scheduledFor,
    approvedAt: row.approved_at || row.approvedAt || null,
    sentAt: row.sent_at || row.sentAt || null,
    reason: row.reason || '',
    urgency: row.urgency || 'medium',
    error: row.error || '',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  }
}


function normalizeAiOutreachDraft(row) {
  if (!row) return null
  const payload = row.payload || {}
  return {
    id: row.id,
    leadId: row.lead_id || row.leadId,
    workspaceId: row.workspace_id || row.workspaceId,
    actionType: row.action_type || row.actionType,
    status: row.status,
    title: row.title || '',
    recommendation: row.recommendation || '',
    outreachType: payload.outreachType || row.outreach_type || '',
    channel: payload.channel || (row.action_type === 'email_draft' ? 'email' : row.action_type === 'telegram_draft' ? 'telegram' : ''),
    text: payload.text || payload.message || '',
    subject: payload.subject || '',
    cta: payload.cta || '',
    demoProposal: payload.demoProposal || '',
    score: Number(payload.score || 0),
    temperature: payload.temperature || '',
    detectedIntent: payload.detectedIntent || '',
    recommendedChannel: payload.recommendedChannel || '',
    payload,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  }
}

function normalizeNote(row) {
  if (!row) return null
  return { id: row.id, leadId: row.lead_id, userId: row.user_id, body: row.body, createdAt: row.created_at }
}

function normalizeFollowUp(row) {
  if (!row) return null
  return { id: row.id, leadId: row.lead_id, userId: row.user_id, message: row.message, model: row.model, createdAt: row.created_at }
}

function normalizeTelegramMessage(row) {
  if (!row) return null
  return { id: row.id, leadId: row.lead_id, userId: row.user_id, role: row.role, message: row.message, telegramChatId: row.telegram_chat_id || '', telegramMessageId: row.telegram_message_id || '', createdAt: row.created_at }
}

function normalizeStage(row) {
  if (!row) return null
  return { status: row.status, title: row.title, position: Number(row.position || 0), updatedAt: row.updated_at }
}

function normalizeActivity(row) {
  if (!row) return null
  return {
    id: row.id,
    leadId: row.lead_id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body || '',
    metadata: row.metadata || {},
    leadName: row.lead_name || '',
    createdAt: row.created_at,
  }
}

function normalizeStatus(status) {
  const normalized = String(status || '').trim().toLowerCase()
  return CRM_STATUSES.includes(normalized) ? normalized : null
}

function normalizeOptionalText(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function normalizeValue(value) {
  if (value === undefined || value === null || value === '') return 0
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) return null
  return amount
}

async function ensureDefaultStages(userId, workspaceId, client = pool) {
  await client.query(
    `INSERT INTO crm_stages(user_id, workspace_id, status, title, position)
     SELECT $1, $5, status, title, position
       FROM UNNEST($2::text[], $3::text[], $4::int[]) AS defaults(status, title, position)
     ON CONFLICT (workspace_id, status) DO NOTHING`,
    [userId, CRM_STATUSES, CRM_STATUSES.map((status) => DEFAULT_STAGE_LABELS[status]), CRM_STATUSES.map((_, index) => index), workspaceId]
  )
}

async function listStages(userId, workspaceId) {
  await ensureDefaultStages(userId, workspaceId)
  const result = await pool.query(
    'SELECT status, title, position, updated_at FROM crm_stages WHERE user_id = $1 AND workspace_id = $2 ORDER BY position ASC',
    [userId, workspaceId]
  )
  return result.rows.map(normalizeStage)
}

async function updateStage(userId, workspaceId, status, payload) {
  const normalizedStatus = normalizeStatus(status)
  if (!normalizedStatus) throw Object.assign(new Error(`Status must be one of: ${CRM_STATUSES.join(', ')}`), { statusCode: 400 })
  const title = normalizeOptionalText(payload.title)
  if (!title) throw Object.assign(new Error('Stage title is required'), { statusCode: 400 })
  await ensureDefaultStages(userId, workspaceId)
  const result = await pool.query(
    `UPDATE crm_stages
        SET title = $3, updated_at = NOW()
      WHERE user_id = $1 AND workspace_id = $4 AND status = $2
      RETURNING status, title, position, updated_at`,
    [userId, normalizedStatus, title, workspaceId]
  )
  return normalizeStage(result.rows[0])
}

async function getStageLabels(userId, workspaceId, client = pool) {
  await ensureDefaultStages(userId, workspaceId, client)
  const result = await client.query('SELECT status, title FROM crm_stages WHERE user_id = $1 AND workspace_id = $2', [userId, workspaceId])
  return result.rows.reduce((labels, row) => ({ ...labels, [row.status]: row.title }), { ...DEFAULT_STAGE_LABELS })
}

async function logActivity(client, userId, workspaceId, leadId, type, title, body = null, metadata = {}) {
  const executor = client || pool
  await executor.query(
    `INSERT INTO crm_activity(user_id, workspace_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [userId, workspaceId, leadId, type, title, body, metadata]
  )
}

async function listLeads(userId, workspaceId) {
  const result = await pool.query(
    `SELECT ${leadSelect('l')},
            COALESCE(json_agg(DISTINCT jsonb_build_object('id', n.id, 'lead_id', n.lead_id, 'user_id', n.user_id, 'body', n.body, 'created_at', n.created_at)) FILTER (WHERE n.id IS NOT NULL), '[]'::json) AS notes_list,
            COALESCE(json_agg(DISTINCT jsonb_build_object('id', f.id, 'lead_id', f.lead_id, 'user_id', f.user_id, 'message', f.message, 'model', f.model, 'created_at', f.created_at)) FILTER (WHERE f.id IS NOT NULL), '[]'::json) AS followups,
            COALESCE((SELECT json_agg(tm_row ORDER BY tm_row.created_at ASC) FROM (SELECT tm.id, tm.lead_id, tm.user_id, tm.role, tm.message, tm.telegram_chat_id, tm.telegram_message_id, tm.created_at FROM telegram_messages tm WHERE tm.lead_id = l.id AND tm.user_id = l.user_id ORDER BY tm.created_at DESC LIMIT 10) tm_row), '[]'::json) AS telegram_messages,
            (SELECT to_jsonb(s) FROM (SELECT * FROM lead_ai_scores las WHERE las.workspace_id = l.workspace_id AND las.lead_id = l.id ORDER BY las.generated_at DESC LIMIT 1) s) AS ai_score,
            COALESCE((SELECT json_agg(seq_row ORDER BY seq_row.recommended_at DESC) FROM (SELECT * FROM ai_followup_sequences afs WHERE afs.workspace_id = l.workspace_id AND afs.lead_id = l.id ORDER BY afs.recommended_at DESC LIMIT 5) seq_row), '[]'::json) AS ai_followup_sequences,
            COALESCE((SELECT json_agg(job_row ORDER BY job_row.created_at DESC) FROM (SELECT * FROM ai_followup_jobs afj WHERE afj.workspace_id = l.workspace_id AND afj.lead_id = l.id ORDER BY afj.created_at DESC LIMIT 10) job_row), '[]'::json) AS ai_followup_jobs,
            COALESCE((SELECT json_agg(draft_row ORDER BY draft_row.created_at DESC) FROM (SELECT id, workspace_id, lead_id, action_type, status, title, recommendation, payload, created_at, updated_at FROM ai_worker_queue q WHERE q.workspace_id = l.workspace_id AND q.lead_id = l.id AND q.action_type IN ('telegram_draft','email_draft','followup_24h','followup_3d','demo_offer','meeting_request') ORDER BY q.created_at DESC LIMIT 20) draft_row), '[]'::json) AS ai_outreach_drafts,
            (SELECT to_jsonb(stage_q) FROM (SELECT id, workspace_id, lead_id, action_type, status, title, recommendation, payload, created_at, updated_at FROM ai_worker_queue q WHERE q.workspace_id = l.workspace_id AND q.lead_id = l.id AND q.action_type = 'stage_change_recommendation' AND q.status IN ('pending_approval','approved','failed') ORDER BY q.created_at DESC LIMIT 1) stage_q) AS ai_stage_recommendation,
            (SELECT a.output_result FROM ai_agent_actions a WHERE a.workspace_id = l.workspace_id AND a.lead_id = l.id AND a.task_type = 'analyze_lead' AND a.status = 'completed' ORDER BY a.created_at DESC LIMIT 1) AS ai_recommendation,
            COALESCE((SELECT json_agg(ai_row ORDER BY ai_row.created_at DESC) FROM (SELECT a.id, a.task_type, a.status, a.output_result, a.created_at FROM ai_agent_actions a WHERE a.workspace_id = l.workspace_id AND a.lead_id = l.id ORDER BY a.created_at DESC LIMIT 5) ai_row), '[]'::json) AS ai_actions
       FROM crm_leads AS l
       LEFT JOIN crm_notes AS n ON n.lead_id = l.id AND n.user_id = l.user_id
       LEFT JOIN crm_followups AS f ON f.lead_id = l.id AND f.user_id = l.user_id
      WHERE l.user_id = $1 AND l.workspace_id = $2
      GROUP BY l.id
      ORDER BY l.updated_at DESC, l.created_at DESC`,
    [userId, workspaceId]
  )

  return result.rows.map((row) => {
    const lead = normalizeLead(row)
    lead.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    lead.followUps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    lead.telegramMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    return lead
  })
}

async function findLead(userId, workspaceId, leadId, client = pool) {
  const result = await client.query(`SELECT ${LEAD_SELECT} FROM crm_leads WHERE user_id = $1 AND workspace_id = $2 AND id = $3`, [userId, workspaceId, leadId])
  if (!result.rows[0]) return null
  const [notes, followups, telegramMessages, aiScore, aiSequences, aiFollowupJobs, aiOutreachDrafts, aiStageRecommendation] = await Promise.all([
    client.query('SELECT id, lead_id, user_id, body, created_at FROM crm_notes WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at DESC', [userId, leadId, workspaceId]),
    client.query('SELECT id, lead_id, user_id, message, model, created_at FROM crm_followups WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at DESC', [userId, leadId, workspaceId]),
    client.query('SELECT id, lead_id, user_id, role, message, telegram_chat_id, telegram_message_id, created_at FROM telegram_messages WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at ASC LIMIT 200', [userId, leadId, workspaceId]),
    client.query('SELECT * FROM lead_ai_scores WHERE workspace_id = $1 AND lead_id = $2 ORDER BY generated_at DESC LIMIT 1', [workspaceId, leadId]),
    client.query('SELECT * FROM ai_followup_sequences WHERE workspace_id = $1 AND lead_id = $2 ORDER BY recommended_at DESC LIMIT 5', [workspaceId, leadId]),
    client.query('SELECT * FROM ai_followup_jobs WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 10', [workspaceId, leadId]),
    client.query("SELECT id, workspace_id, lead_id, action_type, status, title, recommendation, payload, created_at, updated_at FROM ai_worker_queue WHERE workspace_id = $1 AND lead_id = $2 AND action_type IN ('telegram_draft','email_draft','followup_24h','followup_3d','demo_offer','meeting_request') ORDER BY created_at DESC LIMIT 20", [workspaceId, leadId]),
    client.query("SELECT id, workspace_id, lead_id, action_type, status, title, recommendation, payload, created_at, updated_at FROM ai_worker_queue WHERE workspace_id = $1 AND lead_id = $2 AND action_type = 'stage_change_recommendation' AND status IN ('pending_approval','approved','failed') ORDER BY created_at DESC LIMIT 1", [workspaceId, leadId]),
  ])
  const ai = await client.query("SELECT output_result FROM ai_agent_actions WHERE workspace_id = $1 AND lead_id = $2 AND task_type = 'analyze_lead' AND status = 'completed' ORDER BY created_at DESC LIMIT 1", [workspaceId, leadId])
  const aiActions = await client.query('SELECT id, task_type, status, output_result, created_at FROM ai_agent_actions WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 5', [workspaceId, leadId])
  return normalizeLead({ ...result.rows[0], notes_list: notes.rows, followups: followups.rows, telegram_messages: telegramMessages.rows, ai_score: aiScore.rows[0] || null, ai_followup_sequences: aiSequences.rows, ai_followup_jobs: aiFollowupJobs.rows, ai_outreach_drafts: aiOutreachDrafts.rows, ai_stage_recommendation: aiStageRecommendation.rows[0] || null, ai_recommendation: ai.rows[0]?.output_result || null, ai_actions: aiActions.rows })
}

async function createLead(userId, workspaceId, payload) {
  const name = normalizeOptionalText(payload.name)
  const email = normalizeOptionalText(payload.email)
  const phone = normalizeOptionalText(payload.phone)
  const telegram = normalizeOptionalText(payload.telegram)
  const company = normalizeOptionalText(payload.company)
  const source = normalizeOptionalText(payload.source) || 'ручной ввод'
  const notes = normalizeOptionalText(payload.notes || payload.notesText)
  const status = normalizeStatus(payload.status) || 'new'
  const value = normalizeValue(payload.value)

  if (!name) throw Object.assign(new Error('Lead name is required'), { statusCode: 400 })
  if (!email && !telegram && !phone) throw Object.assign(new Error('Lead email, telegram or phone is required'), { statusCode: 400 })
  if (value === null) throw Object.assign(new Error('Lead value must be a non-negative number'), { statusCode: 400 })

  const client = await pool.connect()
  let qualificationQueueId = null
  try {
    await client.query('BEGIN')
    const stageLabels = await getStageLabels(userId, workspaceId, client)
    const result = await client.query(
      `INSERT INTO crm_leads(user_id, workspace_id, name, email, phone, telegram, company, status, value, source, notes, contact, stage)
       VALUES($1, $11, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($5, $4, $3), $7)
       RETURNING ${LEAD_SELECT}`,
      [userId, name, email, phone, telegram, company, status, value, source, notes, workspaceId]
    )
    await logActivity(client, userId, workspaceId, result.rows[0].id, 'lead_created', 'Лид создан', `${company || name} добавлен в этап «${stageLabels[status] || status}».`, { status, value })
    let noteRows = []
    if (notes) {
      const noteResult = await client.query(
        'INSERT INTO crm_notes(lead_id, user_id, workspace_id, body) VALUES($1, $2, $4, $3) RETURNING id, lead_id, user_id, body, created_at',
        [result.rows[0].id, userId, notes, workspaceId]
      )
      noteRows = noteResult.rows
      await logActivity(client, userId, workspaceId, result.rows[0].id, 'note_added', 'Заметка добавлена', notes)
    }
    const worker = await ensureSdrWorker(client, workspaceId)
    const qualificationQueue = await createQualificationQueueItem(client, {
      workspaceId,
      leadId: result.rows[0].id,
      workerId: worker.id,
      title: `Квалифицировать лида — ${result.rows[0].name}`,
      recommendation: 'AI квалификация поставлена в очередь: будет рассчитан score, приоритет, канал и следующий шаг.',
      payload: { leadId: result.rows[0].id, source: 'crm', createdFrom: 'manual_crm' },
    })
    qualificationQueueId = qualificationQueue.id
    await client.query('COMMIT')
    scheduleLeadQualification({ workspaceId, leadId: result.rows[0].id, queueId: qualificationQueueId })
    return normalizeLead({ ...result.rows[0], notes_list: noteRows, followups: [] })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function updateLead(userId, workspaceId, leadId, payload) {
  const updates = []
  const values = [userId, workspaceId, leadId]
  const previous = await findLead(userId, workspaceId, leadId)
  if (!previous) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })

  function addUpdate(column, value) {
    values.push(value)
    updates.push(`${column} = $${values.length}`)
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'name')) {
    const name = normalizeOptionalText(payload.name)
    if (!name) throw Object.assign(new Error('Lead name cannot be blank'), { statusCode: 400 })
    addUpdate('name', name)
  }
  for (const field of ['email', 'phone', 'telegram', 'company', 'source']) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) addUpdate(field, normalizeOptionalText(payload[field]))
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'notes') || Object.prototype.hasOwnProperty.call(payload, 'notesText')) {
    addUpdate('notes', normalizeOptionalText(payload.notes || payload.notesText))
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
    const status = normalizeStatus(payload.status)
    if (!status) throw Object.assign(new Error(`Status must be one of: ${CRM_STATUSES.join(', ')}`), { statusCode: 400 })
    addUpdate('status', status)
    addUpdate('stage', status)
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'value')) {
    const value = normalizeValue(payload.value)
    if (value === null) throw Object.assign(new Error('Lead value must be a non-negative number'), { statusCode: 400 })
    addUpdate('value', value)
  }

  if (!updates.length) return previous
  updates.push('updated_at = NOW()')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const stageLabels = await getStageLabels(userId, workspaceId, client)
    const result = await client.query(
      `UPDATE crm_leads SET ${updates.join(', ')}, contact = COALESCE(telegram, phone, email, contact)
        WHERE user_id = $1 AND workspace_id = $2 AND id = $3 RETURNING ${LEAD_SELECT}`,
      values
    )
    if (!result.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    if (payload.status && previous.status !== payload.status) {
      await logActivity(client, userId, workspaceId, leadId, 'lead_moved', 'Лид перемещён', `Из «${stageLabels[previous.status] || previous.status}» в «${stageLabels[payload.status] || payload.status}».`, { from: previous.status, to: payload.status })
    } else {
      await logActivity(client, userId, workspaceId, leadId, 'lead_updated', 'Лид обновлён', 'Данные лида изменены.')
    }
    await client.query('COMMIT')
    return findLead(userId, workspaceId, leadId)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function deleteLead(userId, workspaceId, leadId) {
  const result = await pool.query('DELETE FROM crm_leads WHERE user_id = $1 AND workspace_id = $2 AND id = $3 RETURNING id', [userId, workspaceId, leadId])
  if (!result.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
}

async function createNote(userId, workspaceId, leadId, body) {
  const normalizedBody = normalizeOptionalText(body)
  if (!normalizedBody) throw Object.assign(new Error('Note body is required'), { statusCode: 400 })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const lead = await client.query('SELECT id, telegram_chat_id, metadata FROM crm_leads WHERE id = $1 AND user_id = $2 AND workspace_id = $3 FOR UPDATE', [leadId, userId, workspaceId])
    if (!lead.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    const note = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, workspace_id, body) VALUES($1, $2, $4, $3) RETURNING id, lead_id, user_id, body, created_at`,
      [leadId, userId, normalizedBody, workspaceId]
    )
    await client.query('UPDATE crm_leads SET notes = COALESCE(notes || E\'\\n\', \'\') || $3, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND workspace_id = $4', [leadId, userId, normalizedBody, workspaceId])
    await logActivity(client, userId, workspaceId, leadId, 'note_added', 'Заметка добавлена', normalizedBody)
    await client.query('COMMIT')
    return normalizeNote(note.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function createFollowUp(userId, workspaceId, leadId) {
  const lead = await findLead(userId, workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const generated = await generateCrmFollowUp(lead)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      `INSERT INTO crm_followups(lead_id, user_id, workspace_id, message, model, prompt)
       VALUES($1, $2, $6, $3, $4, $5) RETURNING id, lead_id, user_id, message, model, created_at`,
      [leadId, userId, generated.message, generated.model, generated.prompt, workspaceId]
    )
    const noteBody = `AI follow-up: ${generated.message}`
    const noteResult = await client.query(
      `INSERT INTO crm_notes(lead_id, user_id, workspace_id, body)
       VALUES($1, $2, $4, $3) RETURNING id, lead_id, user_id, body, created_at`,
      [leadId, userId, noteBody, workspaceId]
    )
    await client.query("UPDATE crm_leads SET notes = COALESCE(notes || E'\\n', '') || $3, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND workspace_id = $4", [leadId, userId, noteBody, workspaceId])
    await logActivity(client, userId, workspaceId, leadId, 'ai_followup_generated', 'AI follow-up создан', generated.message.slice(0, 240), { model: generated.model })
    await client.query('COMMIT')
    return { followUp: normalizeFollowUp(result.rows[0]), note: normalizeNote(noteResult.rows[0]) }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function listActivity(userId, workspaceId) {
  const result = await pool.query(
    `SELECT a.id, a.lead_id, a.user_id, a.type, a.title, a.body, a.metadata, a.created_at, l.name AS lead_name
       FROM crm_activity a
       LEFT JOIN crm_leads l ON l.id = a.lead_id AND l.user_id = a.user_id
      WHERE a.user_id = $1 AND a.workspace_id = $2
      ORDER BY a.created_at DESC
      LIMIT 30`,
    [userId, workspaceId]
  )
  return result.rows.map(normalizeActivity)
}

async function listTelegramMessages(userId, workspaceId, leadId) {
  const lead = await findLead(userId, workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const result = await pool.query(
    'SELECT id, lead_id, user_id, role, message, telegram_chat_id, telegram_message_id, created_at FROM telegram_messages WHERE user_id = $1 AND workspace_id = $2 AND lead_id = $3 ORDER BY created_at ASC LIMIT 500',
    [userId, workspaceId, leadId]
  )
  return result.rows.map(normalizeTelegramMessage)
}

async function addTelegramMessage(client, { userId, workspaceId, leadId, role, message, telegramChatId = null, telegramMessageId = null, createdAt = null }) {
  const executor = client || pool
  const result = await executor.query(
    `INSERT INTO telegram_messages(lead_id, user_id, workspace_id, role, message, telegram_chat_id, telegram_message_id, created_at)
     VALUES($1, $2, $8, $3, $4, $5, $6, COALESCE($7::timestamptz, NOW()))
     RETURNING id, lead_id, user_id, role, message, telegram_chat_id, telegram_message_id, created_at`,
    [leadId, userId, role, message, telegramChatId ? String(telegramChatId) : null, telegramMessageId ? String(telegramMessageId) : null, createdAt, workspaceId]
  )
  return normalizeTelegramMessage(result.rows[0])
}

async function getTelegramMemory(userId, workspaceId, leadId, limit = 10) {
  const result = await pool.query(
    `SELECT role, message, created_at
       FROM telegram_messages
      WHERE user_id = $1 AND workspace_id = $2 AND lead_id = $3
      ORDER BY created_at DESC
      LIMIT $4`,
    [userId, workspaceId, leadId, limit]
  )
  return result.rows.reverse().map((row) => ({ role: row.role, content: row.message, createdAt: row.created_at }))
}

async function appendOutgoingTelegramMessage({ userId, workspaceId, leadId, message, telegramResponse = null }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const lead = await client.query('SELECT id, telegram_chat_id, metadata FROM crm_leads WHERE id = $1 AND user_id = $2 AND workspace_id = $3 FOR UPDATE', [leadId, userId, workspaceId])
    if (!lead.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    const telegramMessage = await addTelegramMessage(client, {
      userId,
      workspaceId,
      leadId,
      role: 'assistant',
      message,
      telegramChatId: lead.rows[0].telegram_chat_id || lead.rows[0].metadata?.telegramChatId || telegramResponse?.result?.chat?.id || null,
      telegramMessageId: telegramResponse?.result?.message_id || telegramResponse?.message_id || null,
    })
    await client.query('UPDATE crm_leads SET last_message_at = NOW(), updated_at = NOW() WHERE id = $1 AND user_id = $2 AND workspace_id = $3', [leadId, userId, workspaceId])
    await logActivity(client, userId, workspaceId, leadId, 'telegram_crm_reply_sent', 'Ответ отправлен в Telegram', message, { telegramMessageId: telegramMessage.telegramMessageId })
    await client.query('COMMIT')
    return telegramMessage
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}



function leadAiScoreInt(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number) : fallback
}

function leadAiScoreNumeric(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function leadAiScoreText(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value)
}

function leadAiScoreJson(value, fallback) {
  return JSON.stringify(value === undefined ? fallback : value)
}

function buildLeadAiScoreParams(workspaceId, leadId, intelligence) {
  const probabilityToClose = leadAiScoreInt(intelligence.probabilityToClose ?? intelligence.dealProbability, 0)
  const score = leadAiScoreInt(intelligence.score, 0)
  const aiSummary = leadAiScoreText(intelligence.aiSummary, '')
  const nextBestAction = leadAiScoreText(intelligence.nextBestAction, '')
  return [
    workspaceId,
    leadId,
    score,
    leadAiScoreText(intelligence.temperature, 'cold'),
    leadAiScoreText(intelligence.urgencyLevel, 'low'),
    leadAiScoreInt(intelligence.budgetProbability ?? intelligence.dealProbability, probabilityToClose),
    aiSummary,
    leadAiScoreText(intelligence.recommendedChannel, 'crm_task'),
    nextBestAction,
    leadAiScoreInt(intelligence.confidence, 70),
    leadAiScoreInt(intelligence.dealProbability ?? probabilityToClose, probabilityToClose),
    probabilityToClose,
    leadAiScoreText(intelligence.urgencyLevel, 'low'),
    leadAiScoreText(intelligence.engagementLevel, 'cold'),
    aiSummary,
    nextBestAction,
    leadAiScoreText(intelligence.riskLevel, 'medium'),
    intelligence.idealContactTiming === undefined ? null : intelligence.idealContactTiming,
    leadAiScoreJson(intelligence.objectionsDetected || [], []),
    intelligence.recommendedCta === undefined ? null : intelligence.recommendedCta,
    leadAiScoreInt(intelligence.engagementScore ?? score, score),
    leadAiScoreNumeric(intelligence.expectedRevenue, 0),
    leadAiScoreText(intelligence.forecastCategory, 'possible'),
    leadAiScoreJson(intelligence.riskSignals || [], []),
    leadAiScoreText(intelligence.aiReasoning, aiSummary),
    leadAiScoreText(intelligence.nextBestActionCode, 'schedule_demo'),
  ]
}

async function buildIntelligenceContext(userId, workspaceId, leadId) {
  const lead = await findLead(userId, workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const [emails, activity] = await Promise.all([
    pool.query('SELECT id, status, subject, text_body AS text, created_at, sent_at, opened_at FROM email_messages WHERE user_id = $1 AND workspace_id = $2 AND lead_id = $3 ORDER BY created_at DESC LIMIT 20', [userId, workspaceId, leadId]).then((result) => result.rows).catch(() => []),
    listActivity(userId, workspaceId).then((events) => events.filter((event) => event.leadId === leadId)).catch(() => []),
  ])
  return {
    lead: { id: lead.id, name: lead.name, company: lead.company, email: lead.email, telegram: lead.telegram, source: lead.source, stage: lead.status, value: lead.value, notesText: lead.notesText, createdAt: lead.createdAt, updatedAt: lead.updatedAt, lastMessageAt: lead.lastMessageAt },
    notes: lead.notes || [],
    followUps: lead.followUps || [],
    telegramMessages: lead.telegramMessages || [],
    emails,
    activity,
  }
}

async function saveLeadAiScore(client, workspaceId, leadId, intelligence) {
  const scoreParams = buildLeadAiScoreParams(workspaceId, leadId, intelligence)
  const result = await client.query(
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
  await client.query(
    `UPDATE crm_leads
        SET probability_to_close = $3::integer,
            estimated_revenue = value * ($3::numeric / 100.0),
            expected_close_date = COALESCE(expected_close_date, (CURRENT_DATE + INTERVAL '30 days')::date),
            updated_at = NOW()
      WHERE workspace_id = $1::uuid AND id = $2::uuid`,
    [workspaceId, leadId, scoreParams[11]]
  )
  return normalizeAiScore(result.rows[0])
}

async function createDealIntelligenceQueueItems(client, userId, workspaceId, lead, intelligence) {
  const worker = await ensureSdrWorker(client, workspaceId)
  const basePayload = {
    leadId: lead.id,
    probabilityToClose: intelligence.probabilityToClose || intelligence.dealProbability,
    riskLevel: intelligence.riskLevel,
    engagementScore: intelligence.engagementScore,
    expectedRevenue: intelligence.expectedRevenue,
    forecastCategory: intelligence.forecastCategory,
    riskSignals: intelligence.riskSignals || [],
    nextBestAction: intelligence.nextBestAction,
    nextBestActionCode: intelligence.nextBestActionCode,
    aiReasoning: intelligence.aiReasoning || intelligence.aiSummary,
  }
  const actionTypes = ['risk_review']
  if (intelligence.riskLevel === 'high' || (intelligence.riskSignals || []).some((signal) => ['no_reply_3d', 'no_reply_7d', 'proposal_ignored', 'low_activity', 'high_value_stalled'].includes(signal))) actionTypes.push('stale_deal_followup')
  if (['at_risk', 'lost_risk'].includes(intelligence.forecastCategory)) actionTypes.push('pipeline_health_alert')
  const uniqueActionTypes = [...new Set(actionTypes)]
  for (const actionType of uniqueActionTypes) {
    const duplicate = await client.query(
      `SELECT id FROM ai_worker_queue WHERE workspace_id = $1 AND lead_id = $2 AND action_type = $3 AND status IN ('pending_approval','approved','executing') AND created_at > NOW() - INTERVAL '24 hours' LIMIT 1`,
      [workspaceId, lead.id, actionType]
    )
    if (duplicate.rows[0]) continue
    const title = actionType === 'pipeline_health_alert' ? 'AI Pipeline Health Alert' : actionType === 'stale_deal_followup' ? 'AI Stale Deal Follow-up' : 'AI Risk Review'
    const recommendation = `${intelligence.aiReasoning || intelligence.aiSummary} Next best action: ${intelligence.nextBestAction}.`
    await client.query(
      `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
       VALUES($1, $2, $3, $4, 'pending_approval', $5, $6, $7)`,
      [worker.id, workspaceId, lead.id, actionType, title, recommendation, { ...basePayload, actionType }]
    )
  }
}

async function createAiFollowUpSequence(client, userId, workspaceId, leadId, context, intelligence, status = 'draft') {
  const draft = buildFollowUpDraft(context, intelligence)
  const result = await client.query(
    `INSERT INTO ai_followup_sequences(workspace_id, lead_id, status, followup_type, generated_message, scheduled_for, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [workspaceId, leadId, status, draft.followupType, draft.message, draft.scheduledFor, { score: intelligence.score, urgencyLevel: intelligence.urgencyLevel, recommendedChannel: intelligence.recommendedChannel }]
  )
  await logActivity(client, userId, workspaceId, leadId, 'ai_followup_suggested', 'AI follow-up предложен', draft.message, { followupType: draft.followupType, scheduledFor: draft.scheduledFor })
  return normalizeAiFollowUpSequence(result.rows[0])
}


const STAGE_FLOW = { new: 'qualified', qualified: 'proposal', proposal: 'booked', booked: 'won' }

function buildStageReason(lead, intelligence) {
  const summary = String(intelligence.aiSummary || intelligence.intentSummary || '').trim()
  if (intelligence.riskLevel === 'high' && lead.status === 'booked') return 'Лид не отвечает более 7 дней или встреча осталась без следующего шага.'
  if (lead.status === 'proposal') return 'Клиент согласовал встречу или обсуждает следующий шаг после предложения.'
  if (lead.status === 'qualified') return 'Клиент запросил детали предложения, стоимость или условия внедрения.'
  if (lead.status === 'new') return summary || 'Клиент подтвердил интерес к демо и запросил детали внедрения.'
  return summary || 'AI обнаружил сигналы для следующего этапа воронки.'
}

async function createAiStageRecommendation(client, userId, workspaceId, lead, intelligence) {
  if (!lead || ['won', 'lost'].includes(lead.status)) return null
  let nextStatus = STAGE_FLOW[lead.status]
  if (lead.status === 'booked') nextStatus = intelligence.riskLevel === 'high' || intelligence.dealProbability < 25 ? 'lost' : 'won'
  if (!nextStatus) return null
  const shouldRecommend = intelligence.score >= 45 || intelligence.dealProbability >= 45 || intelligence.urgencyLevel === 'high' || intelligence.riskLevel === 'high'
  if (!shouldRecommend) return null
  const duplicate = await client.query(
    `SELECT id FROM ai_worker_queue
      WHERE workspace_id = $1 AND lead_id = $2 AND action_type = 'stage_change_recommendation'
        AND payload->>'nextStatus' = $3
        AND status IN ('pending_approval','approved','executing','executed','completed')
        AND created_at > NOW() - INTERVAL '24 hours'
      LIMIT 1`,
    [workspaceId, lead.id, nextStatus]
  )
  if (duplicate.rows[0]) return null
  const worker = await ensureSdrWorker(client, workspaceId)
  const reason = buildStageReason(lead, intelligence)
  const confidence = Math.max(55, Math.min(95, Number(intelligence.confidence || intelligence.score || 60)))
  const result = await client.query(
    `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
     VALUES($1, $2, $3, 'stage_change_recommendation', 'pending_approval', $4, $5, $6)
     RETURNING id`,
    [worker.id, workspaceId, lead.id, `AI stage recommendation · ${lead.status} → ${nextStatus}`, reason, { source: 'ai_lead_analysis', currentStatus: lead.status, nextStatus, status: nextStatus, reason, confidence, probabilityToClose: intelligence.probabilityToClose || intelligence.dealProbability, estimatedRevenue: Number(lead.value || 0) * (Number(intelligence.dealProbability || 0) / 100), expectedCloseDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) }]
  )
  await logActivity(client, userId, workspaceId, lead.id, 'ai_stage_recommendation', 'AI рекомендовал смену этапа', reason, { queueId: result.rows[0].id, from: lead.status, to: nextStatus, confidence })
  return result.rows[0]
}

async function analyzeLeadIntelligence(userId, workspaceId, leadId, aiOutput = {}, { createFollowUp = true } = {}) {
  const context = await buildIntelligenceContext(userId, workspaceId, leadId)
  const intelligence = scoreLeadContext(context, aiOutput)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const score = await saveLeadAiScore(client, workspaceId, leadId, intelligence)
    await createAiStageRecommendation(client, userId, workspaceId, context.lead, intelligence)
    await createDealIntelligenceQueueItems(client, userId, workspaceId, context.lead, intelligence)
    await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'ai_forecast_updated', title: 'AI прогноз сделки обновлён', body: `AI обновил прогноз: вероятность закрытия ${intelligence.probabilityToClose || intelligence.dealProbability}%, ожидаемая выручка ${Number(intelligence.expectedRevenue || 0).toLocaleString('ru-RU')} ₽, категория ${intelligence.forecastCategory}.`, source: 'ai', metadata: intelligence })
    if (intelligence.riskLevel !== 'low' || (intelligence.riskSignals || []).length) await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'ai_risk_detected', title: 'AI обнаружил риск сделки', body: `${intelligence.aiReasoning || intelligence.aiSummary}. Следующее лучшее действие: ${intelligence.nextBestAction}.`, source: 'ai', metadata: { riskLevel: intelligence.riskLevel, riskSignals: intelligence.riskSignals, forecastCategory: intelligence.forecastCategory } })
    await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'ai_pipeline_health', title: 'AI оценил здоровье pipeline', body: `Pipeline health: риск ${intelligence.riskLevel}, engagement ${intelligence.engagementScore}/100, прогноз ${intelligence.forecastCategory}.`, source: 'ai', metadata: { riskLevel: intelligence.riskLevel, engagementScore: intelligence.engagementScore, forecastCategory: intelligence.forecastCategory } })
    await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'ai_next_action_generated', title: 'AI следующий шаг создан', body: intelligence.nextBestAction, source: 'ai', metadata: { nextBestActionCode: intelligence.nextBestActionCode, riskLevel: intelligence.riskLevel } })
    await logActivity(client, userId, workspaceId, leadId, 'ai_score_updated', 'Оценка лида обновлена', `${intelligence.riskAlert}. Рекомендуемый следующий шаг: ${intelligence.nextBestAction}`, intelligence)
    let followUpSequence = null
    if (createFollowUp && (intelligence.urgencyLevel !== 'low' || intelligence.score >= 40)) {
      followUpSequence = await createAiFollowUpSequence(client, userId, workspaceId, leadId, context, intelligence)
      const channel = intelligence.recommendedChannel === 'email' ? 'email' : 'telegram'
      await client.query(
        `INSERT INTO ai_action_queue(workspace_id, lead_id, user_id, action_type, channel, status, title, generated_text, payload)
         VALUES($1, $2, $3, $4, $5, 'pending_approval', $6, $7, $8)`,
        [workspaceId, leadId, userId, channel === 'email' ? 'email_follow_up' : 'telegram_follow_up', channel, 'AI follow-up ожидает одобрения', followUpSequence.generatedMessage, { aiScore: intelligence.score, dealProbability: intelligence.dealProbability, followUpSequenceId: followUpSequence.id }]
      )
    }
    await client.query('COMMIT')
    return { score, followUpSequence, intelligence }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function analyzeWorkspaceLeads(userId, workspaceId, limit = 25) {
  const result = await pool.query(
    `SELECT id FROM crm_leads l
      WHERE user_id = $1 AND workspace_id = $2 AND status NOT IN ('won', 'lost')
        AND NOT EXISTS (SELECT 1 FROM lead_ai_scores s WHERE s.workspace_id = l.workspace_id AND s.lead_id = l.id AND s.generated_at > NOW() - INTERVAL '6 hours')
      ORDER BY updated_at DESC LIMIT $3`,
    [userId, workspaceId, limit]
  )
  const analyzed = []
  for (const row of result.rows) analyzed.push(await analyzeLeadIntelligence(userId, workspaceId, row.id).catch((error) => ({ leadId: row.id, error: error.message })))
  return analyzed
}

async function getStats(userId, workspaceId) {
  const [summaryResult, statusResult, activityResult, aiMetricsResult, aiRevenueResult, aiExecutionResult, telegramResult, followupMetricsResult, outreachMetricsResult, landingMetricsResult, pipelineHealthResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_leads,
              COALESCE(SUM(value) FILTER (WHERE status NOT IN ('won','lost')), 0)::numeric AS pipeline_value,
              COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0)::numeric AS won_value,
              COALESCE(SUM(value) FILTER (WHERE status = 'lost'), 0)::numeric AS lost_value,
              COUNT(*) FILTER (WHERE status = 'won')::int AS won_deals,
              COUNT(*) FILTER (WHERE status = 'lost')::int AS lost_deals,
              COUNT(*) FILTER (WHERE source = 'landing' AND created_at::date = CURRENT_DATE)::int AS landing_leads_today,
              COUNT(*) FILTER (WHERE status = 'new')::int AS new_leads_count
         FROM crm_leads WHERE user_id = $1 AND workspace_id = $2`,
      [userId, workspaceId]
    ),
    pool.query(`SELECT status, COUNT(*)::int AS count, COALESCE(SUM(value), 0)::numeric AS value FROM crm_leads WHERE user_id = $1 AND workspace_id = $2 GROUP BY status`, [userId, workspaceId]),
    pool.query(
      `SELECT a.id, a.lead_id, a.user_id, a.type, a.title, a.body, a.metadata, a.created_at, l.name AS lead_name
         FROM crm_activity a LEFT JOIN crm_leads l ON l.id = a.lead_id AND l.user_id = a.user_id
        WHERE a.user_id = $1 AND a.workspace_id = $2 ORDER BY a.created_at DESC LIMIT 8`,
      [userId, workspaceId]
    ),
    pool.query(
      `SELECT COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS actions_today,
              COUNT(*) FILTER (WHERE task_type = 'generate_follow_up')::int AS generated_followups,
              COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_actions,
              COUNT(*)::int AS total_actions,
              COUNT(DISTINCT lead_id) FILTER (WHERE status = 'completed')::int AS assisted_deals
         FROM ai_agent_actions WHERE workspace_id = $1`,
      [workspaceId]
    ),
    pool.query(
      `WITH latest AS (
         SELECT DISTINCT ON (s.lead_id) s.lead_id, s.score, s.temperature, s.deal_probability, s.probability_to_close, s.urgency_level, s.risk_level
           FROM lead_ai_scores s WHERE s.workspace_id = $1 ORDER BY s.lead_id, s.generated_at DESC
       )
       SELECT COUNT(*) FILTER (WHERE COALESCE(latest.temperature, CASE WHEN latest.score >= 75 THEN 'hot' WHEN latest.score >= 45 THEN 'warm' ELSE 'cold' END) = 'hot' OR latest.score >= 75)::int AS hot_leads,
              COUNT(*) FILTER (WHERE COALESCE(latest.temperature, CASE WHEN latest.score >= 75 THEN 'hot' WHEN latest.score >= 45 THEN 'warm' ELSE 'cold' END) = 'warm' OR (latest.score >= 45 AND latest.score < 75))::int AS warm_leads,
              COUNT(*) FILTER (WHERE latest.risk_level = 'high')::int AS at_risk_deals,
              COALESCE(AVG(latest.score), 0)::numeric AS average_score,
              COALESCE(SUM(l.value * COALESCE(latest.probability_to_close, latest.deal_probability) / 100.0) FILTER (WHERE c.status NOT IN ('won','lost')), 0)::numeric AS predicted_revenue,
              COALESCE(AVG(COALESCE(latest.probability_to_close, latest.deal_probability)), 0)::numeric AS conversion_forecast,
              ((SELECT COUNT(*)::int FROM ai_followup_sequences afs WHERE afs.workspace_id = $1 AND afs.status IN ('draft','queued','approved') AND afs.sent_at IS NULL) + (SELECT COUNT(*)::int FROM ai_followup_jobs afj WHERE afj.workspace_id = $1 AND afj.status IN ('suggested','approved'))) AS followups_pending
          FROM latest
          JOIN crm_leads c ON c.id = latest.lead_id AND c.workspace_id = $1
          JOIN crm_leads l ON l.id = latest.lead_id`,
      [workspaceId]
    ),
    pool.query(
      `SELECT COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS pending_approval,
              COUNT(*) FILTER (WHERE status = 'sent' AND sent_at::date = CURRENT_DATE)::int AS sent_today,
              COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
              COUNT(*) FILTER (WHERE action_type IN ('telegram_follow_up','email_follow_up') AND status IN ('draft','pending_approval','approved'))::int AS followups_waiting,
              COUNT(*) FILTER (WHERE status = 'sent')::int AS sent_total,
              COUNT(*) FILTER (WHERE status IN ('sent','failed'))::int AS finished_total
         FROM ai_action_queue aq
        WHERE aq.workspace_id = $1 AND EXISTS (SELECT 1 FROM crm_leads l WHERE l.id = aq.lead_id AND l.user_id = $2)`,
      [workspaceId, userId]
    ),
    pool.query(
      `SELECT COUNT(DISTINCT l.id) FILTER (WHERE l.source = 'telegram' OR l.telegram_chat_id IS NOT NULL OR l.telegram IS NOT NULL)::int AS telegram_leads,
              COUNT(DISTINCT tm.id) FILTER (WHERE tm.created_at >= NOW() - INTERVAL '24 hours')::int AS recent_messages,
              COUNT(DISTINCT tm.id) FILTER (WHERE tm.role = 'assistant' AND tm.created_at::date = CURRENT_DATE)::int AS outbound_today,
              COUNT(DISTINCT tm.id) FILTER (WHERE tm.role = 'user' AND tm.created_at::date = CURRENT_DATE)::int AS replies_today,
              COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'completed' AND q.executed_at::date = CURRENT_DATE AND q.action_type IN ('telegram_draft','telegram_followup','telegram_follow_up','send_demo_link'))::int AS ai_actions_sent
         FROM crm_leads l
         LEFT JOIN telegram_messages tm ON tm.lead_id = l.id AND tm.workspace_id = l.workspace_id
         LEFT JOIN ai_worker_queue q ON q.lead_id = l.id AND q.workspace_id = l.workspace_id
        WHERE l.user_id = $1 AND l.workspace_id = $2`,
      [userId, workspaceId]
    ),
    pool.query(
      `WITH latest AS (SELECT DISTINCT ON (lead_id) lead_id, score FROM lead_ai_scores WHERE workspace_id = $1 ORDER BY lead_id, generated_at DESC), activity AS (
         SELECT l.id, GREATEST(l.updated_at, COALESCE(MAX(tm.created_at), l.updated_at), COALESCE(MAX(em.created_at), l.updated_at), COALESCE(MAX(n.created_at), l.updated_at)) AS last_activity_at
           FROM crm_leads l LEFT JOIN telegram_messages tm ON tm.lead_id = l.id AND tm.workspace_id = l.workspace_id LEFT JOIN email_messages em ON em.lead_id = l.id AND em.workspace_id = l.workspace_id LEFT JOIN crm_notes n ON n.lead_id = l.id AND n.workspace_id = l.workspace_id
          WHERE l.user_id = $2 AND l.workspace_id = $1 AND l.status NOT IN ('won','lost') GROUP BY l.id
       )
       SELECT (SELECT COUNT(*)::int FROM ai_followup_jobs j JOIN crm_leads l ON l.id = j.lead_id AND l.workspace_id = j.workspace_id WHERE j.workspace_id = $1 AND l.user_id = $2 AND j.status IN ('suggested','approved')) AS pending,
              (SELECT COUNT(*)::int FROM ai_followup_jobs j JOIN crm_leads l ON l.id = j.lead_id AND l.workspace_id = j.workspace_id WHERE j.workspace_id = $1 AND l.user_id = $2 AND j.status = 'sent' AND j.sent_at::date = CURRENT_DATE) AS sent_today,
              COUNT(*) FILTER (WHERE latest.score >= 70 AND activity.last_activity_at < NOW() - INTERVAL '12 hours')::int AS hot_without_contact
         FROM activity LEFT JOIN latest ON latest.lead_id = activity.id`,
      [workspaceId, userId]
    ),
    pool.query(
      `SELECT COUNT(*) FILTER (WHERE q.created_at::date = CURRENT_DATE)::int AS generated_today,
              COUNT(*) FILTER (WHERE q.status = 'completed' AND q.executed_at::date = CURRENT_DATE)::int AS sent_today,
              COUNT(*) FILTER (WHERE q.status = 'pending_approval')::int AS pending_approvals,
              COUNT(DISTINCT q.lead_id) FILTER (WHERE q.status = 'pending_approval')::int AS ready_leads,
              COUNT(DISTINCT q.lead_id)::int AS total_leads
         FROM ai_worker_queue q
         JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
        WHERE q.workspace_id = $1
          AND l.user_id = $2
          AND q.action_type IN ('telegram_draft','email_draft','followup_24h','followup_3d','demo_offer','meeting_request')`,
      [workspaceId, userId]
    ),
    pool.query(
      `WITH latest AS (
         SELECT DISTINCT ON (lead_id) lead_id, score, temperature
           FROM lead_ai_scores
          WHERE workspace_id = $2
          ORDER BY lead_id, generated_at DESC
       )
       SELECT COUNT(*) FILTER (WHERE l.source = 'landing' AND l.created_at::date = CURRENT_DATE)::int AS today,
              COUNT(*) FILTER (WHERE l.source = 'landing' AND l.status = 'new')::int AS pending,
              COUNT(*) FILTER (WHERE l.source = 'landing' AND (latest.score >= 75 OR latest.temperature = 'hot'))::int AS hot
         FROM crm_leads l
         LEFT JOIN latest ON latest.lead_id = l.id
        WHERE l.user_id = $1 AND l.workspace_id = $2`,
      [userId, workspaceId]
    ),
    pool.query(
      `WITH last_activity AS (
         SELECT l.id, GREATEST(l.updated_at, COALESCE(MAX(tm.created_at), l.updated_at), COALESCE(MAX(em.created_at), l.updated_at), COALESCE(MAX(n.created_at), l.updated_at)) AS last_activity_at
           FROM crm_leads l
           LEFT JOIN telegram_messages tm ON tm.lead_id = l.id AND tm.workspace_id = l.workspace_id
           LEFT JOIN email_messages em ON em.lead_id = l.id AND em.workspace_id = l.workspace_id
           LEFT JOIN crm_notes n ON n.lead_id = l.id AND n.workspace_id = l.workspace_id
          WHERE l.user_id = $2 AND l.workspace_id = $1 AND l.status NOT IN ('won','lost')
          GROUP BY l.id
       )
       SELECT (SELECT COUNT(*)::int FROM ai_worker_queue q JOIN crm_leads ql ON ql.id = q.lead_id AND ql.workspace_id = q.workspace_id WHERE q.workspace_id = $1 AND q.action_type = 'stage_change_recommendation' AND q.status = 'pending_approval' AND ql.user_id = $2) AS stage_recommendations_pending,
              COUNT(DISTINCT l.id) FILTER (WHERE last_activity.last_activity_at < NOW() - INTERVAL '3 days')::int AS inactive_opportunities,
              COUNT(DISTINCT l.id) FILTER (WHERE COALESCE(s.risk_level, '') = 'high' OR last_activity.last_activity_at < NOW() - INTERVAL '7 days')::int AS deals_at_risk,
              COUNT(DISTINCT l.id) FILTER (WHERE COALESCE(s.probability_to_close, s.deal_probability, l.probability_to_close, 0) >= 70 AND l.status NOT IN ('won','lost'))::int AS high_probability_deals,
              COUNT(DISTINCT l.id) FILTER (WHERE last_activity.last_activity_at < NOW() - INTERVAL '7 days' AND l.status NOT IN ('won','lost'))::int AS stalled_opportunities,
              COALESCE(SUM(COALESCE(s.expected_revenue, l.estimated_revenue, l.value * COALESCE(s.probability_to_close, s.deal_probability, 0) / 100.0)) FILTER (WHERE l.status NOT IN ('won','lost')), 0)::numeric AS ai_forecasted_revenue,
              COALESCE(SUM(COALESCE(s.expected_revenue, l.estimated_revenue, l.value * COALESCE(s.probability_to_close, s.deal_probability, 0) / 100.0)) FILTER (WHERE l.status NOT IN ('won','lost') AND (COALESCE(s.risk_level, '') = 'high' OR COALESCE(s.forecast_category, '') IN ('at_risk','lost_risk'))), 0)::numeric AS revenue_at_risk,
              jsonb_build_object(
                'committed', COUNT(DISTINCT l.id) FILTER (WHERE s.forecast_category = 'committed'),
                'likely', COUNT(DISTINCT l.id) FILTER (WHERE s.forecast_category = 'likely'),
                'possible', COUNT(DISTINCT l.id) FILTER (WHERE COALESCE(s.forecast_category, 'possible') = 'possible'),
                'at_risk', COUNT(DISTINCT l.id) FILTER (WHERE s.forecast_category = 'at_risk'),
                'lost_risk', COUNT(DISTINCT l.id) FILTER (WHERE s.forecast_category = 'lost_risk')
              ) AS forecast_distribution
         FROM crm_leads l
         LEFT JOIN last_activity ON last_activity.id = l.id
         LEFT JOIN LATERAL (SELECT las.deal_probability, las.probability_to_close, las.risk_level, las.expected_revenue, las.forecast_category FROM lead_ai_scores las WHERE las.workspace_id = l.workspace_id AND las.lead_id = l.id ORDER BY las.generated_at DESC LIMIT 1) s ON true
        WHERE l.user_id = $2 AND l.workspace_id = $1`,
      [workspaceId, userId]
    ),
  ])
  const byStatus = CRM_STATUSES.reduce((acc, status) => ({ ...acc, [status]: { count: 0, value: 0 } }), {})
  for (const row of statusResult.rows) byStatus[row.status] = { count: row.count, value: Number(row.value || 0) }
  const summary = summaryResult.rows[0] || {}
  const total = Number(summary.total_leads || 0)
  const wonDeals = Number(summary.won_deals || 0)
  const lostDeals = Number(summary.lost_deals || 0)
  const aiMetrics = aiMetricsResult.rows[0] || {}
  const aiTotal = Number(aiMetrics.total_actions || 0)
  const aiCompleted = Number(aiMetrics.completed_actions || 0)
  const aiRevenue = aiRevenueResult.rows[0] || {}
  const aiExecution = aiExecutionResult.rows[0] || {}
  const telegramStats = telegramResult.rows[0] || {}
  const followupMetrics = followupMetricsResult.rows[0] || {}
  const outreachMetrics = outreachMetricsResult.rows[0] || {}
  const landingMetrics = landingMetricsResult.rows[0] || {}
  const pipelineHealth = pipelineHealthResult.rows[0] || {}
  const aiExecutionFinished = Number(aiExecution.finished_total || 0)
  return {
    totalLeads: total,
    pipelineValue: Number(summary.pipeline_value || 0),
    wonValue: Number(summary.won_value || 0),
    lostValue: Number(summary.lost_value || 0),
    wonDeals,
    lostDeals,
    conversionRate: total ? Math.round((wonDeals / total) * 100) : 0,
    landingLeadsToday: Number(landingMetrics.today || summary.landing_leads_today || 0),
    hotLandingLeads: Number(landingMetrics.hot || 0),
    pendingWebsiteLeads: Number(landingMetrics.pending || 0),
    newLeadsCount: Number(summary.new_leads_count || 0),
    telegram: {
      leads: Number(telegramStats.telegram_leads || 0),
      recentMessages: Number(telegramStats.recent_messages || 0),
      outboundToday: Number(telegramStats.outbound_today || 0),
      aiActionsSent: Number(telegramStats.ai_actions_sent || 0),
    },
    aiMetrics: {
      actionsToday: Number(aiMetrics.actions_today || 0),
      generatedFollowUps: Number(aiMetrics.generated_followups || 0),
      efficiency: aiTotal ? Math.round((aiCompleted / aiTotal) * 100) : 0,
      conversionRate: total ? Math.round((wonDeals / total) * 100) : 0,
      assistedDeals: Number(aiMetrics.assisted_deals || 0),
      hotLeads: Number(aiRevenue.hot_leads || 0),
      warmLeads: Number(aiRevenue.warm_leads || 0),
      predictedRevenue: Number(pipelineHealth.ai_forecasted_revenue || aiRevenue.predicted_revenue || 0),
      aiForecastedRevenue: Number(pipelineHealth.ai_forecasted_revenue || aiRevenue.predicted_revenue || 0),
      atRiskDeals: Number(pipelineHealth.deals_at_risk || aiRevenue.at_risk_deals || 0),
      dealsAtRisk: Number(pipelineHealth.deals_at_risk || aiRevenue.at_risk_deals || 0),
      revenueAtRisk: Number(pipelineHealth.revenue_at_risk || 0),
      highProbabilityDeals: Number(pipelineHealth.high_probability_deals || 0),
      stalledOpportunities: Number(pipelineHealth.stalled_opportunities || pipelineHealth.inactive_opportunities || 0),
      forecastDistribution: pipelineHealth.forecast_distribution || { committed: 0, likely: 0, possible: 0, at_risk: 0, lost_risk: 0 },
      inactiveOpportunities: Number(pipelineHealth.inactive_opportunities || 0),
      stageRecommendationsPending: Number(pipelineHealth.stage_recommendations_pending || 0),
      pipelineHealth: Math.max(0, 100 - (Number(pipelineHealth.deals_at_risk || 0) * 12) - (Number(pipelineHealth.inactive_opportunities || 0) * 5)),
      followUpsPending: Number(aiRevenue.followups_pending || 0),
      averageLeadScore: Math.round(Number(aiRevenue.average_score || 0)),
      conversionForecast: Math.round(Number(aiRevenue.conversion_forecast || 0)),
      conversionProbability: Math.round(Number(aiRevenue.conversion_forecast || 0)),
      pendingApproval: Number(aiExecution.pending_approval || 0),
      sentToday: Number(aiExecution.sent_today || 0),
      failedActions: Number(aiExecution.failed || 0),
      followUpsWaiting: Number(aiExecution.followups_waiting || 0),
      executionSuccessRate: aiExecutionFinished ? Math.round((Number(aiExecution.sent_total || 0) / aiExecutionFinished) * 100) : 0,
      autonomousFollowUpsPending: Number(followupMetrics.pending || 0),
      hotLeadsWithoutContact: Number(followupMetrics.hot_without_contact || 0),
      autonomousFollowUpsSentToday: Number(followupMetrics.sent_today || 0),
      followUpConversionPlaceholder: 0,
      outreachGeneratedToday: Number(outreachMetrics.generated_today || 0),
      aiMessagesDraftedToday: Number(outreachMetrics.generated_today || 0),
      aiMessagesSentToday: Number(outreachMetrics.sent_today || 0),
      repliesReceivedToday: Number(telegramStats.replies_today || 0),
      pendingApprovals: Number(outreachMetrics.pending_approvals || aiExecution.pending_approval || 0),
      outreachPendingApprovals: Number(outreachMetrics.pending_approvals || 0),
      aiResponseReadiness: Number(outreachMetrics.total_leads || 0) ? Math.round((Number(outreachMetrics.ready_leads || 0) / Number(outreachMetrics.total_leads || 1)) * 100) : 0,
    },
    byStatus,
    activity: activityResult.rows.map(normalizeActivity),
    recentNotes: activityResult.rows.filter((row) => row.type === 'note_added').map((row) => ({ id: row.id, leadName: row.lead_name, body: row.body, createdAt: row.created_at })),
  }
}

module.exports = { CRM_STATUSES, STATUS_LABELS, addTelegramMessage, analyzeLeadIntelligence, analyzeWorkspaceLeads, appendOutgoingTelegramMessage, createFollowUp, createLead, createNote, deleteLead, findLead, getStats, getTelegramMemory, listActivity, listLeads, listStages, listTelegramMessages, updateLead, updateStage }
