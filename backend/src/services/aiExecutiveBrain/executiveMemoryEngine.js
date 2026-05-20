const pool = require('../../db/pool')
async function storeMemory({ workspaceId, key, value, client = pool }) { const r = await client.query(`INSERT INTO ai_executive_memory(workspace_id, memory_key, memory_payload) VALUES ($1,$2,$3) RETURNING *`, [workspaceId, key, value || {}]); return r.rows[0] }
async function listMemory({ workspaceId, limit = 25, client = pool }) { const r = await client.query(`SELECT * FROM ai_executive_memory WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT $2`, [workspaceId, limit]); return r.rows }
module.exports = { storeMemory, listMemory }
