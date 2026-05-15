const pool = require('../db/pool')
const { generateCrmFollowUp } = require('../services/crmAiService')

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
            COALESCE((SELECT json_agg(tm_row ORDER BY tm_row.created_at ASC) FROM (SELECT tm.id, tm.lead_id, tm.user_id, tm.role, tm.message, tm.telegram_message_id, tm.created_at FROM telegram_messages tm WHERE tm.lead_id = l.id AND tm.user_id = l.user_id ORDER BY tm.created_at DESC LIMIT 10) tm_row), '[]'::json) AS telegram_messages
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
  const [notes, followups, telegramMessages] = await Promise.all([
    client.query('SELECT id, lead_id, user_id, body, created_at FROM crm_notes WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at DESC', [userId, leadId, workspaceId]),
    client.query('SELECT id, lead_id, user_id, message, model, created_at FROM crm_followups WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at DESC', [userId, leadId, workspaceId]),
    client.query('SELECT id, lead_id, user_id, role, message, telegram_message_id, created_at FROM telegram_messages WHERE user_id = $1 AND workspace_id = $3 AND lead_id = $2 ORDER BY created_at ASC LIMIT 200', [userId, leadId, workspaceId]),
  ])
  return normalizeLead({ ...result.rows[0], notes_list: notes.rows, followups: followups.rows, telegram_messages: telegramMessages.rows })
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

async function getStats(userId, workspaceId) {
  const [summaryResult, statusResult, activityResult] = await Promise.all([
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
  ])
  const byStatus = CRM_STATUSES.reduce((acc, status) => ({ ...acc, [status]: { count: 0, value: 0 } }), {})
  for (const row of statusResult.rows) byStatus[row.status] = { count: row.count, value: Number(row.value || 0) }
  const summary = summaryResult.rows[0] || {}
  const total = Number(summary.total_leads || 0)
  const wonDeals = Number(summary.won_deals || 0)
  const lostDeals = Number(summary.lost_deals || 0)
  return {
    totalLeads: total,
    pipelineValue: Number(summary.pipeline_value || 0),
    wonValue: Number(summary.won_value || 0),
    lostValue: Number(summary.lost_value || 0),
    wonDeals,
    lostDeals,
    conversionRate: total ? Math.round((wonDeals / total) * 100) : 0,
    byStatus,
    activity: activityResult.rows.map(normalizeActivity),
    recentNotes: activityResult.rows.filter((row) => row.type === 'note_added').map((row) => ({ id: row.id, leadName: row.lead_name, body: row.body, createdAt: row.created_at })),
  }
}

module.exports = { CRM_STATUSES, STATUS_LABELS, addTelegramMessage, appendOutgoingTelegramMessage, createFollowUp, createLead, createNote, deleteLead, getStats, getTelegramMemory, listActivity, listLeads, listStages, listTelegramMessages, updateLead, updateStage }
