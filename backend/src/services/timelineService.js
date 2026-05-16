const pool = require('../db/pool')

function normalizeEvent(row) {
  if (!row) return null
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    userId: row.user_id,
    type: row.event_type || row.type,
    title: row.title,
    body: row.body || '',
    source: row.source || 'crm',
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }
}

async function addTimelineEvent(client, { workspaceId, leadId, userId = null, eventType, title, body = null, source = 'crm', metadata = {}, createdAt = null }) {
  const executor = client || pool
  const result = await executor.query(
    `INSERT INTO lead_timeline_events(workspace_id, lead_id, user_id, event_type, title, body, source, metadata, created_at)
     VALUES($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9::timestamptz, NOW()))
     RETURNING *`,
    [workspaceId, leadId, userId, eventType, title, body, source, metadata, createdAt]
  )
  return normalizeEvent(result.rows[0])
}

async function listLeadTimeline(userId, workspaceId, leadId) {
  const lead = await pool.query('SELECT id FROM crm_leads WHERE id = $1 AND user_id = $2 AND workspace_id = $3', [leadId, userId, workspaceId])
  if (!lead.rows[0]) throw Object.assign(new Error('Lead not found'), { statusCode: 404 })
  const result = await pool.query(
    `SELECT * FROM (
       SELECT id::text, workspace_id, lead_id, user_id, event_type, title, body, source, metadata, created_at FROM lead_timeline_events WHERE workspace_id = $1 AND lead_id = $2
       UNION ALL
       SELECT id::text, workspace_id, lead_id, user_id, type AS event_type, title, body, 'crm' AS source, metadata, created_at FROM crm_activity WHERE workspace_id = $1 AND lead_id = $2
       UNION ALL
       SELECT id::text, workspace_id, lead_id, user_id, CASE WHEN role = 'user' THEN 'telegram_inbound' ELSE 'telegram_outbound_ai' END AS event_type, CASE WHEN role = 'user' THEN 'Telegram inbound' ELSE 'Telegram outbound AI' END AS title, message AS body, 'telegram' AS source, jsonb_build_object('role', role, 'telegramMessageId', telegram_message_id) AS metadata, created_at FROM telegram_messages WHERE workspace_id = $1 AND lead_id = $2
       UNION ALL
       SELECT id::text, workspace_id, lead_id, user_id, CASE WHEN status = 'failed' THEN 'email_failed' ELSE 'email_sent' END AS event_type, CASE WHEN status = 'failed' THEN 'Email failed' ELSE 'Email sent' END AS title, COALESCE(error, subject) AS body, 'email' AS source, jsonb_build_object('status', status, 'to', to_email, 'subject', subject) AS metadata, COALESCE(sent_at, updated_at, created_at) AS created_at FROM email_messages WHERE workspace_id = $1 AND lead_id = $2 AND status IN ('sent','failed')
       UNION ALL
       SELECT id::text, workspace_id, lead_id, NULL::uuid AS user_id, 'ai_score_updated' AS event_type, 'AI score update' AS title, (score::text || '/100 · вероятность ' || deal_probability::text || '%') AS body, 'ai' AS source, jsonb_build_object('score', score, 'dealProbability', deal_probability, 'urgencyLevel', urgency_level, 'riskLevel', risk_level) AS metadata, generated_at AS created_at FROM lead_ai_scores WHERE workspace_id = $1 AND lead_id = $2
       UNION ALL
       SELECT id::text, workspace_id, lead_id, approved_by_user AS user_id, CASE WHEN sent_at IS NULL THEN 'follow_up_draft' ELSE 'sent_follow_up' END AS event_type, CASE WHEN sent_at IS NULL THEN 'Follow-up draft' ELSE 'Sent follow-up' END AS title, generated_message AS body, 'ai' AS source, jsonb_build_object('status', status, 'followupType', followup_type, 'scheduledFor', scheduled_for) AS metadata, COALESCE(sent_at, recommended_at) AS created_at FROM ai_followup_sequences WHERE workspace_id = $1 AND lead_id = $2
       UNION ALL
       SELECT id::text, workspace_id, lead_id, NULL::uuid AS user_id, 'follow_up_' || status AS event_type, 'AI follow-up ' || status AS title, COALESCE(error, generated_message) AS body, suggested_channel AS source, jsonb_build_object('status', status, 'ruleType', rule_type, 'reason', reason, 'urgency', urgency, 'scheduledFor', scheduled_for) AS metadata, COALESCE(sent_at, approved_at, updated_at, created_at) AS created_at FROM ai_followup_jobs WHERE workspace_id = $1 AND lead_id = $2
       UNION ALL
       SELECT id::text, workspace_id, lead_id, user_id, CASE WHEN status = 'sent' THEN 'attachments_sent' ELSE 'attachment_' || status END AS event_type, CASE WHEN status = 'sent' THEN 'Attachments sent' ELSE 'Attachment event' END AS title, file_name AS body, 'attachment' AS source, metadata, COALESCE(sent_at, created_at) AS created_at FROM lead_attachments WHERE workspace_id = $1 AND lead_id = $2
     ) events ORDER BY created_at DESC LIMIT 200`,
    [workspaceId, leadId]
  )
  return result.rows.map(normalizeEvent)
}

module.exports = { addTimelineEvent, listLeadTimeline }
