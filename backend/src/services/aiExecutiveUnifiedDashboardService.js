const pool = require('./../db/pool')

const GOVERNANCE_LABELS = [
  'Human Approval Required',
  'No Autonomous Customer Actions',
  'No Autonomous Pricing Changes',
  'Recommendation / Planning / Memory Only'
]

function isMissingRelationError(error) {
  return error?.code === '42P01' || /relation .* does not exist/i.test(error?.message || '')
}

function isMissingColumnError(error) {
  return error?.code === '42703' || /column .* does not exist/i.test(error?.message || '')
}

async function safeSelect({ client, workspaceId, tableName, candidateColumns }) {
  try {
    const columnsResult = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
      [tableName]
    )
    const existingColumns = new Set((columnsResult.rows || []).map((row) => row.column_name))
    const selectedColumn = candidateColumns.find((column) => existingColumns.has(column))
    if (!selectedColumn) {
      return { status: 'schema_unavailable', row: null, sourceColumn: null }
    }
    const result = await client.query(
      `SELECT ${selectedColumn} FROM ${tableName} WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`,
      [workspaceId]
    )
    return { status: 'ready', row: result.rows[0] || null, sourceColumn: selectedColumn }
  } catch (error) {
    if (!isMissingRelationError(error) && !isMissingColumnError(error)) throw error
    console.warn('executive_dashboard_schema_fallback', { workspaceId, tableName, candidateColumns, error: error.message })
    return { status: 'schema_unavailable', row: null, sourceColumn: null }
  }
}

const resolvedColumnCache = new Map()

async function resolveColumn(client, tableName, candidateColumns, eventName) {
  const cacheKey = `${tableName}:${candidateColumns.join(',')}`
  if (resolvedColumnCache.has(cacheKey)) return resolvedColumnCache.get(cacheKey)

  const columnsResult = await client.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
    [tableName]
  )
  const existingColumns = new Set((columnsResult.rows || []).map((row) => row.column_name))
  const resolvedColumn = candidateColumns.find((column) => existingColumns.has(column)) || null

  console.info(eventName, { tableName, resolvedColumn, candidateColumns })
  if (!resolvedColumn) {
    console.warn('executive_dashboard_schema_fallback', { tableName, candidateColumns })
  }

  resolvedColumnCache.set(cacheKey, resolvedColumn)
  return resolvedColumn
}

async function resolveMetricColumn(client, tableName, candidateColumns) {
  return resolveColumn(client, tableName, candidateColumns, 'executive_dashboard_metrics_resolved')
}

async function resolveCoordinationColumn(client, tableName, candidateColumns) {
  return resolveColumn(client, tableName, candidateColumns, 'executive_dashboard_coordination_resolved')
}

async function safeQuery({ client, workspaceId, moduleName, tableName, sql, fallback }) {
  try {
    return await client.query(sql, [workspaceId])
  } catch (error) {
    if (!isMissingRelationError(error)) throw error
    console.warn('executive_dashboard_module_missing', { workspaceId, moduleName, tableName, error: error.message })
    return fallback
  }
}

async function getOverview({ workspaceId, client = pool }) {
  const fallback = { rows: [], rowCount: 0 }
  const moduleStatuses = {}
  const unavailableModules = []
  const wrap = (moduleName, tableName, sql) => safeQuery({ client, workspaceId, moduleName, tableName, sql, fallback })

  const strategyPlanColumnPromise = resolveMetricColumn(client, 'ai_strategic_plans', ['plan_payload', 'plan', 'payload', 'recommendation', 'data'])
  const workforcePlanColumnPromise = resolveMetricColumn(client, 'ai_workforce_execution_plans', ['plan_payload', 'plan', 'payload', 'recommendation', 'data'])
  const workforceRealtimeColumnPromise = resolveMetricColumn(client, 'ai_workforce_realtime_metrics', ['metrics_payload', 'metrics', 'payload', 'snapshot', 'summary', 'data'])
  const coordinationColumnPromise = resolveCoordinationColumn(client, 'ai_enterprise_coordination_runs', ['sync_payload', 'coordination_payload', 'payload', 'synchronization', 'data', 'summary', 'metadata'])
  const [health, revenue, initiatives, escalations, drift, workforce, approvals, simRisk, risks, memory, workforceAssignments, strategyPlanColumn, workforcePlanColumn, workforceRealtimeColumn, coordinationColumn] = await Promise.all([
    wrap('executiveSummary', 'ai_organizational_health', `SELECT health_score, created_at FROM ai_organizational_health WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`),
    wrap('revenue', 'ai_revenue_engine_snapshots', `SELECT snapshot_payload FROM ai_revenue_engine_snapshots WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`),
    wrap('strategy', 'ai_strategic_initiatives', `SELECT COUNT(*)::int AS c FROM ai_strategic_initiatives WHERE workspace_id=$1`),
    wrap('approvals', 'ai_executive_escalations', `SELECT COUNT(*)::int AS c FROM ai_executive_escalations WHERE workspace_id=$1`),
    wrap('strategy', 'ai_strategic_drift_events', `SELECT drift_payload FROM ai_strategic_drift_events WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`),
    wrap('workforce', 'ai_department_synchronization', `SELECT sync_payload FROM ai_department_synchronization WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`),
    wrap('approvals', 'ai_approval_queue', `SELECT COUNT(*)::int AS c FROM ai_approval_queue WHERE workspace_id=$1 AND approval_status='pending_approval'`),
    wrap('simulation', 'ai_company_simulation_risks', `SELECT risk_type, severity, risk_payload FROM ai_company_simulation_risks WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`),
    wrap('governance', 'ai_executive_risk_events', `SELECT risk_type, severity, risk_payload FROM ai_executive_risk_events WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 20`),
    wrap('memory', 'ai_organizational_memory', `SELECT memory_payload FROM ai_organizational_memory WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`),
    wrap('workforce', 'ai_workforce_assignments', `SELECT COUNT(*)::int AS c FROM ai_workforce_assignments WHERE workspace_id=$1`),
    strategyPlanColumnPromise,
    workforcePlanColumnPromise,
    workforceRealtimeColumnPromise,
    coordinationColumnPromise
  ])

  const strategyPlanSelection = strategyPlanColumn
    ? await safeSelect({ client, workspaceId, tableName: 'ai_strategic_plans', candidateColumns: [strategyPlanColumn] })
    : { status: 'schema_unavailable', row: null, sourceColumn: null }

  const workforcePlanSelection = workforcePlanColumn
    ? await safeSelect({ client, workspaceId, tableName: 'ai_workforce_execution_plans', candidateColumns: [workforcePlanColumn] })
    : { status: 'schema_unavailable', row: null, sourceColumn: null }

  const workforceRealtimeSelection = workforceRealtimeColumn
    ? await safeSelect({ client, workspaceId, tableName: 'ai_workforce_realtime_metrics', candidateColumns: [workforceRealtimeColumn] })
    : { status: 'schema_unavailable', row: null, sourceColumn: null }

  const coordinationSelection = coordinationColumn
    ? await safeSelect({ client, workspaceId, tableName: 'ai_enterprise_coordination_runs', candidateColumns: [coordinationColumn] })
    : { status: 'schema_unavailable', row: null, sourceColumn: null }

  function moduleValue(moduleName, value) {
    if (value !== null && value !== undefined) {
      moduleStatuses[moduleName] = 'ready'
      return value
    }
    if (!moduleStatuses[moduleName]) moduleStatuses[moduleName] = 'not_initialized'
    if (!unavailableModules.includes(moduleName)) unavailableModules.push(moduleName)
    return { status: 'not_initialized' }
  }

  const governanceStatus = { mode: 'recommendation_only', status: 'human_approval_required' }
  const revenuePayload = revenue.rows[0]?.snapshot_payload || {}
  const workforceUtilization = workforce.rows[0]?.sync_payload?.utilization || workforcePlanSelection.row?.[workforcePlanSelection.sourceColumn]?.utilization || workforceRealtimeSelection.row?.[workforceRealtimeSelection.sourceColumn]?.utilization || 0

  if (strategyPlanSelection.status === 'schema_unavailable') {
    if (!unavailableModules.includes('strategy')) unavailableModules.push('strategy')
    moduleStatuses.strategy = 'schema_unavailable'
  }

  if (coordinationSelection.status === 'schema_unavailable') {
    if (!unavailableModules.includes('coordination')) unavailableModules.push('coordination')
    moduleStatuses.coordination = 'schema_unavailable'
  }

  const response = {
    executiveSummary: moduleValue('executiveSummary', { generatedAt: new Date().toISOString(), governanceStatus }),
    revenue: moduleValue('revenue', revenuePayload),
    strategy: moduleValue('strategy', {
      status: strategyPlanSelection.status,
      latestPlan: strategyPlanSelection.row?.[strategyPlanSelection.sourceColumn] || null,
      sourceColumn: strategyPlanSelection.sourceColumn,
      strategicPlan: strategyPlanSelection.row?.[strategyPlanSelection.sourceColumn] || {},
      activeStrategicInitiatives: initiatives.rows[0]?.c || 0,
      strategicDrift: drift.rows[0]?.drift_payload || null
    }),
    coordination: moduleValue('coordination', coordinationSelection.status === 'schema_unavailable'
      ? { status: 'schema_unavailable', sourceColumn: null }
      : (coordinationSelection.row?.[coordinationSelection.sourceColumn] || null)),
    memory: moduleValue('memory', memory.rows[0]?.memory_payload || null),
    workforce: moduleValue('workforce', {
      departmentSync: workforce.rows[0]?.sync_payload || null,
      executionPlan: workforcePlanSelection.row?.[workforcePlanSelection.sourceColumn] || null,
      assignments: workforceAssignments.rows[0]?.c || 0,
      realtime: workforceRealtimeSelection.status === 'schema_unavailable'
        ? { status: 'schema_unavailable', sourceColumn: null, data: null }
        : {
            status: 'ready',
            sourceColumn: workforceRealtimeSelection.sourceColumn,
            data: workforceRealtimeSelection.row?.[workforceRealtimeSelection.sourceColumn] || null
          }
    }),
    approvals: moduleValue('approvals', {
      openQueue: approvals.rows[0]?.c || 0,
      openExecutiveEscalations: escalations.rows[0]?.c || 0
    }),
    simulation: moduleValue('simulation', { latestRisk: simRisk.rows[0] || null }),
    governance: moduleValue('governance', { governanceStatus, strategicRisks: risks.rows || [] }),
    unavailableModules
  }

  console.info('executive_dashboard_overview_loaded', { workspaceId, unavailableModules })

  return { governanceLabels: GOVERNANCE_LABELS, cards: { organizationalHealthScore: health.rows[0]?.health_score || 0, revenueOpportunity: revenuePayload?.forecast?.projectedRevenueExpansion || 0, activeStrategicInitiatives: initiatives.rows[0]?.c || 0, openExecutiveEscalations: escalations.rows[0]?.c || 0, strategicDriftLevel: drift.rows[0]?.drift_payload?.driftLevel || 'low', workforceUtilization, approvalBottlenecks: approvals.rows[0]?.c || 0, simulationRiskLevel: simRisk.rows[0]?.severity || 'low', governanceMode: governanceStatus.mode }, ...response }
}

module.exports = { getOverview }
