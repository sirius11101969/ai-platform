const pool = require('../db/pool')
const { generateCrmFollowUp } = require('../services/crmAiService')
const { buildFollowUpDraft, scoreLeadContext } = require('../services/leadIntelligenceService')

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
const LEAD_COLUMNS = ['id', 'user_id', 'workspace_id', 'name', 'email', 'phone', 'telegram', 'telegram_id', 'telegram_username', 'first_name', 'last_name', 'first_message', 'last_message_at', 'last_seen_at', 'company', 'status', 'value', 'source', 'notes', 'metadata', 'created_at', 'updated_at']
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
    telegramUsername: row.telegram_username || row.telegram || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    firstMessage: row.first_message || '',
    lastMessageAt: row.last_message_at || row.metadata?.telegramLastMessageAt || null,
    lastSeenAt: row.last_seen_at || row.last_message_at || null,
    telegramOnline: Boolean(row.last_seen_at && Date.now() - new Date(row.last_seen_at).getTime() < 5 * 60 * 1000),
    company: row.company || '',
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] || row.status,
    value: Number(row.value || 0),
    source: row.source || '',
    metadata: row.metadata || {},
    notesText: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: Array.isArray(row.notes_list) ? row.notes_list.map(normalizeNote).filter(Boolean) : [],
    followUps: Array.isArray(row.followups) ? row.followups.map(normalizeFollowUp).filter(Boolean) : [],
    telegramMessages: Array.isArray(row.telegram_messages) ? row.telegram_messages.map(normalizeTelegramMessage).filter(Boolean) : [],
    aiRecommendation: row.ai_recommendation || null,
    aiScore: normalizeAiScore(row.ai_score || row.ai_score_row || null),
    aiFollowUpSequences: Array.isArray(row.ai_followup_sequences) ? row.ai_followup_sequences.map(normalizeAiFollowUpSequence).filter(Boolean) : [],
    aiActions: Array.isArray(row.ai_actions) ? row.ai_actions : [],
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
    dealProbability: Number(row.deal_probability ?? row.dealProbability ?? 0),
    urgencyLevel: row.urgency_level || row.urgencyLevel || 'low',
    engagementLevel: row.engagement_level || row.engagementLevel || row.temperature || 'cold',
    riskLevel: row.risk_level || row.riskLevel || 'medium',
    aiSummary: row.ai_summary || row.aiSummary || '',
    nextBestAction: row.next_best_action || row.nextBestAction || '',
    idealContactTiming: row.ideal_contact_timing || row.idealContactTiming || '',
    objectionsDetected: row.objections_detected || row.objectionsDetected || [],
    recommendedCta: row.recommended_cta || row.recommendedCta || '',
    recommendedChannel: row.recommended_channel || row.recommendedChannel || '',
    generatedAt: row.generated_at || row.generatedAt,
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
  return { id: row.id, leadId: row.lead_id, userId: row.user_id, role: row.role, message: row.message, telegramMessageId: row.telegram_message_id || '', createdAt: row.created_at }
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
            COALESCE((SELECT json_agg(tm_row ORDER BY tm_row.created_at ASC) FROM (SELECT tm.id, tm.lead_id, tm.user_id, tm.role, tm.message, tm.telegram_message_id, tm.created_at FROM telegram_messages tm WHERE tm.lead_id = l.id AND tm.user_id = l.user_id ORDER BY tm.created_at DESC LIMIT 10) tm_row), '[]'::json) AS telegram_messages,
            (SELECT to_jsonb(s) FROM (SELECT * FROM lead_ai_scores las WHERE las.workspace_id = l.workspace_id AND las.lead_id = l.id ORDER BY las.generated_at DESC LIMIT 1) s) AS ai_score,
            COALESCE((SELECT json_agg(seq_row ORDER BY seq_row.recommended_at DESC) FROM (SELECT * FROM ai_followup_sequences afs WHERE afs.workspace_id = l.workspace_id AND afs.lead_id = l.id ORDER BY afs.recommended_at DESC LIMIT 5) seq_row), '[]'::json) AS ai_followup_sequences,
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
  const [notes, followups, telegramMessages, aiScore, aiSequences] = await Promise.all([
    client.query('SELECT id, lead_id, user_id, body, created_at FROM crm_notes WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at DESC', [userId, leadId, workspaceId]),
    client.query('SELECT id, lead_id, user_id, message, model, created_at FROM crm_followups WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at DESC', [userId, leadId, workspaceId]),
    client.query('SELECT id, lead_id, user_id, role, message, telegram_message_id, created_at FROM telegram_messages WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at ASC LIMIT 200', [userId, leadId, workspaceId]),
    client.query('SELECT * FROM lead_ai_scores WHERE workspace_id = $1 AND lead_id = $2 ORDER BY generated_at DESC LIMIT 1', [workspaceId, leadId]),
    client.query('SELECT * FROM ai_followup_sequences WHERE workspace_id = $1 AND lead_id = $2 ORDER BY recommended_at DESC LIMIT 5', [workspaceId, leadId]),
  ])
  const ai = await client.query("SELECT output_result FROM ai_agent_actions WHERE workspace_id = $1 AND lead_id = $2 AND task_type = 'analyze_lead' AND status = 'completed' ORDER BY created_at DESC LIMIT 1", [workspaceId, leadId])
  const aiActions = await client.query('SELECT id, task_type, status, output_result, created_at FROM ai_agent_actions WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 5', [workspaceId, leadId])
  return normalizeLead({ ...result.rows[0], notes_list: notes.rows, followups: followups.rows, telegram_messages: telegramMessages.rows, ai_score: aiScore.rows[0] || null, ai_followup_sequences: aiSequences.rows, ai_recommendation: ai.rows[0]?.output_result || null, ai_actions: aiActions.rows })
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
    await client.query('COMMIT')
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
    const lead = await client.query('SELECT id FROM crm_leads WHERE id = $1 AND user_id = $2 AND workspace_id = $3 FOR UPDATE', [leadId, userId, workspaceId])
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
    'SELECT id, lead_id, user_id, role, message, telegram_message_id, created_at FROM telegram_messages WHERE user_id = $1 AND workspace_id = $2 AND lead_id = $3 ORDER BY created_at ASC LIMIT 500',
    [userId, workspaceId, leadId]
  )
  return result.rows.map(normalizeTelegramMessage)
}

async function addTelegramMessage(client, { userId, workspaceId, leadId, role, message, telegramMessageId = null, createdAt = null }) {
  const executor = client || pool
  const result = await executor.query(
    `INSERT INTO telegram_messages(lead_id, user_id, workspace_id, role, message, telegram_message_id, created_at)
     VALUES($1, $2, $7, $3, $4, $5, COALESCE($6::timestamptz, NOW()))
     RETURNING id, lead_id, user_id, role, message, telegram_message_id, created_at`,
    [leadId, userId, role, message, telegramMessageId ? String(telegramMessageId) : null, createdAt, workspaceId]
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
    const lead = await client.query('SELECT id FROM crm_leads WHERE id = $1 AND user_id = $2 AND workspace_id = $3 FOR UPDATE', [leadId, userId, workspaceId])
    if (!lead.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
    const telegramMessage = await addTelegramMessage(client, {
      userId,
      workspaceId,
      leadId,
      role: 'assistant',
      message,
      telegramMessageId: telegramResponse?.result?.message_id || telegramResponse?.message_id || null,
    })
    await client.query('UPDATE crm_leads SET updated_at = NOW() WHERE id = $1 AND user_id = $2 AND workspace_id = $3', [leadId, userId, workspaceId])
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
  const result = await client.query(
    `INSERT INTO lead_ai_scores(workspace_id, lead_id, score, temperature, deal_probability, urgency_level, engagement_level, ai_summary, next_best_action, risk_level, ideal_contact_timing, objections_detected, recommended_cta, recommended_channel)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [workspaceId, leadId, intelligence.score, intelligence.temperature, intelligence.dealProbability, intelligence.urgencyLevel, intelligence.engagementLevel, intelligence.aiSummary, intelligence.nextBestAction, intelligence.riskLevel, intelligence.idealContactTiming, JSON.stringify(intelligence.objectionsDetected || []), intelligence.recommendedCta, intelligence.recommendedChannel]
  )
  return normalizeAiScore(result.rows[0])
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

async function analyzeLeadIntelligence(userId, workspaceId, leadId, aiOutput = {}, { createFollowUp = true } = {}) {
  const context = await buildIntelligenceContext(userId, workspaceId, leadId)
  const intelligence = scoreLeadContext(context, aiOutput)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const score = await saveLeadAiScore(client, workspaceId, leadId, intelligence)
    await logActivity(client, userId, workspaceId, leadId, 'ai_score_updated', 'AI score обновлён', `${intelligence.score}/100 · ${intelligence.dealProbability}% вероятность сделки · ${intelligence.riskAlert}`, intelligence)
    let followUpSequence = null
    if (createFollowUp && (intelligence.urgencyLevel !== 'low' || intelligence.score >= 40)) {
      followUpSequence = await createAiFollowUpSequence(client, userId, workspaceId, leadId, context, intelligence)
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
  const [summaryResult, statusResult, activityResult, aiMetricsResult, aiRevenueResult] = await Promise.all([
    pool.query(
      `SELECT COUNT(*)::int AS total_leads,
              COALESCE(SUM(value) FILTER (WHERE status NOT IN ('won','lost')), 0)::numeric AS pipeline_value,
              COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0)::numeric AS won_value,
              COALESCE(SUM(value) FILTER (WHERE status = 'lost'), 0)::numeric AS lost_value,
              COUNT(*) FILTER (WHERE status = 'won')::int AS won_deals,
              COUNT(*) FILTER (WHERE status = 'lost')::int AS lost_deals
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
         SELECT DISTINCT ON (lead_id) lead_id, score, deal_probability, urgency_level, risk_level
           FROM lead_ai_scores WHERE workspace_id = $1 ORDER BY lead_id, generated_at DESC
       )
       SELECT COUNT(*) FILTER (WHERE score >= 70)::int AS hot_leads,
              COUNT(*) FILTER (WHERE risk_level = 'high')::int AS at_risk_deals,
              COALESCE(AVG(score), 0)::numeric AS average_score,
              COALESCE(SUM(l.value * latest.deal_probability / 100.0) FILTER (WHERE c.status NOT IN ('won','lost')), 0)::numeric AS predicted_revenue,
              COALESCE(AVG(deal_probability), 0)::numeric AS conversion_forecast,
              (SELECT COUNT(*)::int FROM ai_followup_sequences afs WHERE afs.workspace_id = $1 AND afs.status IN ('draft','queued','approved') AND afs.sent_at IS NULL) AS followups_pending
          FROM latest
          JOIN crm_leads c ON c.id = latest.lead_id AND c.workspace_id = $1
          JOIN crm_leads l ON l.id = latest.lead_id`,
      [workspaceId]
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
  return {
    totalLeads: total,
    pipelineValue: Number(summary.pipeline_value || 0),
    wonValue: Number(summary.won_value || 0),
    lostValue: Number(summary.lost_value || 0),
    wonDeals,
    lostDeals,
    conversionRate: total ? Math.round((wonDeals / total) * 100) : 0,
    aiMetrics: {
      actionsToday: Number(aiMetrics.actions_today || 0),
      generatedFollowUps: Number(aiMetrics.generated_followups || 0),
      efficiency: aiTotal ? Math.round((aiCompleted / aiTotal) * 100) : 0,
      conversionRate: total ? Math.round((wonDeals / total) * 100) : 0,
      assistedDeals: Number(aiMetrics.assisted_deals || 0),
      hotLeads: Number(aiRevenue.hot_leads || 0),
      predictedRevenue: Number(aiRevenue.predicted_revenue || 0),
      atRiskDeals: Number(aiRevenue.at_risk_deals || 0),
      followUpsPending: Number(aiRevenue.followups_pending || 0),
      averageLeadScore: Math.round(Number(aiRevenue.average_score || 0)),
      conversionForecast: Math.round(Number(aiRevenue.conversion_forecast || 0)),
    },
    byStatus,
    activity: activityResult.rows.map(normalizeActivity),
    recentNotes: activityResult.rows.filter((row) => row.type === 'note_added').map((row) => ({ id: row.id, leadName: row.lead_name, body: row.body, createdAt: row.created_at })),
  }
}

module.exports = { CRM_STATUSES, STATUS_LABELS, addTelegramMessage, analyzeLeadIntelligence, analyzeWorkspaceLeads, appendOutgoingTelegramMessage, createFollowUp, createLead, createNote, deleteLead, findLead, getStats, getTelegramMemory, listActivity, listLeads, listStages, listTelegramMessages, updateLead, updateStage }
