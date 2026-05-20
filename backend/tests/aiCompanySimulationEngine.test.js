const test = require('node:test')
const assert = require('node:assert/strict')
const engine = require('../src/services/aiCompanySimulation/companySimulationEngine')

test('simulation run creation with governance and no side effects', async () => {
  const calls = []
  const client = { query: async (sql, params) => { calls.push({ sql, params }); if (sql.includes('INSERT INTO ai_company_simulation_runs')) return { rows: [{ id: 'run-1' }] }; return { rows: [] } } }
  const out = await engine.runSimulation({ workspaceId: 'ws-1', payload: { baseline: { baselineRevenue: 1000 } }, client })
  assert.equal(out.governance.simulation_only, true)
  assert.equal(out.governance.no_autonomous_execution, true)
  assert.ok(calls.some((x) => x.sql.includes('ai_company_simulation_scenarios')))
  assert.ok(calls.some((x) => x.sql.includes('ai_company_simulation_results')))
})
