const pool = require('../db/pool')
const crmModel = require('../models/crmModel')
const emailService = require('./emailService')
const { sendTelegramMessageToLead } = require('./telegramService')
const { sendLeadAttachments } = require('./attachmentService')
const { addTimelineEvent } = require('./timelineService')

const ACTION_TYPES = ['telegram_follow_up', 'email_follow_up', 'commercial_offer', 'send_presentation', 'send_screenshots', 'send_demo_link', 'move_lead_stage', 'create_reminder']
const STATUSES = ['draft', 'pending_approval', 'approved', 'sent', 'failed', 'cancelled']

function normalize(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    userId: row.user_id,
    actionType: row.action_type,
    channel: row.channel,
    status: row.status,
    title: row.title,
    generatedText: row.generated_text || '',
    payload: row.payload || {},
    approvedByUser: row.approved_by_user,
    approvedAt: row.approved_at,
    sentAt: row.sent_at,
    error: row.error || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function assertLead(userId, workspaceId, leadId) {
  const lead = await crmModel.findLead(userId, workspaceId, leadId)
  if (!lead) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  return lead
}

async function createAction({ userId, workspaceId, leadId, actionType, channel, title, generatedText = '', payload = {}, status = 'pending_approval' }, client = pool) {
  if (!ACTION_TYPES.includes(actionType)) throw Object.assign(new Error('Invalid AI action type'), { statusCode: 400 })
  const result = await client.query(
    `INSERT INTO ai_action_queue(workspace_id, lead_id, user_id, action_type, channel, status, title, generated_text, payload)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [workspaceId, leadId, userId, actionType, channel || 'crm', status, title, generatedText, payload]
  )
  await addTimelineEvent(client, { workspaceId, leadId, userId, eventType: 'ai_action_created', title: 'AI действие ожидает решения', body: generatedText || title, source: 'ai', metadata: { actionType, channel, status } })
  return normalize(result.rows[0])
}

async function listLeadActions(userId, workspaceId, leadId) {
  await assertLead(userId, workspaceId, leadId)
  const result = await pool.query('SELECT * FROM ai_action_queue WHERE workspace_id = $1 AND lead_id = $2 ORDER BY created_at DESC LIMIT 100', [workspaceId, leadId])
  return result.rows.map(normalize)
}

async function listWorkspaceSummary(userId, workspaceId) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'pending_approval')::int AS pending_approval,
       COUNT(*) FILTER (WHERE status = 'sent' AND sent_at::date = CURRENT_DATE)::int AS sent_today,
       COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
       COUNT(*) FILTER (WHERE action_type IN ('telegram_follow_up','email_follow_up') AND status IN ('draft','pending_approval','approved'))::int AS followups_waiting,
       COUNT(*) FILTER (WHERE status = 'sent')::int AS sent_total,
       COUNT(*) FILTER (WHERE status IN ('sent','failed'))::int AS finished_total
     FROM ai_action_queue aq
     WHERE aq.workspace_id = $1 AND EXISTS (SELECT 1 FROM crm_leads l WHERE l.id = aq.lead_id AND l.user_id = $2)`,
    [workspaceId, userId]
  )
  const row = result.rows[0] || {}
  const finished = Number(row.finished_total || 0)
  return {
    pendingApproval: Number(row.pending_approval || 0),
    sentToday: Number(row.sent_today || 0),
    failed: Number(row.failed || 0),
    followUpsWaiting: Number(row.followups_waiting || 0),
    successRate: finished ? Math.round((Number(row.sent_total || 0) / finished) * 100) : 0,
  }
}

async function updateAction(userId, workspaceId, actionId, payload) {
  const current = await getActionForUser(userId, workspaceId, actionId)
  const updates = []
  const values = [workspaceId, actionId]
  function set(column, value) { values.push(value); updates.push(`${column} = $${values.length}`) }
  if (payload.generatedText !== undefined) set('generated_text', String(payload.generatedText || ''))
  if (payload.title !== undefined) set('title', String(payload.title || current.title))
  if (payload.payload !== undefined) set('payload', payload.payload || {})
  if (!updates.length) return current
  updates.push('updated_at = NOW()')
  const result = await pool.query(`UPDATE ai_action_queue SET ${updates.join(', ')} WHERE workspace_id = $1 AND id = $2 RETURNING *`, values)
  return normalize(result.rows[0])
}

async function getActionForUser(userId, workspaceId, actionId) {
  const result = await pool.query(
    `SELECT aq.* FROM ai_action_queue aq JOIN crm_leads l ON l.id = aq.lead_id AND l.workspace_id = aq.workspace_id WHERE aq.id = $1 AND aq.workspace_id = $2 AND l.user_id = $3`,
    [actionId, workspaceId, userId]
  )
  if (!result.rows[0]) throw Object.assign(new Error('AI action not found'), { statusCode: 404 })
  return normalize(result.rows[0])
}

async function transitionAction(userId, workspaceId, actionId, nextStatus) {
  if (!STATUSES.includes(nextStatus)) throw Object.assign(new Error('Invalid AI action status'), { statusCode: 400 })
  const action = await getActionForUser(userId, workspaceId, actionId)
  const result = await pool.query(
    `UPDATE ai_action_queue SET status = $3, approved_by_user = CASE WHEN $3 = 'approved' THEN $4 ELSE approved_by_user END, approved_at = CASE WHEN $3 = 'approved' THEN NOW() ELSE approved_at END, updated_at = NOW()
      WHERE workspace_id = $1 AND id = $2 RETURNING *`,
    [workspaceId, actionId, nextStatus, userId]
  )
  await addTimelineEvent(pool, { workspaceId, leadId: action.leadId, userId, eventType: `ai_action_${nextStatus}`, title: nextStatus === 'approved' ? 'AI действие одобрено' : nextStatus === 'cancelled' ? 'AI действие отклонено' : 'Статус AI действия изменён', body: action.generatedText || action.title, source: 'ai', metadata: { actionId, nextStatus } })
  return normalize(result.rows[0])
}

async function sendAction(userId, workspaceId, actionId) {
  const action = await getActionForUser(userId, workspaceId, actionId)
  if (action.status !== 'approved') throw Object.assign(new Error('AI action must be approved before sending'), { statusCode: 400 })
  try {
    let result = null
    if (action.actionType === 'move_lead_stage') {
      result = await crmModel.updateLead(userId, workspaceId, action.leadId, { status: action.payload.status })
    } else if (action.actionType === 'create_reminder') {
      result = await crmModel.createNote(userId, workspaceId, action.leadId, action.generatedText || 'AI reminder')
    } else if (action.actionType === 'send_presentation' || action.actionType === 'send_screenshots') {
      const materialKeys = action.actionType === 'send_presentation' ? ['presentation'] : ['screenshot_1', 'screenshot_2']
      result = await sendLeadAttachments({ userId, workspaceId, leadId: action.leadId, channel: action.channel === 'telegram' ? 'telegram' : 'email', materialKeys, email: action.payload.email || {} })
    } else if (action.channel === 'telegram') {
      result = await sendTelegramMessageToLead({ userId, workspaceId, leadId: action.leadId, text: action.generatedText })
    } else if (action.channel === 'email') {
      result = await emailService.sendEmailNow(userId, { workspaceId, leadId: action.leadId, subject: action.payload.subject || action.title, text: action.generatedText, html: action.payload.html || '', to: action.payload.to })
    } else if (action.actionType === 'send_demo_link') {
      result = await crmModel.createNote(userId, workspaceId, action.leadId, action.generatedText || 'Demo link: https://www.as6.ru')
    } else {
      throw Object.assign(new Error('Unsupported AI action channel'), { statusCode: 400 })
    }
    const updated = await pool.query("UPDATE ai_action_queue SET status = 'sent', sent_at = NOW(), error = NULL, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, actionId])
    await addTimelineEvent(pool, { workspaceId, leadId: action.leadId, userId, eventType: 'ai_action_sent', title: 'AI действие отправлено', body: action.generatedText || action.title, source: action.channel, metadata: { actionId, actionType: action.actionType } })
    return { action: normalize(updated.rows[0]), result }
  } catch (error) {
    const updated = await pool.query("UPDATE ai_action_queue SET status = 'failed', error = $3, updated_at = NOW() WHERE workspace_id = $1 AND id = $2 RETURNING *", [workspaceId, actionId, error.message])
    await addTimelineEvent(pool, { workspaceId, leadId: action.leadId, userId, eventType: 'ai_action_failed', title: 'AI действие не отправлено', body: error.message, source: action.channel, metadata: { actionId, actionType: action.actionType } })
    return { action: normalize(updated.rows[0]), error: error.message }
  }
}

module.exports = { createAction, listLeadActions, listWorkspaceSummary, sendAction, transitionAction, updateAction }
