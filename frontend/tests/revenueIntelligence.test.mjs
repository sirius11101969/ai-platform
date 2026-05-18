import assert from 'node:assert/strict'
import { buildRecommendationQueue, filterAndSortRevenueLeads, getForecastWidget, getLatestRevenueLeadScores, getRevenueCards, hasRevenueIntelligenceData } from '../src/utils/revenueIntelligence.js'

const intelligence = {
  forecast: { projectedRevenue: 125000, confidenceScore: 81, activePipelineValue: 240000, hotLeadsCount: 2, stalledLeadsCount: 1 },
  widgets: { forecastedRevenue: 125000, hotLeadsCount: 2, aiPipelineHealth: 74, engagementTrend: 66, aiRecommendationsQueue: 2 },
  churnRisks: [{ id: 'risk' }],
  nextBestActions: [
    { id: 'a', leadName: 'Acme', recommendedAction: 'Schedule demo', reasoningSummary: 'Клиент заинтересован в следующем шаге.' },
    { id: 'b', leadName: 'Beta', recommendedAction: 'Контекст: Плюсы: +18 demo intent', reasoningSummary: 'ai_score: 99' },
  ],
}

const cards = getRevenueCards(intelligence)
assert.equal(cards.length, 6)
assert.equal(cards.find((card) => card.key === 'forecastedRevenue').value, 125000)
assert.equal(cards.find((card) => card.key === 'pipelineHealth').value, 74)

const forecast = getForecastWidget(intelligence)
assert.equal(forecast.confidenceScore, 81)
assert.equal(forecast.hotLeadsCount, 2)

const leads = [
  { id: 'cold', aiRevenueScore: { priorityScore: 20, closeProbability: 15, churnRisk: 20, pipelineHealth: 80 } },
  { id: 'hot', aiRevenueScore: { priorityScore: 91, closeProbability: 82, churnRisk: 15, pipelineHealth: 92 } },
  { id: 'risk', aiRevenueScore: { priorityScore: 45, closeProbability: 30, churnRisk: 77, pipelineHealth: 30 } },
]
assert.deepEqual(filterAndSortRevenueLeads(leads, 'hot').map((lead) => lead.id), ['hot'])
assert.deepEqual(filterAndSortRevenueLeads(leads, 'at_risk').map((lead) => lead.id), ['risk'])
assert.deepEqual(filterAndSortRevenueLeads(leads, 'all', 'churnRisk').map((lead) => lead.id), ['risk', 'cold', 'hot'])

const queue = buildRecommendationQueue(intelligence)
assert.equal(queue.length, 2)
assert.equal(/Плюсы:|ai_score:/i.test(queue[1].recommendedAction + queue[1].reasoningSummary), false)


const latestScores = getLatestRevenueLeadScores([
  { id: 'old', lead_name: 'Old Lead', priority_score: 20, updated_at: '2026-05-17T10:00:00Z', recommended_action: 'Send value follow-up' },
  { id: 'new', leadName: 'New Lead', priorityScore: 88, updatedAt: '2026-05-18T10:00:00Z', recommendedAction: 'Контекст: Плюсы: +18 demo intent' },
], 1)
assert.equal(latestScores.length, 1, 'latest score table helper respects limit')
assert.equal(latestScores[0].id, 'new', 'latest score table helper sorts newest first')
assert.equal(/Плюсы:|ai_score:/i.test(latestScores[0].recommendedAction), false, 'latest score actions are sanitized')
assert.equal(hasRevenueIntelligenceData({}, []), false, 'empty revenue intelligence state is explicit')
assert.equal(hasRevenueIntelligenceData({ hotLeads: [{ id: 'hot' }] }, []), true, 'non-empty revenue intelligence state is detected')

console.log('revenue intelligence tests passed')
