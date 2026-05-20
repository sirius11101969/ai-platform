async function saveOptimizationMemory(client, workspaceId, analysis) {
  await client.query(
    `INSERT INTO ai_revenue_optimization_memory(workspace_id, memory_type, payload)
     VALUES($1::uuid, 'analysis', $2::jsonb)`,
    [workspaceId, JSON.stringify(analysis)]
  )
}
module.exports = { saveOptimizationMemory }
