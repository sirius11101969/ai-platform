const pool = require('../../db/pool')
const { generateOkrs } = require('./aiOkrPlanningEngine')
const { prioritizeInitiatives } = require('./initiativePrioritizationEngine')
const { generateQuarterlyPlan } = require('./quarterlyPlanningEngine')
const { buildDependencyGraph } = require('./dependencyGraphEngine')
const { allocateResources } = require('./resourceAllocationEngine')
const { generateRoadmap } = require('./strategicRoadmapEngine')
const { buildOrganizationalAlignment } = require('./organizationalAlignmentEngine')
const { generateGrowthPlan } = require('./growthPlanningEngine')
const { storeStrategicMemory, listStrategicMemory } = require('./strategicMemoryEngine')

async function loadSignals(workspaceId, client){ const r = await client.query(`SELECT COUNT(*)::int AS lead_count FROM crm_leads WHERE workspace_id = $1`, [workspaceId]).catch(()=>({rows:[{lead_count:12}]})); return { leadQuality:Number(r.rows[0].lead_count||12), executionReadiness:0.7 } }

async function runStrategicPlanning({ workspaceId, client = pool }) {
  const signals = await loadSignals(workspaceId, client)
  const okrPlan = generateOkrs({ signals })
  const initiatives = prioritizeInitiatives({ okrPlan })
  const quarterlyPlan = generateQuarterlyPlan({ initiatives })
  const dependencyGraph = buildDependencyGraph({ initiatives })
  const resourceAllocation = allocateResources({ initiatives })
  const roadmap = generateRoadmap({ quarterlyPlan })
  const organizationalAlignment = buildOrganizationalAlignment({ initiatives })
  const growthPlan = generateGrowthPlan({ signals })

  const strategicPlan = { okrPlan, initiatives, quarterlyPlan, dependencyGraph, resourceAllocation, roadmap, organizationalAlignment, growthPlan }
  const insertPlan = await client.query(`INSERT INTO ai_strategic_plans(workspace_id,plan_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true) RETURNING *`, [workspaceId, strategicPlan])
  await client.query(`INSERT INTO ai_okr_plans(workspace_id,plan_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true)`, [workspaceId, okrPlan])
  await client.query(`INSERT INTO ai_strategic_initiatives(workspace_id,initiatives_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true)`, [workspaceId, initiatives])
  await client.query(`INSERT INTO ai_dependency_graphs(workspace_id,graph_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true)`, [workspaceId, dependencyGraph])
  await client.query(`INSERT INTO ai_resource_allocations(workspace_id,allocation_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true)`, [workspaceId, resourceAllocation])
  await client.query(`INSERT INTO ai_quarterly_plans(workspace_id,quarterly_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true)`, [workspaceId, quarterlyPlan])
  await client.query(`INSERT INTO ai_growth_plans(workspace_id,growth_payload,planning_only,no_autonomous_execution,no_customer_contact,no_pricing_changes,requires_human_approval) VALUES($1,$2,true,true,true,true,true)`, [workspaceId, growthPlan])
  await storeStrategicMemory({ workspaceId, key: 'latest_strategic_plan', value: strategicPlan, client })
  return { strategicPlan: insertPlan.rows[0], events:['strategic_planning_started','okr_plan_generated','initiative_prioritized','dependency_graph_generated','resource_allocation_generated','growth_plan_generated','strategic_planning_completed'] }
}
async function listPlans({ workspaceId, client=pool }) { const r=await client.query(`SELECT * FROM ai_strategic_plans WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 50`,[workspaceId]); return r.rows }
const queryLatest = (table,col) => async ({ workspaceId, client=pool }) => { const r=await client.query(`SELECT * FROM ${table} WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`,[workspaceId]); return r.rows[0]||null }
module.exports = { runStrategicPlanning, listPlans, getLatestOkrs: queryLatest('ai_okr_plans','plan_payload'), getLatestInitiatives: queryLatest('ai_strategic_initiatives','initiatives_payload'), getLatestDependencyGraph: queryLatest('ai_dependency_graphs','graph_payload'), getLatestResourceAllocation: queryLatest('ai_resource_allocations','allocation_payload'), listStrategicMemory }
