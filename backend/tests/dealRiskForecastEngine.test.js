const assert = require('assert')
const { scoreLeadContext } = require('../src/services/leadIntelligenceService')

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function testHotLeadForecast() {
  const intelligence = scoreLeadContext({
    lead: {
      id: 'lead-hot',
      name: 'Hot Lead',
      email: 'buyer@company.example',
      telegram: '@buyer',
      company: 'Company',
      stage: 'qualified',
      value: 100000,
      notesText: 'Нужна demo, бюджет согласован, интерес к AI CRM и внедрение для команды.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    },
    telegramMessages: [
      { role: 'assistant', message: 'Можем показать demo сегодня?', createdAt: daysAgo(0.1) },
      { role: 'user', message: 'Да, demo интересно, бюджет есть.', createdAt: daysAgo(0.05) },
    ],
    emails: [],
    notes: [],
    activity: [],
  })

  assert.ok(intelligence.dealProbability >= 70, 'hot lead should have high probability')
  assert.strictEqual(intelligence.expectedRevenue, Math.round(100000 * intelligence.dealProbability / 100))
  assert.ok(['committed', 'likely'].includes(intelligence.forecastCategory), `unexpected forecast category: ${intelligence.forecastCategory}`)
  assert.strictEqual(intelligence.riskLevel, 'low')
  assert.strictEqual(intelligence.nextBestActionCode, 'schedule_demo')
}

function testStalledProposalRisk() {
  const intelligence = scoreLeadContext({
    lead: {
      id: 'lead-risk',
      name: 'Risk Lead',
      email: 'risk@company.example',
      telegram: '@risk',
      company: 'Company',
      stage: 'proposal',
      value: 250000,
      notesText: 'Отправили proposal / КП после demo.',
      createdAt: daysAgo(14),
      updatedAt: daysAgo(8),
      lastMessageAt: daysAgo(8),
    },
    telegramMessages: [
      { role: 'assistant', message: 'Отправляю proposal и условия внедрения.', createdAt: daysAgo(8) },
    ],
    emails: [{ subject: 'Proposal / КП', text: 'Коммерческое предложение', sentAt: daysAgo(8), createdAt: daysAgo(8) }],
    notes: [],
    activity: [
      { title: 'follow-up', body: 'первый follow-up', createdAt: daysAgo(10) },
      { title: 'follow-up', body: 'второй follow-up', createdAt: daysAgo(9) },
      { title: 'follow-up', body: 'третий follow-up', createdAt: daysAgo(8) },
    ],
  })

  assert.strictEqual(intelligence.riskLevel, 'high')
  assert.strictEqual(intelligence.forecastCategory, 'lost_risk')
  assert.ok(intelligence.riskSignals.includes('no_reply_7d'))
  assert.ok(intelligence.riskSignals.includes('proposal_ignored'))
  assert.ok(intelligence.riskSignals.includes('repeated_followups_without_engagement'))
  assert.strictEqual(intelligence.nextBestActionCode, 'escalate_to_manager')
  assert.match(intelligence.aiReasoning, /Клиент перестал отвечать/)
}

function main() {
  testHotLeadForecast()
  testStalledProposalRisk()
  console.log('dealRiskForecastEngine tests passed')
}

main()
