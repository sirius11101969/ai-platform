const pool = require('./../db/pool')

const GOVERNANCE_LABELS = [
  'Human Approval Required',
  'No Autonomous Customer Actions',
  'No Autonomous Pricing Changes',
  'Recommendation / Planning / Memory Only'
]

async function getOverview({ workspaceId, client = pool }) {
  const [health, revenue, initiatives, escalations, drift, workforce, approvals, simRisk, risks, strategicPlans, memory, coordination, realtime] = await Promise.all([
    client.query(`SELECT health_score, created_at FROM ai_organizational_health WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT snapshot_payload FROM ai_revenue_engine_snapshots WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT COUNT(*)::int AS c FROM ai_strategic_initiatives WHERE workspace_id=$1`, [workspaceId]),
    client.query(`SELECT COUNT(*)::int AS c FROM ai_executive_escalations WHERE workspace_id=$1`, [workspaceId]),
    client.query(`SELECT drift_payload FROM ai_strategic_drift_events WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT coordination_payload FROM ai_workforce_coordination_runs WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT COUNT(*)::int AS c FROM ai_approval_queue WHERE workspace_id=$1 AND approval_status='pending_approval'`, [workspaceId]),
    client.query(`SELECT risk_type, severity, risk_payload FROM ai_company_simulation_risks WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT risk_type, severity, risk_payload FROM ai_executive_risk_events WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 20`, [workspaceId]),
    client.query(`SELECT plan_payload FROM ai_strategic_plans WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT memory_payload FROM ai_organizational_memory WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT coordination_payload FROM ai_enterprise_coordination_runs WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]),
    client.query(`SELECT COUNT(*)::int AS c FROM ai_workforce_tasks WHERE workspace_id=$1 AND status='active'`, [workspaceId])
  ])

  const governanceStatus = { mode: 'recommendation_only', status: 'human_approval_required' }
  const revenuePayload = revenue.rows[0]?.snapshot_payload || {}
  const workforceUtilization = workforce.rows[0]?.coordination_payload?.utilization || 0

  return {
    governanceLabels: GOVERNANCE_LABELS,
    cards: {
      organizationalHealthScore: health.rows[0]?.health_score || 0,
      revenueOpportunity: revenuePayload?.forecast?.projectedRevenueExpansion || 0,
      activeStrategicInitiatives: initiatives.rows[0]?.c || 0,
      openExecutiveEscalations: escalations.rows[0]?.c || 0,
      strategicDriftLevel: drift.rows[0]?.drift_payload?.driftLevel || 'low',
      workforceUtilization,
      approvalBottlenecks: approvals.rows[0]?.c || 0,
      simulationRiskLevel: simRisk.rows[0]?.severity || 'low',
      governanceMode: governanceStatus.mode
    },
    sections: {
      executiveSummary: { generatedAt: new Date().toISOString(), governanceStatus },
      revenueIntelligence: revenuePayload,
      strategicPlanning: strategicPlans.rows[0]?.plan_payload || {},
      enterpriseCoordination: coordination.rows[0]?.coordination_payload || {},
      organizationalMemory: memory.rows[0]?.memory_payload || {},
      workforceHealth: workforce.rows[0]?.coordination_payload || {},
      approvalBottlenecks: { openQueue: approvals.rows[0]?.c || 0 },
      simulationScenarios: { latestRisk: simRisk.rows[0] || null },
      strategicRisks: risks.rows,
      governanceStatus,
      realtimeMetrics: { activeWorkforceTasks: realtime.rows[0]?.c || 0 }
    }
  }
}

module.exports = { getOverview }
