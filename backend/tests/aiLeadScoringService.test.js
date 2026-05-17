const assert = require('assert')
const { calculateLeadScoring } = require('../src/services/aiLeadScoringService')

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function testPricingQuestionIncreasesScore() {
  const result = calculateLeadScoring({
    lead: { id: 'pricing', name: 'Pricing Lead', source: 'telegram', telegram_chat_id: '42', value: 100000, updated_at: daysAgo(0.2) },
    telegramMessages: [{ role: 'user', direction: 'inbound', message: 'Какая цена и тариф для команды sales?', created_at: daysAgo(0.1) }],
    meetings: [],
    followups: [],
  })

  assert.ok(result.score >= 60, `expected pricing question to create hot score, got ${result.score}`)
  assert.ok(result.factors.some((factor) => factor.code === 'pricing_intent'))
  assert.ok(['hot', 'priority'].includes(result.temperature))
}

function testMeetingBookedCreatesPriority() {
  const result = calculateLeadScoring({
    lead: { id: 'meeting', name: 'Meeting Lead', status: 'booked', company: 'ACME', value: 200000, updated_at: daysAgo(0.1) },
    telegramMessages: [{ role: 'user', direction: 'inbound', message: 'Да, завтра удобно провести demo', created_at: daysAgo(0.1) }],
    meetings: [{ status: 'scheduled', starts_at: new Date(Date.now() + 86400000).toISOString() }],
    followups: [],
  })

  assert.ok(result.score >= 76, `expected meeting booked to become priority, got ${result.score}`)
  assert.strictEqual(result.temperature, 'priority')
  assert.strictEqual(result.priority, 'priority')
}

function testInactiveLeadRiskDetected() {
  const result = calculateLeadScoring({
    lead: { id: 'inactive', name: 'Inactive Lead', status: 'proposal', value: 150000, updated_at: daysAgo(12) },
    telegramMessages: [{ role: 'assistant', direction: 'outbound', message: 'Напоминаю про КП', created_at: daysAgo(10) }],
    followups: [{ created_at: daysAgo(10) }, { created_at: daysAgo(9) }, { created_at: daysAgo(8) }],
  })

  assert.strictEqual(result.riskLevel, 'high')
  assert.ok(result.riskSignals.includes('inactive_lead'))
  assert.ok(result.riskSignals.includes('ghosting_risk'))
  assert.ok(result.score <= 25, `inactive lead should be cold, got ${result.score}`)
}

function main() {
  testPricingQuestionIncreasesScore()
  testMeetingBookedCreatesPriority()
  testInactiveLeadRiskDetected()
  console.log('aiLeadScoringService tests passed')
}

main()
