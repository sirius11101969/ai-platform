const assert = require('assert')
const { runEnterpriseCoordination, governance } = require('../src/services/aiEnterpriseCoordination/enterpriseCoordinationEngine')

async function run() {
  const queries = []
  const client = { query: async (sql) => { queries.push(sql); return { rows: [{ id: 1, coordination_payload: {} }] } } }
  const out = await runEnterpriseCoordination({ workspaceId: 7, client })
  assert.ok(out.events.includes('enterprise_coordination_completed'), 'enterprise coordination run')
  assert.ok(out.dependencies.length > 0, 'dependency resolution')
  assert.ok(out.conflicts.length > 0, 'conflict detection')
  assert.ok(out.escalations.length > 0, 'escalation generation')
  assert.strictEqual(governance.requires_human_approval, true, 'governance enforcement')
  assert.strictEqual(governance.no_autonomous_execution, true, 'no execution side effects')
  assert.ok(!queries.join(' ').match(/UPDATE crm_leads|INSERT INTO ai_execution_queue/), 'no execution side effects')
  console.log('ai enterprise coordination tests passed')
}

run().catch((error) => { console.error(error); process.exit(1) })
