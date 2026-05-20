const BASE_GOVERNANCE = { recommendation_only: true, requires_human_approval: true, no_autonomous_execution: true, no_customer_contact: true }
function buildRecommendations({ snapshot, risks }) {
  const recs = [
    { recommendationType: 'strategic_growth_recommendation', summary: 'Increase enterprise focus where lead quality is highest.' },
    { recommendationType: 'pipeline_optimization_recommendation', summary: 'Rebalance approvals to reduce bottlenecks and cycle-time.' },
    { recommendationType: 'organizational_scaling_recommendation', summary: 'Scale high-performing teams based on throughput and utilization.' },
  ]
  if (risks.some((r) => r.riskType === 'execution_pressure')) recs.push({ recommendationType: 'operational_bottleneck_escalation', summary: 'Escalate execution pressure mitigation to executive staff.' })
  if ((snapshot.enterpriseOpportunityCount || 0) > 0) recs.push({ recommendationType: 'enterprise_opportunity_escalation', summary: 'Escalate enterprise opportunities for executive review.' })
  return recs.map((r) => ({ ...r, ...BASE_GOVERNANCE }))
}
module.exports = { buildRecommendations, BASE_GOVERNANCE }
