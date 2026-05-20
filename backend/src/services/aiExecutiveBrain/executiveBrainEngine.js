const pool = require('../../db/pool')
const { analyzeStrategySignals } = require('./executiveStrategyAnalyzer')
const { buildOrganizationalHealth } = require('./organizationalHealthEngine')
const { buildForecast } = require('./executiveForecastEngine')
const { detectRisks } = require('./executiveRiskEngine')
const { buildRecommendations } = require('./strategicRecommendationEngine')
const { assignPriorities } = require('./executivePrioritizationEngine')
const { buildDepartmentCoordination } = require('./departmentCoordinationEngine')
const { storeMemory, listMemory } = require('./executiveMemoryEngine')

async function loadSignals(workspaceId, client = pool) {
  const [pipeline, approvals, workforce] = await Promise.all([
    client.query(`SELECT COALESCE(SUM(value),0) AS pipeline_value, COUNT(*) FILTER (WHERE status = 'qualified') AS qualified_leads FROM crm_leads WHERE workspace_id = $1`, [workspaceId]),
    client.query(`SELECT COUNT(*)::int AS pending_approvals FROM ai_approval_queue WHERE workspace_id = $1 AND status = 'pending'`, [workspaceId]).catch(() => ({ rows: [{ pending_approvals: 0 }] })),
    client.query(`SELECT COALESCE(AVG(utilization_pct), 72)::numeric AS utilization FROM ai_workforce_metrics WHERE workspace_id = $1`, [workspaceId]).catch(() => ({ rows: [{ utilization: 72 }] })),
  ])
  return {
    pipelineValue: Number(pipeline.rows[0].pipeline_value || 0),
    leadQuality: Number(pipeline.rows[0].qualified_leads || 0),
    approvalBottlenecks: Number(approvals.rows[0].pending_approvals || 0),
    workforceUtilization: Number(workforce.rows[0].utilization || 72),
    executionPressure: Math.min(100, Number(approvals.rows[0].pending_approvals || 0) * 8 + 30),
    enterpriseOpportunityCount: Math.max(0, Math.round(Number(pipeline.rows[0].qualified_leads || 0) / 4)),
    revenueConcentrationRisk: 58,
    conversionTrendScore: 64,
    scalingReadinessScore: 68,
  }
}
async function runAnalysis({ workspaceId, client = pool }) { const signals = await loadSignals(workspaceId, client); const snapshotInput = analyzeStrategySignals(signals); const health = buildOrganizationalHealth({ snapshot: snapshotInput }); const snapshot = { ...snapshotInput, ...health }; const forecast = buildForecast({ snapshot }); const risks = detectRisks({ snapshot }); const recommendations = assignPriorities(buildRecommendations({ snapshot, risks })); const coordination = buildDepartmentCoordination({ snapshot }); const snap = await client.query(`INSERT INTO ai_executive_snapshots(workspace_id, snapshot_payload, recommendation_only, requires_human_approval, no_autonomous_execution, no_customer_contact) VALUES($1,$2,true,true,true,true) RETURNING *`, [workspaceId, { snapshot, forecast, coordination }]); for (const risk of risks) await client.query(`INSERT INTO ai_executive_risk_events(workspace_id, risk_type, severity, risk_payload, recommendation_only, requires_human_approval, no_autonomous_execution, no_customer_contact) VALUES($1,$2,$3,$4,true,true,true,true)`, [workspaceId, risk.riskType, risk.severity, risk]); for (const rec of recommendations) await client.query(`INSERT INTO ai_executive_recommendations(workspace_id, recommendation_type, recommendation_payload, impact_estimate, confidence_score, urgency, recommendation_only, requires_human_approval, no_autonomous_execution, no_customer_contact) VALUES($1,$2,$3,$4,$5,$6,true,true,true,true)`, [workspaceId, rec.recommendationType, rec, 'high', 0.78, 'high']); for (const item of coordination) await client.query(`INSERT INTO ai_department_coordination(workspace_id, department_name, coordination_payload, recommendation_only, requires_human_approval, no_autonomous_execution, no_customer_contact) VALUES($1,$2,$3,true,true,true,true)`, [workspaceId, item.department, item]); await client.query(`INSERT INTO ai_organizational_health(workspace_id, health_score, health_payload, recommendation_only, requires_human_approval, no_autonomous_execution, no_customer_contact) VALUES($1,$2,$3,true,true,true,true)`, [workspaceId, snapshot.organizationalHealthScore, health]); await storeMemory({ workspaceId, key: 'executive_analysis', value: { snapshot, forecast } })
 return { snapshot: snap.rows[0], recommendations, risks, organizationalHealth: health, forecast, departmentCoordination: coordination, events: ['executive_snapshot_created','executive_recommendation_generated','organizational_health_updated','executive_risk_detected','department_coordination_generated','strategic_priority_assigned'] } }
async function getLatestSnapshot({ workspaceId, client = pool }) { const r = await client.query(`SELECT * FROM ai_executive_snapshots WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]); return r.rows[0] || null }
async function getRecommendations({ workspaceId, client = pool }) { const r = await client.query(`SELECT * FROM ai_executive_recommendations WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50`, [workspaceId]); return r.rows }
async function getRisks({ workspaceId, client = pool }) { const r = await client.query(`SELECT * FROM ai_executive_risk_events WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 50`, [workspaceId]); return r.rows }
async function getOrganizationalHealth({ workspaceId, client = pool }) { const r = await client.query(`SELECT * FROM ai_organizational_health WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]); return r.rows[0] || null }
module.exports = { runAnalysis, getLatestSnapshot, getRecommendations, getRisks, getOrganizationalHealth, listMemory }
