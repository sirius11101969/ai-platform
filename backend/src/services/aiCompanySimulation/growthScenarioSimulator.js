function simulateGrowthScenario({ baselineRevenue = 0, conversionRate = 0.2, horizonDays = 90 }) {
  const projectedImpact = Math.round(baselineRevenue * 0.22 + conversionRate * 12000)
  return { scenarioType: 'revenue_growth', projectedImpact, confidenceScore: 0.74, riskLevel: projectedImpact > baselineRevenue * 0.4 ? 'medium' : 'low', simulationHorizon: `${horizonDays}d`, recommendedHumanAction: 'Validate growth assumptions with sales leadership.' }
}
module.exports = { simulateGrowthScenario }
