const pool = require('../../db/pool')
const { validatePolicy } = require('./executionPolicyEngine')
const { assertApprovedApproval } = require('./executionApprovalValidator')
const { logAudit } = require('./executionAuditLogger')
const { routeExecution } = require('./executionWorkerOrchestrator')

async function executeQueueItem({ workspaceId, executionId, actorUserId }) {
  const { rows } = await pool.query('SELECT * FROM ai_execution_queue WHERE id=$1 AND workspace_id=$2', [executionId, workspaceId])
  const item = rows[0]
  if (!item) throw Object.assign(new Error('Execution item not found'), { statusCode: 404 })
  assertApprovedApproval({ approvalStatus: item.approval_status })
  const policy = validatePolicy({ workspaceId, approval: { workspaceId: item.workspace_id, status: item.approval_status, expiresAt: item.approval_expires_at, revokedAt: item.approval_revoked_at } })
  if (!policy.allowed) {
    await pool.query('UPDATE ai_execution_queue SET status=$2, updated_at=NOW() WHERE id=$1', [executionId, 'denied'])
    await logAudit({ workspaceId, executionId, actorUserId, approvalId: item.approval_id, eventType: 'ai_execution_denied', policyResult: policy, payload: item.payload, failureReason: policy.reasons.join(',') })
    return { status: 'denied', policy }
  }
  const run = await pool.query(`INSERT INTO ai_execution_runs (workspace_id, execution_id, approval_id, started_by, status, execution_payload, worker_route)
    VALUES ($1,$2,$3,$4,'executing',$5::jsonb,$6::jsonb) RETURNING *`, [workspaceId, executionId, item.approval_id, actorUserId, JSON.stringify(item.payload || {}), JSON.stringify(routeExecution({ executionType: item.execution_type, payload: item.payload }))])
  await pool.query('UPDATE ai_execution_queue SET status=$2, updated_at=NOW() WHERE id=$1', [executionId, 'completed'])
  await pool.query('UPDATE ai_execution_runs SET status=$2, completed_at=NOW() WHERE id=$1', [run.rows[0].id, 'completed'])
  await logAudit({ workspaceId, executionId, runId: run.rows[0].id, actorUserId, approvalId: item.approval_id, eventType: 'ai_execution_completed', policyResult: policy, payload: item.payload })
  return { status: 'completed', run: run.rows[0] }
}

module.exports = { executeQueueItem }
