const assert = require('assert')
const {
  calculateRevenueLeadScore,
  generateRevenueForecast,
  enqueueDueRevenueIntelligence,
  getRevenueIntelligenceDashboard,
  LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE,
  REVENUE_FORECAST_GENERATION_JOB_TYPE,
} = require('../src/services/aiRevenueIntelligenceService')
const pool = require('../src/db/pool')

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function createClient(handler) {
  const calls = []
  return {
    calls,
    async query(sql, params = []) {
      calls.push({ sql, params })
      return handler(sql, params, calls)
    },
  }
}

function testScoreGenerationUsesSignals() {
  const score = calculateRevenueLeadScore({
    lead: { id: 'lead-1', status: 'proposal', value: 100000, telegram_chat_id: '42', updated_at: daysAgo(0.5) },
    telegramMessages: [{ direction: 'inbound', message: 'Can we see pricing?', created_at: daysAgo(0.2) }],
    meetings: [{ status: 'scheduled', starts_at: new Date(Date.now() + 86400000).toISOString() }],
    sequences: [{ status: 'active', current_step: 2 }],
    timeline: [{ event_type: 'telegram_reply_received', created_at: daysAgo(0.2) }],
  })

  assert.ok(score.priorityScore >= 70, `expected hot priority, got ${score.priorityScore}`)
  assert.ok(score.closeProbability >= 70, `expected high close probability, got ${score.closeProbability}`)
  assert.strictEqual(score.recommendedAction, 'Schedule demo')
  assert.strictEqual(score.recommendedChannel, 'telegram')
  assert.ok(/probabilistic/i.test(score.reasoningSummary), 'reasoning must use probabilistic language')
}

async function testForecastGenerationDoesNotHallucinateRevenue() {
  const client = createClient((sql) => {
    if (sql.includes('WITH active_leads')) {
      return { rows: [{ projected_revenue: '25000', confidence_score: '62', active_pipeline_value: '100000', hot_leads_count: 1, stalled_leads_count: 1 }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO ai_revenue_forecasts')) {
      return { rows: [{ id: 'forecast-1', projected_revenue: '25000', confidence_score: 62, active_pipeline_value: '100000', hot_leads_count: 1, stalled_leads_count: 1, forecast_period: 'current_30_days' }], rowCount: 1 }
    }
    throw new Error(`Unhandled SQL: ${sql}`)
  })

  const forecast = await generateRevenueForecast({ workspaceId: 'workspace-1', client })
  assert.strictEqual(Number(forecast.projected_revenue), 25000)
  assert(client.calls[0].sql.includes('SUM(COALESCE(value, 0) * COALESCE(close_probability, 0) / 100.0)'), 'forecast must be weighted from pipeline value and probability')
}

function testRecommendationSafetyForSilentLead() {
  const score = calculateRevenueLeadScore({
    lead: { id: 'silent', status: 'proposal', value: 50000, email: 'buyer@example.com', updated_at: daysAgo(15) },
    emailMessages: [{ direction: 'outbound', subject: 'Pricing', created_at: daysAgo(15) }],
    meetings: [],
    sequences: [{ status: 'active', current_step: 3 }],
  })

  assert.strictEqual(score.isSilent, true)
  assert.strictEqual(score.isStalled, true)
  assert.ok(score.churnRisk >= 70, `expected high churn risk, got ${score.churnRisk}`)
  assert.ok(['Escalate to manager', 'Pause outreach', 'Send pricing follow-up'].includes(score.recommendedAction))
  assert.ok(!/guarantee|certain|promise/i.test(`${score.reasoningSummary} ${score.recommendedAction}`))
}

async function testAutonomousSchedulingEnqueuesJobs() {
  const client = createClient((sql) => {
    if (sql.includes('FROM crm_leads l') && sql.includes('HAVING COALESCE')) {
      return { rows: [{ id: 'lead-1', workspace_id: 'workspace-1', user_id: 'user-1' }], rowCount: 1 }
    }
    if (sql.includes('FROM workspaces w')) {
      return { rows: [{ workspace_id: 'workspace-1', user_id: 'user-1' }], rowCount: 1 }
    }
    if (sql.includes('INSERT INTO ai_execution_jobs')) {
      return { rows: [{ id: `job-${client.calls.length}` }], rowCount: 1 }
    }
    throw new Error(`Unhandled SQL: ${sql}`)
  })

  const result = await enqueueDueRevenueIntelligence({ client, queueName: 'ai-execution', limit: 10 })
  assert.strictEqual(result.enqueuedCount, 2)
  const jobTypes = client.calls.filter((call) => call.sql.includes('INSERT INTO ai_execution_jobs')).map((call) => call.params[3])
  assert.deepStrictEqual(jobTypes, [LEAD_INTELLIGENCE_ANALYSIS_JOB_TYPE, REVENUE_FORECAST_GENERATION_JOB_TYPE])
}

async function testDashboardMetricsWithoutStartedAtColumn() {
  const originalQuery = pool.query
  pool.query = async (sql) => {
    if (sql.includes('FROM ai_lead_scores s') && sql.includes('JOIN crm_leads l')) return { rows: [], rowCount: 0 }
    if (sql.includes('FROM ai_revenue_forecasts')) return { rows: [], rowCount: 0 }
    if (sql.includes('analysis_latency_ms') && sql.includes('ai_execution_jobs j')) {
      assert(!sql.includes('j.started_at'), 'dashboard metrics SQL must not reference j.started_at')
      return {
        rows: [{ analysis_latency_ms: '1200', forecast_generation_count: 2, scored_leads: 3, active_leads: 4, recommendation_acceptance: 1 }],
        rowCount: 1,
      }
    }
    throw new Error(`Unhandled SQL: ${sql}`)
  }

  try {
    const dashboard = await getRevenueIntelligenceDashboard({ workspaceId: 'workspace-1' })
    assert.strictEqual(typeof dashboard, 'object')
    assert.strictEqual(dashboard.metrics.analysisLatencyMs, 1200)
    assert.strictEqual(dashboard.metrics.forecastGenerationCount, 2)
    assert.strictEqual(dashboard.metrics.recommendationAcceptance, 1)
    assert.strictEqual(dashboard.metrics.scoringCoverage, 75)
  } finally {
    pool.query = originalQuery
  }
}

async function main() {
  testScoreGenerationUsesSignals()
  await testForecastGenerationDoesNotHallucinateRevenue()
  testRecommendationSafetyForSilentLead()
  await testAutonomousSchedulingEnqueuesJobs()
  await testDashboardMetricsWithoutStartedAtColumn()
  console.log('aiRevenueIntelligenceService tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
