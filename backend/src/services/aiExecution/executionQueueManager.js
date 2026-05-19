const pool = require('../../db/pool')

async function listQueue(workspaceId) {
  const { rows } = await pool.query('SELECT * FROM ai_execution_queue WHERE workspace_id=$1 ORDER BY created_at DESC', [workspaceId])
  return rows
}

module.exports = { listQueue }
