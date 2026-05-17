const assert = require('assert')
const { calculateLeadScoring } = require('../src/services/aiLeadScoringService')

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function testPricingQuestionIsUsefulButNotOverweighted() {
  const result = calculateLeadScoring({
    lead: { id: 'pricing', name: 'Pricing Lead', source: 'telegram', telegram_chat_id: '42', value: 100000, updated_at: daysAgo(0.2) },
    telegramMessages: [{ role: 'user', direction: 'inbound', message: 'Какая цена и тариф для команды sales?', created_at: daysAgo(0.1) }],
    meetings: [],
    followups: [],
  })

  assert.strictEqual(result.score, 51, `expected calibrated pricing lead score 51, got ${result.score}`)
  assert.ok(result.factors.some((factor) => factor.code === 'pricing_intent'))
  assert.strictEqual(result.temperature, 'hot')
  assert.strictEqual(result.priority, 'high')
  assert.ok(result.scoringReason.length <= 500)
}

function testMeetingBookedCreatesPriorityWithoutUrgentInflation() {
  const result = calculateLeadScoring({
    lead: { id: 'meeting', name: 'Meeting Lead', status: 'booked', company: 'ACME', value: 200000, updated_at: daysAgo(0.1) },
    telegramMessages: [{ role: 'user', direction: 'inbound', message: 'Да, завтра удобно провести demo', created_at: daysAgo(0.1) }],
    meetings: [{ status: 'scheduled', starts_at: new Date(Date.now() + 86400000).toISOString() }],
    followups: [],
  })

  assert.ok(result.score >= 70 && result.score <= 84, `expected booked demo lead around 70-84, got ${result.score}`)
  assert.strictEqual(result.temperature, 'hot')
  assert.strictEqual(result.priority, 'priority')
}

function testEnterpriseHotLeadCanBecomeUrgent() {
  const result = calculateLeadScoring({
    lead: { id: 'enterprise', name: 'Enterprise Lead', status: 'proposal', company: 'ACME Enterprise', source: 'telegram', telegram_chat_id: '42', value: 500000, updated_at: daysAgo(0.1) },
    telegramMessages: [
      { role: 'user', direction: 'inbound', message: 'Need demo and pricing for team 35 users ASAP', created_at: daysAgo(0.1) },
      { role: 'user', direction: 'inbound', message: 'We want to decide this week', created_at: daysAgo(0.05) },
    ],
    meetings: [{ status: 'scheduled', starts_at: new Date(Date.now() + 86400000).toISOString() }],
    followups: [],
  })

  assert.ok(result.score >= 85, `expected real hot enterprise lead to reach 85+, got ${result.score}`)
  assert.strictEqual(result.temperature, 'priority')
  assert.strictEqual(result.priority, 'urgent')
}

function testInactiveLeadRiskDetected() {
  const result = calculateLeadScoring({
    lead: { id: 'inactive', name: 'Inactive Lead', status: 'proposal', value: 150000, updated_at: daysAgo(12) },
    telegramMessages: [{ role: 'assistant', direction: 'outbound', message: 'Напоминаю про КП', created_at: daysAgo(10) }],
    followups: [{ created_at: daysAgo(10) }, { created_at: daysAgo(9) }, { created_at: daysAgo(8) }],
  })

  assert.strictEqual(result.riskLevel, 'high')
  assert.ok(result.riskSignals.includes('inactive_hot_deal'))
  assert.ok(result.riskSignals.includes('ghosting_risk'))
  assert.ok(result.score < 50, `inactive weak lead should fall below 50, got ${result.score}`)
}

function testClosedLeadsDoNotPollutePriorityQueue() {
  const won = calculateLeadScoring({
    lead: { id: 'won', name: 'Won Lead', status: 'won', company: 'ACME', updated_at: daysAgo(0.1) },
    telegramMessages: [{ role: 'user', direction: 'inbound', message: 'Need demo and pricing for team 35 users ASAP', created_at: daysAgo(0.1) }],
    meetings: [{ status: 'scheduled', starts_at: new Date(Date.now() + 86400000).toISOString() }],
  })
  const lost = calculateLeadScoring({
    lead: { id: 'lost', name: 'Lost Lead', status: 'lost', updated_at: daysAgo(0.1) },
    telegramMessages: [{ role: 'user', direction: 'inbound', message: 'Need demo and pricing ASAP', created_at: daysAgo(0.1) }],
  })

  assert.strictEqual(won.priority, 'low')
  assert.ok(won.score > 20, `won score should be kept for analytics, got ${won.score}`)
  assert.ok(lost.score <= 20, `lost score should be capped at 20, got ${lost.score}`)
  assert.strictEqual(lost.priority, 'low')
  assert.strictEqual(lost.temperature, 'cold')
}

function main() {
  testPricingQuestionIsUsefulButNotOverweighted()
  testMeetingBookedCreatesPriorityWithoutUrgentInflation()
  testEnterpriseHotLeadCanBecomeUrgent()
  testInactiveLeadRiskDetected()
  testClosedLeadsDoNotPollutePriorityQueue()
  console.log('aiLeadScoringService tests passed')
}

main()
