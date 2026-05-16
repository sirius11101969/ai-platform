const assert = require('assert')
const pool = require('../src/db/pool')
const leadQualificationService = require('../src/services/leadQualificationService')
const approvalQueueService = require('../src/services/aiApprovalQueueService')
const crmModel = require('../src/models/crmModel')

async function testHotQualificationCreatesStageRecommendation() {
  const originalConnect = pool.connect
  const insertedQueueItems = []
  const timelineEvents = []
  let insertedAiScore = null
  const lead = {
    id: 'lead-1',
    user_id: 'user-1',
    workspace_id: 'workspace-1',
    name: 'Landing Lead',
    email: 'lead@company.example',
    telegram: '@lead',
    company: 'Company',
    status: 'new',
    stage: 'new',
    value: 120000,
    source: 'landing',
    notes: 'Нужна AI CRM автоматизация продаж, demo, стоимость и детали внедрения для команды.',
    metadata: { message: 'Нужна AI CRM автоматизация продаж, demo, стоимость и детали внедрения для команды.' },
    created_at: new Date(),
    updated_at: new Date(),
  }
  const client = {
    query: async (query, params = []) => {
      const normalized = query.replace(/\s+/g, ' ').trim()
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(normalized)) return { rows: [], rowCount: 0 }
      if (query.startsWith('SELECT * FROM crm_leads')) return { rows: [lead], rowCount: 1 }
      if (query.startsWith('SELECT user_id FROM workspace_members')) return { rows: [{ user_id: 'user-1' }], rowCount: 1 }
      if (query.startsWith('INSERT INTO lead_ai_scores')) {
        insertedAiScore = {
          score: params[2],
          temperature: params[3],
          probabilityToClose: params[10],
          engagementScore: params[19],
          expectedRevenue: params[20],
          forecastCategory: params[21],
        }
        return { rows: [{ id: 'score-1', score: params[2], temperature: params[3] }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO crm_activity')) return { rows: [{ id: 'activity-1' }], rowCount: 1 }
      if (query.startsWith('UPDATE crm_leads')) return { rows: [], rowCount: 1 }
      if (query.startsWith('INSERT INTO lead_timeline_events')) {
        timelineEvents.push({ eventType: params[3], title: params[4], body: params[5], metadata: params[7] })
        return { rows: [{ id: `timeline-${timelineEvents.length}`, workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date() }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_workers')) return { rows: [{ id: query.includes('AI Outreach Engine') ? 'outreach-worker' : 'sdr-worker' }], rowCount: 1 }
      if (query.startsWith('SELECT id FROM ai_worker_queue')) return { rows: [], rowCount: 0 }
      if (query.startsWith('SELECT id FROM ai_followup_jobs')) return { rows: [], rowCount: 0 }
      if (query.startsWith('INSERT INTO ai_worker_queue')) {
        const actionType = query.includes("'stage_change_recommendation'") ? 'stage_change_recommendation' : params[3]
        const payload = query.includes("'stage_change_recommendation'") ? params[5] : params[6]
        const title = query.includes("'stage_change_recommendation'") ? params[3] : params[4]
        const recommendation = query.includes("'stage_change_recommendation'") ? params[4] : params[5]
        const item = { id: `queue-${insertedQueueItems.length + 1}`, actionType, title, recommendation, payload }
        insertedQueueItems.push(item)
        return { rows: [{ id: item.id }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO ai_followup_jobs')) return { rows: [{ id: 'followup-1' }], rowCount: 1 }
      if (query.startsWith('UPDATE ai_worker_queue')) return { rows: [], rowCount: 1 }
      throw new Error(`Unexpected query: ${normalized}`)
    },
    release: () => {},
  }
  pool.connect = async () => client

  try {
    const result = await leadQualificationService.qualifyLeadById({ workspaceId: 'workspace-1', leadId: 'lead-1', queueId: 'qualification-queue' })
    const stageItem = insertedQueueItems.find((item) => item.actionType === 'stage_change_recommendation')
    assert.ok(stageItem, 'hot qualification should create stage_change_recommendation')
    assert.ok(insertedAiScore.probabilityToClose > 0, 'AI score should save probability_to_close')
    assert.ok(insertedAiScore.engagementScore > 0, 'AI score should save engagement_score')
    assert.ok(insertedAiScore.expectedRevenue > 0, 'AI score should save expected_revenue')
    assert.ok(['likely', 'possible', 'committed'].includes(insertedAiScore.forecastCategory), 'AI score should save forecast_category')
    assert.ok(timelineEvents.some((event) => event.eventType === 'ai_forecast_updated' && /AI обновил прогноз: вероятность закрытия \d+%, ожидаемая выручка [\d\s]+ ₽, категория/.test(event.body)), 'forecast timeline event should be created')
    assert.strictEqual(stageItem.title, 'Перевести лида в Qualified — Landing Lead')
    assert.strictEqual(stageItem.payload.leadId, 'lead-1')
    assert.strictEqual(stageItem.payload.fromStage, 'new')
    assert.strictEqual(stageItem.payload.toStage, 'qualified')
    assert.ok(stageItem.payload.confidence >= 55)
    assert.ok(/Рекомендуется перевести лида в стадию Qualified/.test(stageItem.payload.reason))
    assert.ok(timelineEvents.some((event) => event.eventType === 'ai_stage_recommendation' && /AI рекомендовал перевести лида/.test(event.body)))
    assert.strictEqual(result.stageSuggestion.id, stageItem.id)
  } finally {
    pool.connect = originalConnect
  }
}

async function testStageRecommendationExecutesAfterApproval() {
  const originalQuery = pool.query
  const originalConnect = pool.connect
  const originalUpdateLead = crmModel.updateLead
  const timelineEvents = []
  const queueRows = [
    { status: 'approved' },
    { status: 'executing' },
    { status: 'completed' },
  ].map(({ status }) => ({
    id: 'queue-stage-1',
    worker_id: 'worker-1',
    workspace_id: 'workspace-1',
    lead_id: 'lead-1',
    worker_name: 'AI SDR',
    lead_name: 'Landing Lead',
    lead_status: 'new',
    action_type: 'stage_change_recommendation',
    status,
    title: 'Перевести лида в Qualified — Landing Lead',
    recommendation: 'Клиент проявил высокий интерес к AI CRM. Рекомендуется перевести лида в стадию Qualified.',
    payload: { leadId: 'lead-1', fromStage: 'new', toStage: 'qualified', confidence: 91, reason: 'Клиент проявил высокий интерес к AI CRM.' },
    created_at: new Date(),
    updated_at: new Date(),
  }))

  pool.query = async (query, params = []) => {
    if (query.startsWith('SELECT q.*')) return { rows: [queueRows.shift() || queueRows[queueRows.length - 1]], rowCount: 1 }
    if (query.startsWith('UPDATE ai_worker_queue SET status = \'executing\'')) return { rows: [], rowCount: 1 }
    throw new Error(`Unexpected pool query: ${query}`)
  }
  pool.connect = async () => ({
    query: async (query, params = []) => {
      const normalized = query.replace(/\s+/g, ' ').trim()
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(normalized)) return { rows: [], rowCount: 0 }
      if (query.startsWith('UPDATE ai_worker_queue SET status = $3')) return { rows: [], rowCount: 1 }
      if (query.startsWith('INSERT INTO lead_timeline_events')) {
        timelineEvents.push({ eventType: params[3], body: params[5], metadata: params[7] })
        return { rows: [{ id: 'timeline-stage', workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date() }], rowCount: 1 }
      }
      if (query.startsWith('INSERT INTO crm_activity')) return { rows: [{ id: 'activity-stage' }], rowCount: 1 }
      throw new Error(`Unexpected client query: ${query}`)
    },
    release: () => {},
  })
  crmModel.updateLead = async (userId, workspaceId, leadId, payload) => {
    assert.strictEqual(payload.status, 'qualified')
    return { id: leadId, status: 'qualified' }
  }

  try {
    const response = await approvalQueueService.executeQueueItem('user-1', 'workspace-1', 'queue-stage-1')
    assert.strictEqual(response.item.status, 'completed')
    assert.ok(timelineEvents.some((event) => event.eventType === 'ai_stage_changed' && /Стадия изменена: New → Qualified/.test(event.body)))
  } finally {
    pool.query = originalQuery
    pool.connect = originalConnect
    crmModel.updateLead = originalUpdateLead
  }
}

async function main() {
  await testHotQualificationCreatesStageRecommendation()
  await testStageRecommendationExecutesAfterApproval()
  console.log('leadQualificationStageRecommendation tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
