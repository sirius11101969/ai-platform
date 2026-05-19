const assert = require('assert')
const path = require('path')

const { validatePolicy } = require('../src/services/aiExecution/executionPolicyEngine')
const { assertApprovedApproval } = require('../src/services/aiExecution/executionApprovalValidator')

function installEngine(state) {
  const servicePath = path.resolve(__dirname, '../src/services/aiExecution/aiExecutionEngine.js')
  const poolPath = path.resolve(__dirname, '../src/db/pool.js')
  delete require.cache[servicePath]
  delete require.cache[poolPath]
  require.cache[poolPath] = { id: poolPath, filename: poolPath, loaded: true, exports: { query: async (sql) => {
    if (sql.startsWith('SELECT * FROM ai_execution_queue')) return { rows: [state.item] }
    if (sql.startsWith('UPDATE ai_execution_queue')) { state.updated = true; return { rows: [] } }
    if (sql.startsWith('INSERT INTO ai_execution_runs')) return { rows: [{ id: 'run1' }] }
    if (sql.startsWith('UPDATE ai_execution_runs')) return { rows: [] }
    if (sql.startsWith('INSERT INTO ai_execution_audit_log')) { state.audits += 1; return { rows: [] } }
    throw new Error('Unexpected query ' + sql)
  } } }
  return require(servicePath)
}

async function main() {
  assert.strictEqual(validatePolicy({ workspaceId: 'w1', approval: { workspaceId: 'w1', status: 'approved' } }).allowed, true)
  assert.throws(() => assertApprovedApproval({ approvalStatus: 'pending' }))
  const denied = installEngine({ item: { id: 'e1', workspace_id: 'w1', approval_status: 'pending', payload: {}, execution_type: 'crm_task_creation' }, audits: 0 })
  await assert.rejects(() => denied.executeQueueItem({ workspaceId: 'w1', executionId: 'e1', actorUserId: 'u1' }))
  const okState = { item: { id: 'e1', workspace_id: 'w1', approval_status: 'approved', payload: {}, execution_type: 'crm_task_creation', approval_id: 'a1' }, audits: 0 }
  const ok = installEngine(okState)
  const res = await ok.executeQueueItem({ workspaceId: 'w1', executionId: 'e1', actorUserId: 'u1' })
  assert.strictEqual(res.status, 'completed')
  assert.strictEqual(res.run.id, 'run1')
  console.log('aiExecutionLayer tests passed')
}
main().catch((e) => { console.error(e); process.exit(1) })
