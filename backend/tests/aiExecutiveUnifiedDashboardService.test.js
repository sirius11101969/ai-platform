const assert = require('assert')
const { getOverview } = require('../src/services/aiExecutiveUnifiedDashboardService')

function createClient({ missingTables = [], strategicPlanColumn = 'plan_payload', workforcePlanColumn = 'plan_payload' } = {}) {
  return {
    async query(sql) {
      const missing = missingTables.find((table) => sql.includes(table))
      if (missing) {
        const error = new Error(`relation "${missing}" does not exist`)
        error.code = '42P01'
        throw error
      }
      if (sql.includes('information_schema.columns') && sql.includes('ai_strategic_plans')) return { rows: strategicPlanColumn ? [{ column_name: strategicPlanColumn }] : [], rowCount: strategicPlanColumn ? 1 : 0 }
      if (sql.includes('information_schema.columns') && sql.includes('ai_workforce_execution_plans')) return { rows: workforcePlanColumn ? [{ column_name: workforcePlanColumn }] : [], rowCount: workforcePlanColumn ? 1 : 0 }
      if (sql.includes('ai_organizational_health')) return { rows: [{ health_score: 88 }], rowCount: 1 }
      if (sql.includes('ai_revenue_engine_snapshots')) return { rows: [{ snapshot_payload: { forecast: { projectedRevenueExpansion: 1000 } } }], rowCount: 1 }
      if (sql.includes('ai_strategic_initiatives')) return { rows: [{ c: 3 }], rowCount: 1 }
      if (sql.includes('ai_executive_escalations')) return { rows: [{ c: 1 }], rowCount: 1 }
      if (sql.includes('ai_strategic_drift_events')) return { rows: [{ drift_payload: { driftLevel: 'medium' } }], rowCount: 1 }
      if (sql.includes('ai_department_synchronization')) return { rows: [{ sync_payload: { utilization: 72 } }], rowCount: 1 }
      if (sql.includes('ai_approval_queue')) return { rows: [{ c: 2 }], rowCount: 1 }
      if (sql.includes('ai_company_simulation_risks')) return { rows: [{ severity: 'low', risk_type: 'test' }], rowCount: 1 }
      if (sql.includes('ai_executive_risk_events')) return { rows: [{ severity: 'low' }], rowCount: 1 }
      if (sql.includes('ai_strategic_plans')) return { rows: [{ [strategicPlanColumn]: { horizon: 'q4' } }], rowCount: 1 }
      if (sql.includes('ai_organizational_memory')) return { rows: [{ memory_payload: { insights: [] } }], rowCount: 1 }
      if (sql.includes('ai_enterprise_coordination_runs')) return { rows: [{ coordination_payload: { status: 'active' } }], rowCount: 1 }
      if (sql.includes('ai_workforce_execution_plans')) return { rows: workforcePlanColumn ? [{ [workforcePlanColumn]: { utilization: 75 } }] : [], rowCount: workforcePlanColumn ? 1 : 0 }
      if (sql.includes('ai_workforce_assignments')) return { rows: [{ c: 5 }], rowCount: 1 }
      if (sql.includes('ai_workforce_realtime_metrics')) return { rows: [{ metrics_payload: { utilization: 70 } }], rowCount: 1 }
      throw new Error(`Unhandled SQL: ${sql}`)
    }
  }
}

async function testMissingCoordinationTable() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ missingTables: ['ai_enterprise_coordination_runs'] }) })
  assert.strictEqual(overview.coordination.status, 'not_initialized')
  assert.ok(overview.unavailableModules.includes('coordination'))
}

async function testMissingSimulationTable() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ missingTables: ['ai_company_simulation_risks'] }) })
  assert.strictEqual(overview.simulation.status, 'not_initialized')
  assert.ok(overview.unavailableModules.includes('simulation'))
}

async function testOverviewStillReturnsAndExistingModulesRender() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ missingTables: ['ai_company_simulation_risks'] }) })
  assert.ok(overview.executiveSummary.generatedAt)
  assert.strictEqual(overview.workforce.assignments, 5)
  assert.strictEqual(overview.strategy.activeStrategicInitiatives, 3)
}

async function testStrategySchemaFallbackWhenPlanPayloadMissing() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ strategicPlanColumn: null }) })
  assert.strictEqual(overview.strategy.status, 'schema_unavailable')
  assert.strictEqual(overview.strategy.latestPlan, null)
  assert.strictEqual(overview.strategy.sourceColumn, null)
}

async function testStrategySupportsPlanColumnName() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ strategicPlanColumn: 'plan' }) })
  assert.strictEqual(overview.strategy.status, 'ready')
  assert.strictEqual(overview.strategy.sourceColumn, 'plan')
  assert.deepStrictEqual(overview.strategy.latestPlan, { horizon: 'q4' })
}

async function testStrategySupportsAlternateColumnNames() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ strategicPlanColumn: 'payload' }) })
  assert.strictEqual(overview.strategy.status, 'ready')
  assert.strictEqual(overview.strategy.sourceColumn, 'payload')
  assert.deepStrictEqual(overview.strategy.latestPlan, { horizon: 'q4' })
}

async function testWorkforcePlanSupportsAlternateColumnName() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ workforcePlanColumn: 'payload' }) })
  assert.deepStrictEqual(overview.workforce.executionPlan, { utilization: 75 })
}

async function testNoValidColumnsStillReturnsOverview200Shape() {
  const overview = await getOverview({ workspaceId: 'w1', client: createClient({ strategicPlanColumn: null, workforcePlanColumn: null }) })
  assert.strictEqual(overview.strategy.status, 'schema_unavailable')
  assert.ok(overview.executiveSummary.generatedAt)
}

async function main() {
  await testMissingCoordinationTable()
  await testMissingSimulationTable()
  await testOverviewStillReturnsAndExistingModulesRender()
  await testStrategySchemaFallbackWhenPlanPayloadMissing()
  await testStrategySupportsPlanColumnName()
  await testStrategySupportsAlternateColumnNames()
  await testWorkforcePlanSupportsAlternateColumnName()
  await testNoValidColumnsStillReturnsOverview200Shape()
  console.log('aiExecutiveUnifiedDashboardService tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
