function detectRevenueRisks(snapshot = {}) {
  const risks = []
  if ((snapshot.stalledOpportunities || 0) > 0) risks.push({ risk_type: 'stalled_opportunities', severity: 'high', detail: 'Stalled opportunities detected', requires_human_approval: true, no_autonomous_execution: true })
  if ((snapshot.pendingApprovals || 0) > 8) risks.push({ risk_type: 'approval_gridlock', severity: 'high', detail: 'Approval bottleneck threatens pipeline velocity', requires_human_approval: true, no_autonomous_execution: true })
  if ((snapshot.executionPressure || 0) > 75) risks.push({ risk_type: 'execution_queue_overload', severity: 'medium', detail: 'Execution queue pressure can delay follow-ups', requires_human_approval: true, no_autonomous_execution: true })
  return risks
}
module.exports = { detectRevenueRisks }
