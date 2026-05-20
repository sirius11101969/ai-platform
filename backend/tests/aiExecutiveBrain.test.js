const assert = require('assert')
const { buildOrganizationalHealth } = require('../src/services/aiExecutiveBrain/organizationalHealthEngine')
const { detectRisks } = require('../src/services/aiExecutiveBrain/executiveRiskEngine')
const { buildRecommendations } = require('../src/services/aiExecutiveBrain/strategicRecommendationEngine')

const snapshot = { workforceUtilization: 88, executionPressure: 81, conversionTrendScore: 60, revenueConcentrationRisk: 72, enterpriseOpportunityCount: 3 }
const health = buildOrganizationalHealth({ snapshot })
assert.ok(Number.isFinite(health.organizationalHealthScore), 'organizational health generation')
const risks = detectRisks({ snapshot: { ...snapshot, organizationalHealthScore: health.organizationalHealthScore } })
assert.ok(risks.length >= 1, 'risk detection')
const recs = buildRecommendations({ snapshot, risks })
assert.ok(recs.length >= 1, 'recommendation generation')
for (const rec of recs) {
  assert.strictEqual(rec.recommendation_only, true, 'governance enforcement')
  assert.strictEqual(rec.requires_human_approval, true, 'governance enforcement')
  assert.strictEqual(rec.no_autonomous_execution, true, 'governance enforcement')
  assert.strictEqual(rec.no_customer_contact, true, 'governance enforcement')
}
console.log('executive analysis, organizational health generation, recommendation generation, risk detection, governance enforcement passed')
