const pool = require('../../db/pool')

function safeJson(value) {
  return JSON.stringify(value ?? {})
}

async function writeExecutionLog(log, client = pool) {
  const level = log.level || 'info'
  const message = String(log.message || log.event || '').trim()
  if (!message) return null
  const result = await client.query(
    `INSERT INTO execution_logs(
       workspace_id, user_id, task_id, job_id, workflow_id, agent_id,
       level, event, message, metadata, trace_id, span_id
     ) VALUES($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,$7::text,$8::text,$9::text,$10::jsonb,$11::text,$12::text)
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
      safeJson(log.metadata),
      log.traceId || null,
      log.spanId || null,
    ]
  )
  return result.rows[0]
}

module.exports = { safeJson, writeExecutionLog }
