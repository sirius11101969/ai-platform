const pool = require('../../db/pool')

async function persistConversationSignal({ sessionId, workspaceId, signalType, payload }) {
  const q = `INSERT INTO ai_conversation_memory(session_id,workspace_id,signal_type,payload)
             VALUES($1::uuid,$2::uuid,$3::text,$4::jsonb) RETURNING *`
  const r = await pool.query(q, [sessionId, workspaceId, signalType, JSON.stringify(payload || {})])
  return r.rows[0]
}

module.exports = { persistConversationSignal }
