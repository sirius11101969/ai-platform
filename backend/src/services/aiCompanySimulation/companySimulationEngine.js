const pool = require('../../db/pool')
const { simulateGrowthScenario } = require('./growthScenarioSimulator')
const { simulateWorkforceLoad } = require('./workforceLoadSimulator')
const { simulateRevenueExpansion } = require('./revenueExpansionSimulator')
const { simulateBottlenecks } = require('./bottleneckForecastSimulator')
const { simulateDepartmentStress } = require('./departmentStressSimulator')
const { simulateChurnRisk } = require('./churnRiskSimulator')
const { simulatePipelineCollapse } = require('./pipelineCollapseSimulator')
const { simulateStrategicWhatIf } = require('./strategicWhatIfSimulator')
const { addMemory, listMemory } = require('./simulationMemoryEngine')
const governance = { simulation_only: true, no_autonomous_execution: true, no_customer_contact: true, no_pricing_changes: true, requires_human_review: true }
async function runSimulation({ workspaceId, payload = {}, client = pool }) {
  const run = await client.query('INSERT INTO ai_company_simulation_runs(workspace_id, run_payload, simulation_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_review) VALUES($1,$2,true,true,true,true,true) RETURNING *', [workspaceId, payload])
  console.info('company_simulation_run_started', { workspaceId, runId: run.rows[0].id })
  const base = payload.baseline || {}
  const scenarios = [simulateGrowthScenario(base), simulateRevenueExpansion(base), simulateWorkforceLoad(base), simulateBottlenecks(base), simulateDepartmentStress(base), simulatePipelineCollapse(base), simulateChurnRisk(base), simulateStrategicWhatIf({ assumptions: payload.assumptions || {} })]
  const events = ['growth_scenario_simulated','revenue_expansion_simulated','workforce_load_simulated','bottleneck_forecast_generated','pipeline_collapse_risk_detected']
  for (const s of scenarios) await client.query('INSERT INTO ai_company_simulation_scenarios(workspace_id, run_id, scenario_type, scenario_payload, simulation_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_review) VALUES($1,$2,$3,$4,true,true,true,true,true)', [workspaceId, run.rows[0].id, s.scenarioType, { ...s, governance }])
  const result = { projectedRevenueDelta: scenarios.reduce((a, s) => a + Number(s.projectedImpact || 0), 0), governance }
  await client.query('INSERT INTO ai_company_simulation_results(workspace_id, run_id, result_payload, simulation_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_review) VALUES($1,$2,$3,true,true,true,true,true)', [workspaceId, run.rows[0].id, result])
  for (const s of scenarios.filter((x) => x.riskLevel === 'high')) await client.query('INSERT INTO ai_company_simulation_risks(workspace_id, run_id, risk_type, severity, risk_payload, simulation_only, no_autonomous_execution, no_customer_contact, no_pricing_changes, requires_human_review) VALUES($1,$2,$3,$4,$5,true,true,true,true,true)', [workspaceId, run.rows[0].id, s.scenarioType, s.riskLevel, s])
  await addMemory({ workspaceId, memoryKey: 'latest_company_simulation', memoryValue: result, client })
  console.info('company_simulation_run_completed', { workspaceId, runId: run.rows[0].id })
  return { run: run.rows[0], scenarios, result, events, governance }
}
async function listRuns({ workspaceId, client = pool }) { return (await client.query('SELECT * FROM ai_company_simulation_runs WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 50', [workspaceId])).rows }
async function listScenarios({ workspaceId, client = pool }) { return (await client.query('SELECT * FROM ai_company_simulation_scenarios WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 200', [workspaceId])).rows }
async function listResults({ workspaceId, client = pool }) { return (await client.query('SELECT * FROM ai_company_simulation_results WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100', [workspaceId])).rows }
async function listRisks({ workspaceId, client = pool }) { return (await client.query('SELECT * FROM ai_company_simulation_risks WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100', [workspaceId])).rows }
module.exports = { runSimulation, listRuns, listScenarios, listResults, listRisks, listMemory }
