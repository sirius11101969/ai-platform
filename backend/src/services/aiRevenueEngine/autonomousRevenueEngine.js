const pool = require('../../db/pool')
const { buildStrategyRecommendations } = require('./revenueStrategyAnalyzer')
const { buildConversionInsights } = require('./conversionOptimizationEngine')
const { buildPipelineForecast } = require('./pipelineForecastEngine')
const { buildWorkflowInsights } = require('./workflowOptimizationEngine')
const { saveOptimizationMemory } = require('./revenueMemoryEngine')
const { detectRevenueRisks } = require('./revenueRiskDetector')

async function loadSnapshotInputs(client, workspaceId) {
  const [leads, approvals, queue, workforce] = await Promise.all([
    client.query(`SELECT status, COALESCE(value,0) AS value, COALESCE(estimated_revenue,0) AS estimated_revenue FROM crm_leads WHERE workspace_id = $1`, [workspaceId]),
    client.query(`SELECT COUNT(*)::int AS pending FROM ai_approval_queue WHERE workspace_id = $1 AND status = 'pending_approval'`, [workspaceId]).catch(() => ({ rows: [{ pending: 0 }] })),
    client.query(`SELECT AVG(queue_pressure)::numeric AS pressure FROM ai_workforce_realtime_metrics WHERE workspace_id = $1`, [workspaceId]).catch(() => ({ rows: [{ pressure: 0 }] })),
    client.query(`SELECT AVG(utilization_pct)::numeric AS utilization FROM ai_workforce_realtime_metrics WHERE workspace_id = $1`, [workspaceId]).catch(() => ({ rows: [{ utilization: 0 }] })),
  ])
  return { leads: leads.rows, pendingApprovals: approvals.rows[0]?.pending || 0, executionPressure: Number(queue.rows[0]?.pressure || 0), workforceUtilization: Number(workforce.rows[0]?.utilization || 0) }
}

function buildSnapshot(raw) {
  const leads = raw.leads || []
  const hotLeadCount = leads.filter((l) => ['proposal', 'qualified'].includes(String(l.status || '').toLowerCase())).length
  const stalledOpportunities = leads.filter((l) => String(l.status || '').toLowerCase() === 'stalled').length
  const openPipelineValue = leads.reduce((s, l) => s + Number(l.value || l.estimated_revenue || 0), 0)
  const conversionRate = leads.length ? hotLeadCount / leads.length : 0
  const stalledRevenue = leads.filter((l) => String(l.status || '').toLowerCase() === 'stalled').reduce((s, l) => s + Number(l.value || l.estimated_revenue || 0), 0)
  return { conversionRate, hotLeadCount, stalledOpportunities, openPipelineValue, stalledRevenue, pendingApprovals: raw.pendingApprovals, executionPressure: raw.executionPressure, workforceUtilization: raw.workforceUtilization, enterpriseOpportunities: leads.filter((l) => Number(l.value || l.estimated_revenue || 0) >= 50000).length }
}

async function runAnalysis({ workspaceId }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const snapshot = buildSnapshot(await loadSnapshotInputs(client, workspaceId))
    const forecast = buildPipelineForecast(snapshot)
    const conversion = buildConversionInsights(snapshot)
    const workflow = buildWorkflowInsights(snapshot)
    const recommendations = buildStrategyRecommendations(snapshot)
    const risks = detectRevenueRisks(snapshot)
    const snapshotRow = await client.query(`INSERT INTO ai_revenue_engine_snapshots(workspace_id, snapshot_payload) VALUES($1::uuid, $2::jsonb) RETURNING *`, [workspaceId, JSON.stringify({ ...snapshot, forecast, conversion, workflow, governance: { recommendationOnly: true, requiresHumanApproval: true, noAutonomousExecution: true } })])
    for (const rec of recommendations) await client.query(`INSERT INTO ai_revenue_strategy_recommendations(workspace_id, snapshot_id, recommendation_type, impact_estimate, confidence_score, urgency, requires_human_approval, no_autonomous_execution, payload) VALUES($1::uuid,$2::uuid,$3,$4,$5,$6,true,true,$7::jsonb)`, [workspaceId, snapshotRow.rows[0].id, rec.recommendation_type, rec.impact_estimate, rec.confidence_score, rec.urgency, JSON.stringify(rec)])
    for (const risk of risks) await client.query(`INSERT INTO ai_revenue_risk_events(workspace_id, snapshot_id, risk_type, severity, payload, requires_human_approval, no_autonomous_execution) VALUES($1::uuid,$2::uuid,$3,$4,$5::jsonb,true,true)`, [workspaceId, snapshotRow.rows[0].id, risk.risk_type, risk.severity, JSON.stringify(risk)])
    await saveOptimizationMemory(client, workspaceId, { snapshot, recommendations, risks })
    await client.query('COMMIT')
    console.info('revenue_snapshot_created', { workspaceId, snapshotId: snapshotRow.rows[0].id })
    recommendations.forEach((r) => console.info('strategy_recommendation_generated', { workspaceId, type: r.recommendation_type }))
    risks.forEach((r) => console.info('revenue_risk_detected', { workspaceId, type: r.risk_type }))
    console.info('conversion_optimization_suggested', { workspaceId })
    console.info('workflow_optimization_suggested', { workspaceId })
    return { snapshot: snapshotRow.rows[0], recommendations, risks }
  } catch (e) { await client.query('ROLLBACK'); throw e } finally { client.release() }
}

async function getLatestSnapshot({ workspaceId }) { const r = await pool.query(`SELECT * FROM ai_revenue_engine_snapshots WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 1`, [workspaceId]); return r.rows[0] || null }
async function getRecommendations({ workspaceId }) { const r = await pool.query(`SELECT * FROM ai_revenue_strategy_recommendations WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId]); return r.rows }
async function getRisks({ workspaceId }) { const r = await pool.query(`SELECT * FROM ai_revenue_risk_events WHERE workspace_id=$1 ORDER BY created_at DESC LIMIT 100`, [workspaceId]); return r.rows }
module.exports = { runAnalysis, getLatestSnapshot, getRecommendations, getRisks }
