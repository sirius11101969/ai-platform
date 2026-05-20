function buildStrategyRecommendations(snapshot = {}) {
  const recs = []
  const add = (recommendationType, reason, impactEstimate, confidenceScore, urgency = 'medium') => {
    recs.push({ recommendation_type: recommendationType, reason, impact_estimate: impactEstimate, confidence_score: Math.max(0, Math.min(100, Number(confidenceScore) || 0)), urgency, requires_human_approval: true, no_autonomous_execution: true })
  }
  if ((snapshot.conversionRate || 0) < 0.2) add('improve_conversion', 'Conversion rate is below target baseline', '3-8% conversion uplift', 78, 'high')
  if ((snapshot.pendingApprovals || 0) > 5) add('reduce_approval_bottleneck', 'Approval queue pressure is high', '15-30% faster cycle time', 82, 'high')
  if ((snapshot.workforceUtilization || 0) > 85 || (snapshot.workforceUtilization || 0) < 35) add('optimize_workforce_allocation', 'Workforce utilization is imbalanced', '10-20% productivity gain', 74)
  if ((snapshot.hotLeadCount || 0) > 0) add('prioritize_hot_leads', 'Hot leads detected in CRM stages', '4-12% close-rate lift', 80, 'high')
  if ((snapshot.executionPressure || 0) > 70) add('reduce_execution_queue_pressure', 'Execution queue pressure is elevated', '20-35% queue latency reduction', 76)
  if ((snapshot.stalledOpportunities || 0) > 0) add('improve_follow_up_timing', 'Stalled opportunities require re-engagement', '2-6% recovery in stalled pipeline', 71)
  if ((snapshot.enterpriseOpportunities || 0) > 0) add('escalate_enterprise_opportunities', 'Enterprise opportunities identified', 'Higher ACV win probability', 69)
  return recs
}
module.exports = { buildStrategyRecommendations }
