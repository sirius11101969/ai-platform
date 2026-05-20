const pool = require('../../db/pool')

async function storeStrategicMemory({ workspaceId, key, value, client = pool }) { await client.query(`INSERT INTO ai_strategic_memory(workspace_id,memory_key,memory_value,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,$3,true,true,true,true,true)`, [workspaceId,key,value]) }
async function listStrategicMemory({ workspaceId, client = pool }) { const r=await client.query(`SELECT * FROM ai_strategic_memory WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 50`,[workspaceId]); return r.rows }
module.exports = { storeStrategicMemory, listStrategicMemory }
