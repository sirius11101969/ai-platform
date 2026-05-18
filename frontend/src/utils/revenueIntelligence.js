import { sanitizeVisibleAiText } from './uiSanitizer.js'

export const REVENUE_LEAD_FILTERS = [
  { id: 'all', label: 'All AI leads' },
  { id: 'hot', label: 'Hot Leads' },
  { id: 'high_probability', label: 'High Probability' },
  { id: 'stalled', label: 'Stalled' },
  { id: 'at_risk', label: 'At Risk' },
]

export const REVENUE_SORT_OPTIONS = [
  { id: 'priorityScore', label: 'AI Priority' },
  { id: 'closeProbability', label: 'Close Probability' },
  { id: 'churnRisk', label: 'Churn Risk' },
]

export function getLeadRevenueScore(lead = {}) {
  return lead.aiRevenueScore || null
}

export function getRevenueCards(intelligence = {}) {
  const widgets = intelligence?.widgets || {}
  const forecast = intelligence?.forecast || {}
  const hotLeads = intelligence?.hotLeads || []
  const stalledLeads = intelligence?.stalledLeads || []
  const churnRisks = intelligence?.churnRisks || []
  const nextBestActions = intelligence?.nextBestActions || []
  return [
    { key: 'forecastedRevenue', label: 'Forecasted Revenue', value: Number(widgets.forecastedRevenue ?? forecast.projectedRevenue ?? 0), kind: 'money', hint: `Confidence ${Number(forecast.confidenceScore || 0)}%` },
    { key: 'hotLeads', label: 'Hot Leads', value: Number(widgets.hotLeadsCount ?? hotLeads.length ?? 0), hint: 'Priority 75+ or close 70%+' },
    { key: 'stalledLeads', label: 'Stalled Leads', value: Number(forecast.stalledLeadsCount ?? stalledLeads.length ?? 0), hint: 'Low health or stale engagement' },
    { key: 'highChurnRisk', label: 'High Churn Risk', value: Number(churnRisks.length || 0), hint: 'Churn risk 65%+' },
    { key: 'pipelineHealth', label: 'Pipeline Health', value: Number(widgets.aiPipelineHealth || 0), kind: 'score', hint: `Engagement ${Number(widgets.engagementTrend || 0)}/100` },
    { key: 'recommendations', label: 'AI Recommendations', value: Number(widgets.aiRecommendationsQueue ?? nextBestActions.length ?? 0), hint: 'Safe next best actions' },
  ]
}

export function getForecastWidget(intelligence = {}) {
  const forecast = intelligence?.forecast || {}
  return {
    projectedRevenue: Number(forecast.projectedRevenue || intelligence?.widgets?.forecastedRevenue || 0),
    confidenceScore: Number(forecast.confidenceScore || 0),
    activePipelineValue: Number(forecast.activePipelineValue || 0),
    hotLeadsCount: Number(forecast.hotLeadsCount || intelligence?.widgets?.hotLeadsCount || 0),
    stalledLeadsCount: Number(forecast.stalledLeadsCount || 0),
    generatedAt: forecast.generatedAt || null,
  }
}

export function filterAndSortRevenueLeads(leads = [], filter = 'all', sortBy = 'priorityScore', sortDirection = 'desc') {
  const direction = sortDirection === 'asc' ? 1 : -1
  const filtered = leads.filter((lead) => {
    const score = getLeadRevenueScore(lead)
    if (!score) return filter === 'all'
    if (filter === 'hot') return score.priorityScore >= 75 || score.closeProbability >= 70
    if (filter === 'high_probability') return score.closeProbability >= 70
    if (filter === 'stalled') return score.pipelineHealth <= 40 || score.churnRisk >= 70
    if (filter === 'at_risk') return score.churnRisk >= 65
    return true
  })
  return filtered.sort((a, b) => {
    const aScore = getLeadRevenueScore(a) || {}
    const bScore = getLeadRevenueScore(b) || {}
    return (Number(aScore[sortBy] || 0) - Number(bScore[sortBy] || 0)) * direction
  })
}

export function buildRecommendationQueue(intelligence = {}) {
  return (intelligence?.nextBestActions || []).filter((item) => item?.recommendedAction).map((item) => ({
    ...item,
    recommendedAction: sanitizeVisibleAiText(item.recommendedAction),
    reasoningSummary: sanitizeVisibleAiText(item.reasoningSummary),
  }))
}


export function getLatestRevenueLeadScores(scores = [], limit = 12) {
  return scores
    .map((score) => ({
      ...score,
      leadName: score.leadName || score.lead_name || 'Lead',
      company: score.company || '—',
      status: score.status || '—',
      priorityScore: Number(score.priorityScore ?? score.priority_score ?? 0),
      closeProbability: Number(score.closeProbability ?? score.close_probability ?? 0),
      engagementScore: Number(score.engagementScore ?? score.engagement_score ?? 0),
      churnRisk: Number(score.churnRisk ?? score.churn_risk ?? 0),
      pipelineHealth: Number(score.pipelineHealth ?? score.pipeline_health ?? 0),
      recommendedAction: sanitizeVisibleAiText(score.recommendedAction ?? score.recommended_action ?? ''),
      recommendedChannel: score.recommendedChannel ?? score.recommended_channel ?? 'crm',
      updatedAt: score.updatedAt || score.updated_at || score.createdAt || score.created_at || null,
    }))
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, limit)
}

export function hasRevenueIntelligenceData(intelligence = {}, scores = []) {
  return Boolean(
    (scores || []).length ||
    (intelligence?.hotLeads || []).length ||
    (intelligence?.stalledLeads || []).length ||
    (intelligence?.churnRisks || []).length ||
    (intelligence?.nextBestActions || []).length ||
    intelligence?.forecast ||
    Number(intelligence?.widgets?.forecastedRevenue || 0) > 0
  )
}
