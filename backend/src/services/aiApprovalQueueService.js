const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const emailService = require('./emailService')
const { sendTelegramMessageToLead } = require('./telegramService')
const { sendLeadAttachments } = require('./attachmentService')
const { addTimelineEvent } = require('./timelineService')

const STATUSES = ['pending_approval', 'approved', 'rejected', 'executing', 'completed', 'executed', 'failed', 'cancelled']
const EXECUTION_TYPES = ['telegram_followup', 'email_followup', 'send_demo_link', 'send_presentation', 'create_reminder', 'move_lead_stage', 'stage_change_recommendation', 'followup_24h', 'followup_3d', 'demo_offer', 'meeting_request']

const ACTION_ALIASES = {
  telegram_draft: 'telegram_followup',
  telegram_follow_up: 'telegram_followup',
  email_draft: 'email_followup',
  email_follow_up: 'email_followup',
  follow_up_recommendation: 'email_followup',
  followup_24h: 'followup_24h',
  followup_3d: 'followup_3d',
  demo_offer: 'demo_offer',
  meeting_request: 'meeting_request',
  crm_next_action: 'create_reminder',
  move_lead_stage: 'stage_change_recommendation',
  lead_prioritization: 'create_reminder',
}

function normalize(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    workerId: row.worker_id,
    workerName: row.worker_name || '',
    actionType: row.action_type,
    executionType: normalizeActionType(row.action_type),
    title: row.title,
    recommendation: row.recommendation || '',
    payload: row.payload || {},
    status: row.status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    executedAt: row.executed_at,
    errorMessage: row.error_message || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lead: row.lead_id ? {
      id: row.lead_id,
      name: row.lead_name || '',
      company: row.lead_company || '',
      email: row.lead_email || '',
      telegram: row.lead_telegram || '',
      telegramChatId: row.lead_telegram_chat_id || '',
      hasTelegramChatId: Boolean(row.lead_telegram_chat_id),
      status: row.lead_status || '',
    } : null,
  }
}

function normalizeActionType(actionType) {
  const value = String(actionType || '').trim()
  return ACTION_ALIASES[value] || value
}

function russianError(message) {
  return Object.assign(new Error(message), { statusCode: 400 })
}

async function assertQueueItem(userId, workspaceId, queueId, client = pool) {
  const result = await client.query(
    `SELECT q.*, w.name AS worker_name, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.telegram AS lead_telegram, l.telegram_chat_id AS lead_telegram_chat_id, l.status AS lead_status
       FROM ai_worker_queue q
       JOIN ai_workers w ON w.id = q.worker_id AND w.workspace_id = q.workspace_id
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
      WHERE q.id = $1 AND q.workspace_id = $2
        AND EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $3)`,
    [queueId, workspaceId, userId]
  )
  if (!result.rows[0]) throw Object.assign(new Error('AI действие не найдено или недоступно в этом рабочем пространстве'), { statusCode: 404 })
  return normalize(result.rows[0])
}

async function saveAudit(client, { workspaceId, leadId, userId, type, title, body, source = 'ai', metadata = {} }) {
  if (leadId) {
    await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: type, title, body, source, metadata })
  }
  await client.query(
    `INSERT INTO crm_activity(workspace_id, user_id, lead_id, type, title, body, metadata)
     VALUES($1, $2, $3, $4, $5, $6, $7)`,
    [workspaceId, userId, leadId || null, type, title, body, metadata]
  )
}

async function listQueue(userId, workspaceId, filters = {}) {
  const values = [workspaceId, userId]
  const clauses = [
    'q.workspace_id = $1',
    'EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $2)',
  ]
  if (filters.leadId) {
    values.push(filters.leadId)
    clauses.push(`q.lead_id = $${values.length}`)
  }
  if (filters.status) {
    values.push(String(filters.status))
    clauses.push(`q.status = $${values.length}`)
  }
  const result = await pool.query(
    `SELECT q.*, w.name AS worker_name, l.name AS lead_name, l.company AS lead_company, l.email AS lead_email, l.telegram AS lead_telegram, l.telegram_chat_id AS lead_telegram_chat_id, l.status AS lead_status
       FROM ai_worker_queue q
       JOIN ai_workers w ON w.id = q.worker_id AND w.workspace_id = q.workspace_id
       LEFT JOIN crm_leads l ON l.id = q.lead_id AND l.workspace_id = q.workspace_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY q.created_at DESC
      LIMIT 200`,
    values
  )
  return result.rows.map(normalize)
}

async function updateQueueItem(userId, workspaceId, queueId, payload) {
  const current = await assertQueueItem(userId, workspaceId, queueId)
  if (['executing', 'completed', 'executed'].includes(current.status)) throw russianError('Нельзя изменить AI действие во время или после выполнения')
  const updates = []
  const values = [workspaceId, queueId]
  function set(column, value) { values.push(value); updates.push(`${column} = $${values.length}`) }
  if (payload.title !== undefined) set('title', String(payload.title || current.title).trim() || current.title)
  if (payload.recommendation !== undefined) set('recommendation', String(payload.recommendation || ''))
  if (payload.payload !== undefined) set('payload', payload.payload || {})
  if (payload.actionType !== undefined) {
    const nextType = normalizeActionType(payload.actionType)
    if (!EXECUTION_TYPES.includes(nextType)) throw russianError('Неподдерживаемый тип AI действия')
    set('action_type', nextType)
  }
  if (!updates.length) return current
  updates.push('updated_at = NOW()')
  const result = await pool.query(`UPDATE ai_worker_queue SET ${updates.join(', ')} WHERE workspace_id = $1 AND id = $2 RETURNING *`, values)
  return assertQueueItem(userId, workspaceId, result.rows[0].id)
}


async function approveAndExecuteStageChange(userId, workspaceId, item) {
  const nextStatus = item.payload.status || item.payload.nextStatus
  if (!nextStatus) throw russianError('AI рекомендация этапа не содержит целевой этап')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `UPDATE ai_worker_queue
          SET status = 'executing', approved_by = $3, approved_at = NOW(), error_message = NULL, updated_at = NOW()
        WHERE workspace_id = $1 AND id = $2`,
      [workspaceId, item.id, userId]
    )
    await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'stage_approved', title: 'AI stage change approved', body: item.recommendation || item.title, metadata: { queueId: item.id, actionType: item.actionType, from: item.payload.currentStatus, to: nextStatus, confidence: item.payload.confidence } })
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    client.release()
    throw error
  }
  client.release()

  try {
    const result = await crmModel.updateLead(userId, workspaceId, item.leadId, { status: nextStatus })
    const auditClient = await pool.connect()
    try {
      await auditClient.query('BEGIN')
      await auditClient.query("UPDATE ai_worker_queue SET status = 'executed', executed_at = NOW(), error_message = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, item.id])
      await saveAudit(auditClient, { workspaceId, leadId: item.leadId, userId, type: 'stage_changed', title: 'CRM stage changed by approved AI recommendation', body: `${item.payload.currentStatus || result.status} → ${nextStatus}`, metadata: { queueId: item.id, actionType: item.actionType, from: item.payload.currentStatus, to: nextStatus } })
      await auditClient.query('COMMIT')
    } catch (error) { await auditClient.query('ROLLBACK'); throw error } finally { auditClient.release() }
    return assertQueueItem(userId, workspaceId, item.id)
  } catch (error) {
    await pool.query("UPDATE ai_worker_queue SET status = 'failed', error_message = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, item.id, error.message || 'Stage change failed'])
    throw error
  }
}

async function approveQueueItem(userId, workspaceId, queueId) {
  const item = await assertQueueItem(userId, workspaceId, queueId)
  if (!['pending_approval', 'failed'].includes(item.status)) throw russianError('Одобрить можно только действие со статусом ожидания или ошибки')
  if (item.executionType === 'stage_change_recommendation') return approveAndExecuteStageChange(userId, workspaceId, item)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query(
      `UPDATE ai_worker_queue
          SET status = 'approved', approved_by = $3, approved_at = NOW(), error_message = NULL, updated_at = NOW()
        WHERE workspace_id = $1 AND id = $2 RETURNING *`,
      [workspaceId, queueId, userId]
    )
    await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'ai_action_approved', title: 'AI действие одобрено', body: item.title, metadata: { queueId, actionType: item.actionType } })
    await client.query('COMMIT')
    return assertQueueItem(userId, workspaceId, result.rows[0].id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

async function rejectQueueItem(userId, workspaceId, queueId) {
  const item = await assertQueueItem(userId, workspaceId, queueId)
  if (['executing', 'completed', 'executed'].includes(item.status)) throw russianError('Нельзя отклонить уже выполняемое или завершённое AI действие')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await client.query("UPDATE ai_worker_queue SET status = 'rejected', updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, queueId])
    await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'ai_action_rejected', title: 'AI действие отклонено', body: item.title, metadata: { queueId, actionType: item.actionType } })
    await client.query('COMMIT')
    return assertQueueItem(userId, workspaceId, result.rows[0].id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

function buildMessage(item) {
  if (item.executionType === 'send_demo_link') return item.recommendation || 'Демо AS6 AI CRM Platform: https://www.as6.ru'
  return item.payload.text || item.payload.message || item.recommendation || item.title
}

async function executeByType(userId, workspaceId, item) {
  if (!item.leadId && item.executionType !== 'create_reminder') throw russianError('Для выполнения нужен привязанный лид')
  const type = item.executionType
  const channel = item.payload.channel || item.payload.suggestedChannel || (item.lead?.hasTelegramChatId ? 'telegram' : item.lead?.email ? 'email' : 'crm')
  if (type === 'telegram_followup') return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text: buildMessage(item) })
  if (['followup_24h', 'followup_3d', 'demo_offer', 'meeting_request'].includes(type)) {
    if (channel === 'telegram') return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text: buildMessage(item) })
    if (channel === 'email') return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.to || item.lead?.email, subject: item.payload.subject || item.title, text: buildMessage(item), html: item.payload.html || '' })
    return crmModel.createNote(userId, workspaceId, item.leadId, item.payload.reminderText || buildMessage(item))
  }
  if (type === 'email_followup') return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.to || item.lead?.email, subject: item.payload.subject || item.title, text: buildMessage(item), html: item.payload.html || '' })
  if (type === 'send_demo_link') {
    const text = buildMessage({ ...item, recommendation: item.recommendation || 'Демо AS6 AI CRM Platform: https://www.as6.ru' })
    const demoChannel = item.lead?.hasTelegramChatId ? 'telegram' : channel
    if (demoChannel === 'telegram') return sendTelegramMessageToLead({ userId, workspaceId, leadId: item.leadId, text })
    if (demoChannel === 'email') return emailService.sendEmailNow(userId, { workspaceId, leadId: item.leadId, to: item.payload.to || item.lead?.email, subject: item.payload.subject || 'Демо AS6 AI CRM Platform', text, html: item.payload.html || '' })
    return crmModel.createNote(userId, workspaceId, item.leadId, text)
  }
  if (type === 'send_presentation') return sendLeadAttachments({ userId, workspaceId, leadId: item.leadId, channel: channel === 'telegram' ? 'telegram' : 'email', materialKeys: item.payload.materialKeys || ['presentation'], email: { to: item.payload.to || item.lead?.email, subject: item.payload.subject || 'Презентация AS6 AI CRM Platform' } })
  if (type === 'create_reminder') return crmModel.createNote(userId, workspaceId, item.leadId, item.payload.reminderText || buildMessage(item) || 'AI напоминание')
  if (type === 'move_lead_stage' || type === 'stage_change_recommendation') return crmModel.updateLead(userId, workspaceId, item.leadId, { status: item.payload.status || item.payload.nextStatus })
  throw russianError('Неподдерживаемый тип выполнения AI действия')
}

async function executeQueueItem(userId, workspaceId, queueId) {
  let item = await assertQueueItem(userId, workspaceId, queueId)
  if (item.status !== 'approved') throw russianError('Сначала одобрите AI действие, затем нажмите «Выполнить»')
  const executionType = item.executionType
  if (!EXECUTION_TYPES.includes(executionType)) throw russianError('Это AI действие пока нельзя выполнить автоматически. Измените тип действия.')
  await pool.query("UPDATE ai_worker_queue SET status = 'executing', error_message = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId])
  item = await assertQueueItem(userId, workspaceId, queueId)
  try {
    const result = await executeByType(userId, workspaceId, item)
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("UPDATE ai_worker_queue SET status = $3, executed_at = NOW(), error_message = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId, executionType === 'stage_change_recommendation' ? 'executed' : 'completed'])
      await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: executionType === 'email_followup' || item.payload.channel === 'email' ? 'email_sent' : executionType === 'telegram_followup' || item.payload.channel === 'telegram' ? 'telegram_sent' : 'ai_action_executed', title: executionType === 'email_followup' || item.payload.channel === 'email' ? 'Email отправлен' : executionType === 'telegram_followup' || item.payload.channel === 'telegram' ? 'Telegram отправлен' : 'AI действие выполнено', body: item.title, source: item.payload.channel || 'ai', metadata: { queueId, actionType: item.actionType, executionType } })
      await client.query('COMMIT')
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
    return { item: await assertQueueItem(userId, workspaceId, queueId), result }
  } catch (error) {
    const message = error.message || 'Не удалось выполнить AI действие'
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query("UPDATE ai_worker_queue SET status = 'failed', error_message = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2", [workspaceId, queueId, message])
      await saveAudit(client, { workspaceId, leadId: item.leadId, userId, type: 'send_failed', title: 'Отправка не выполнена', body: message, metadata: { queueId, actionType: item.actionType, executionType } })
      await client.query('COMMIT')
    } catch (auditError) { await client.query('ROLLBACK'); throw auditError } finally { client.release() }
    return { item: await assertQueueItem(userId, workspaceId, queueId), error: message }
  }
}

async function getMetrics(userId, workspaceId) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS waiting_approval,
       COUNT(*) FILTER (WHERE status = 'approved' AND approved_at::date = CURRENT_DATE)::int AS approved_today,
       COUNT(*) FILTER (WHERE status IN ('completed','executed') AND executed_at::date = CURRENT_DATE)::int AS executed_today,
       COUNT(*) FILTER (WHERE status = 'failed' AND updated_at::date = CURRENT_DATE)::int AS failed_today,
       COUNT(*) FILTER (WHERE status IN ('completed','executed'))::int AS completed_total,
       COUNT(*) FILTER (WHERE status IN ('completed','executed','failed'))::int AS finished_total
     FROM ai_worker_queue q
     WHERE q.workspace_id = $1 AND EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = q.workspace_id AND wm.user_id = $2)`,
    [workspaceId, userId]
  )
  const row = result.rows[0] || {}
  const finished = Number(row.finished_total || 0)
  return {
    waitingApproval: Number(row.waiting_approval || 0),
    approvedToday: Number(row.approved_today || 0),
    executedToday: Number(row.executed_today || 0),
    failedToday: Number(row.failed_today || 0),
    successRate: finished ? Math.round((Number(row.completed_total || 0) / finished) * 100) : 0,
  }
}

module.exports = { approveQueueItem, executeQueueItem, getMetrics, listQueue, rejectQueueItem, updateQueueItem }
