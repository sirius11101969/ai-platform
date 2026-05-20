const pool = require('../../db/pool')
async function addMemory({ workspaceId, memoryKey, memoryValue, client = pool }) { return client.query('INSERT INTO ai_company_simulation_memory(workspace_id, memory_key, memory_value) VALUES($1,$2,$3)', [workspaceId, memoryKey, memoryValue]) }
async function listMemory({ workspaceId, client = pool }) { const r = await client.query('SELECT * FROM ai_company_simulation_memory WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100', [workspaceId]); return r.rows }
module.exports = { addMemory, listMemory }
