const pool=require('../../db/pool')
async function store({workspaceId,key,value,client=pool}){await client.query(`INSERT INTO ai_enterprise_coordination_memory(workspace_id,memory_key,memory_value,coordination_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,$3,true,true,true,true,true)`,[workspaceId,key,value])}
async function list({workspaceId,client=pool}){return (await client.query(`SELECT * FROM ai_enterprise_coordination_memory WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 30`,[workspaceId])).rows}
module.exports={store,list}
