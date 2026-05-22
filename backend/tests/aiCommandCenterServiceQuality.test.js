const assert = require('assert')

const service = require('../src/services/aiCommandCenterService')

Promise.resolve().then(async () => {
  const deduped = service.deduplicateRecommendations([' A ', 'a', 'B', 'b ', 'A'])
  assert.deepStrictEqual(deduped, ['A', 'B'])

  const healthy = service.computeGovernanceScore({ health: 90, approvalCoverage: 80, planningCoverage: 85, stability: 90 })
  assert.strictEqual(healthy.score, 86)
  assert.strictEqual(healthy.status, 'healthy')

  const warning = service.computeGovernanceScore({ health: 60, approvalCoverage: 70, planningCoverage: 65, stability: 60 })
  assert.strictEqual(warning.status, 'warning')

  const degraded = service.computeGovernanceScore({ health: 10, approvalCoverage: 20, planningCoverage: 30, stability: 40 })
  assert.strictEqual(degraded.status, 'degraded')

  console.log('aiCommandCenterServiceQuality tests passed')
})
