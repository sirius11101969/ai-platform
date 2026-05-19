const pool = require('../../db/pool')

async function logAudit(entry) {
  await pool.query(`INSERT INTO ai_execution_audit_log (workspace_id, execution_id, run_id, actor_user_id, approval_id, event_type, policy_result, payload, failure_reason)
    VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9)`, [entry.workspaceId, entry.executionId, entry.runId || null, entry.actorUserId || null, entry.approvalId || null, entry.eventType, JSON.stringify(entry.policyResult || {}), JSON.stringify(entry.payload || {}), entry.failureReason || null])
}

module.exports = { logAudit }
