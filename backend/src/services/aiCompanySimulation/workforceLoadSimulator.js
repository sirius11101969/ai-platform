function simulateWorkforceLoad({ activeDeals = 0, workforceUtilization = 70, queueDepth = 0 }) {
  const projectedImpact = Math.round((activeDeals * 0.7) - (100 - workforceUtilization) + queueDepth)
  return { scenarioType: 'workforce_scaling_impact', projectedImpact, confidenceScore: 0.71, riskLevel: workforceUtilization > 85 ? 'high' : 'medium', simulationHorizon: '30d', recommendedHumanAction: 'Rebalance workloads and evaluate hiring plan.' }
}
module.exports = { simulateWorkforceLoad }
