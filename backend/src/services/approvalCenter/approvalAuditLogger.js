async function logAudit(client, payload) {
  const result = await client.query(`INSERT INTO ai_approval_audit_log(workspace_id, queue_id, actor_user_id, action, reason, previous_status, new_status, metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [payload.workspaceId, payload.queueId, payload.actorUserId, payload.action, payload.reason || '', payload.previousStatus, payload.newStatus, payload.metadata || {}])
  return result.rows[0]
}
module.exports = { logAudit }
