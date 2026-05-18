const pool = require('../../db/pool')

async function writeExecutionLog(log, client = pool) {
  const level = log.level || 'info'
  const message = String(log.message || log.event || '').trim()
  if (!message) return null
  const result = await client.query(
    `INSERT INTO execution_logs(
       workspace_id, user_id, task_id, job_id, workflow_id, agent_id,
       level, event, message, metadata, trace_id, span_id
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    [
      log.workspaceId || null,
      log.userId || null,
      log.taskId || null,
      log.jobId || null,
      log.workflowId || null,
      log.agentId || null,
      level,
      log.event || null,
      message,
      log.metadata || {},
      log.traceId || null,
      log.spanId || null,
    ]
  )
  return result.rows[0]
}

module.exports = { writeExecutionLog }
