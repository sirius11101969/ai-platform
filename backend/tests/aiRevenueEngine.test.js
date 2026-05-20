const assert = require('assert')
const { buildStrategyRecommendations } = require('../src/services/aiRevenueEngine/revenueStrategyAnalyzer')
const { detectRevenueRisks } = require('../src/services/aiRevenueEngine/revenueRiskDetector')

function testRecommendationGeneration() {
  const recs = buildStrategyRecommendations({ conversionRate: 0.1, pendingApprovals: 9, hotLeadCount: 2, executionPressure: 80, stalledOpportunities: 1, workforceUtilization: 92 })
  assert.ok(recs.length >= 5)
  recs.forEach((r) => { assert.strictEqual(r.requires_human_approval, true); assert.strictEqual(r.no_autonomous_execution, true) })
}

function testRiskDetection() {
  const risks = detectRevenueRisks({ stalledOpportunities: 2, pendingApprovals: 10, executionPressure: 81 })
  assert.ok(risks.length >= 2)
  assert.ok(risks.some((r) => r.risk_type === 'stalled_opportunities'))
}

testRecommendationGeneration(); testRiskDetection(); console.log('aiRevenueEngine.test.js passed')
