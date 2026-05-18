const assert = require('assert')
const voiceOutreachService = require('../src/services/voiceOutreachService')
const sequenceService = require('../src/services/aiSequenceOrchestratorService')
const { calculateRevenueLeadScore } = require('../src/services/aiRevenueIntelligenceService')

function createVoiceClient({ detectConcurrentQueries = false } = {}) {
  const state = { calls: [], events: [], timeline: [], workerCreated: false, workerParams: null, inFlightQueries: 0, maxInFlightQueries: 0 }
  const lead = { id: '11111111-1111-4111-8111-111111111111', workspace_id: '22222222-2222-4222-8222-222222222222', user_id: '33333333-3333-4333-8333-333333333333', name: 'Anna Buyer', contact: '+15551234567', status: 'qualified', value: 50000 }
  return {
    state,
    async query(sql, params = []) {
      if (detectConcurrentQueries) {
        assert.strictEqual(state.inFlightQueries, 0, `concurrent query detected for SQL: ${sql}`)
        state.inFlightQueries += 1
        state.maxInFlightQueries = Math.max(state.maxInFlightQueries, state.inFlightQueries)
        await new Promise((resolve) => setTimeout(resolve, 1))
      }
      try {
      if (sql.includes('SELECT * FROM crm_leads')) return { rows: [lead], rowCount: 1 }
      if (sql.includes('INSERT INTO ai_voice_calls')) {
        const row = { id: `44444444-4444-4444-8444-${String(state.calls.length + 1).padStart(12, '0')}`, workspace_id: params[0], lead_id: params[1], sequence_id: params[2], provider: params[3], status: 'queued', phone_number: params[4], metadata: JSON.parse(params[5]), created_at: new Date().toISOString() }
        state.calls.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('INSERT INTO ai_voice_call_events')) {
        const row = { id: `event-${state.events.length + 1}`, call_id: params[0], event_type: params[1], payload: JSON.parse(params[2]), created_at: new Date().toISOString() }
        state.events.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('UPDATE ai_voice_calls') && sql.includes("status = 'completed'")) {
        const call = state.calls.find((item) => item.id === params[0]) || state.calls[0]
        Object.assign(call, { status: 'completed', completed_at: new Date().toISOString(), duration_seconds: params[1], transcript: params[2], summary: params[3], sentiment: params[4], outcome: params[5], next_action: params[6], recording_url: params[7], metadata: { ...call.metadata, ...JSON.parse(params[8]) } })
        return { rows: [call], rowCount: 1 }
      }
      if (sql.includes('UPDATE ai_voice_calls')) {
        const call = state.calls.find((item) => item.id === params[0]) || state.calls[0]
        call.status = params[1]
        call.metadata = { ...call.metadata, ...JSON.parse(params[2]) }
        return { rows: [call], rowCount: 1 }
      }
      if (sql.includes('INSERT INTO lead_timeline_events')) {
        const row = { id: `timeline-${state.timeline.length + 1}`, workspace_id: params[0], lead_id: params[1], user_id: params[2], event_type: params[3], title: params[4], body: params[5], source: params[6], metadata: params[7], created_at: new Date().toISOString() }
        state.timeline.push(row)
        return { rows: [row], rowCount: 1 }
      }
      if (sql.includes('INSERT INTO ai_workers')) {
        state.workerCreated = true
        state.workerParams = params
        assert.notStrictEqual(params[1], 'ai_voice_worker')
        return { rows: [{ id: 'worker-1' }], rowCount: 1 }
      }
      throw new Error(`Unhandled SQL: ${sql}`)
      } finally {
        if (detectConcurrentQueries) state.inFlightQueries -= 1
      }
    },
  }
}

async function testMockCallLifecyclePersistsTranscriptAndAnalysis() {
  const client = createVoiceClient()
  const call = await voiceOutreachService.initiateCall({ workspaceId: '22222222-2222-4222-8222-222222222222', userId: '33333333-3333-4333-8333-333333333333', leadId: '11111111-1111-4111-8111-111111111111', client })
  assert.strictEqual(call.status, 'completed')
  assert.strictEqual(call.provider, 'mock_provider')
  assert.ok(call.transcript.includes('AI SDR'))
  assert.strictEqual(call.sentiment, 'positive')
  assert.strictEqual(call.outcome, 'qualified_demo_interest')
  assert.ok(call.summary.includes('Anna Buyer'))
  assert.ok(call.nextAction.includes('Schedule demo'))
  assert(client.state.events.some((event) => event.event_type === 'transcript_stored'))
  assert(client.state.events.some((event) => event.event_type === 'analysis_completed'))
  assert(client.state.timeline.some((event) => event.event_type === 'ai_voice_call_started'))
  assert(client.state.timeline.some((event) => event.event_type === 'ai_voice_call_completed'))
  assert(client.state.timeline.some((event) => event.event_type === 'ai_voice_followup_recommended'))
  assert.strictEqual(client.state.workerParams[1], 'ai_sdr_agent')
  assert.ok(client.state.workerParams[2].includes('workerKind=ai_voice_worker'))
}


async function testConcurrentCallExecutionSerializesSharedClientQueries() {
  const client = createVoiceClient({ detectConcurrentQueries: true })
  const args = { workspaceId: '22222222-2222-4222-8222-222222222222', userId: '33333333-3333-4333-8333-333333333333', leadId: '11111111-1111-4111-8111-111111111111', client }
  const [first, second] = await Promise.all([
    voiceOutreachService.initiateCall(args),
    voiceOutreachService.initiateCall(args),
  ])
  assert.strictEqual(first.status, 'completed')
  assert.strictEqual(second.status, 'completed')
  assert.strictEqual(client.state.calls.length, 2)
  assert.strictEqual(client.state.maxInFlightQueries, 1)
  assert.strictEqual(client.state.events.filter((event) => event.event_type === 'queued').length, 2)
  assert.strictEqual(client.state.events.filter((event) => event.event_type === 'analysis_completed').length, 2)
}

async function testEnsureVoiceWorkerUsesAllowedTypeAndPreservesExistingWorkerDetails() {
  const calls = []
  const client = {
    async query(sql, params = []) {
      calls.push({ sql, params })
      if (sql.includes('INSERT INTO ai_workers')) return { rows: [{ id: 'existing-sdr-worker' }], rowCount: 1 }
      throw new Error(`Unhandled SQL: ${sql}`)
    },
  }
  const worker = await voiceOutreachService._private.ensureVoiceWorker(client, '22222222-2222-4222-8222-222222222222')
  assert.strictEqual(worker.id, 'existing-sdr-worker')
  const insert = calls[0]
  assert.strictEqual(insert.params[1], 'ai_sdr_agent')
  assert.notStrictEqual(insert.params[1], voiceOutreachService.AI_VOICE_WORKER_KIND)
  assert.ok(insert.params[2].includes('voice=true'))
  assert.ok(insert.params[2].includes('workerKind=ai_voice_worker'))
  assert.ok(insert.sql.includes("WHEN ai_workers.name = 'AI Voice Worker'"))
  assert.ok(!insert.sql.includes('SET name = EXCLUDED.name'))
}

function createSequenceClient() {
  const calls = []
  return {
    calls,
    async query(sql, params = []) {
      calls.push({ sql, params })
      if (sql.includes('FROM ai_lead_sequences s') && sql.includes('current_step > 0')) return { rows: [], rowCount: 0 }
      if (sql.includes('FROM ai_lead_sequences s') && sql.includes('FOR UPDATE SKIP LOCKED')) {
        return { rows: [{ id: 'seq-voice-1', workspace_id: 'workspace-1', user_id: 'user-1', lead_id: 'lead-1', template_id: 'template-1', current_step: 0, status: 'active', next_run_at: new Date().toISOString(), channel: 'voice', lead_name: 'Voice Lead', metadata: {}, stage: 'qualified' }], rowCount: 1 }
      }
      if (sql.includes('SELECT event_type')) return { rows: [], rowCount: 0 }
      if (sql.includes('SELECT * FROM ai_sequence_steps')) return { rows: [{ step_order: 1, delay_hours: 0, goal: 'Qualify by voice' }], rowCount: 1 }
      if (sql.includes('information_schema.columns')) return { rows: [], rowCount: 0 }
      if (sql.includes('FROM lead_timeline_events') || sql.includes('FROM telegram_messages') || sql.includes('FROM email_messages') || sql.includes('FROM crm_activity') || sql.includes('FROM ai_worker_queue')) return { rows: [], rowCount: 0 }
      if (sql.includes('UPDATE ai_lead_sequences SET last_generated_at')) return { rows: [], rowCount: 1 }
      if (sql.includes('INSERT INTO ai_execution_jobs')) return { rows: [{ id: 'job-voice-1' }], rowCount: 1 }
      throw new Error(`Unhandled SQL: ${sql}`)
    },
  }
}

async function testVoiceSequenceEnqueuesVoiceJob() {
  const client = createSequenceClient()
  const result = await sequenceService.enqueueDueSequenceSteps({ client, cooldownHours: 0 })
  assert.strictEqual(result.enqueuedCount, 1)
  assert.strictEqual(result.enqueued[0].jobType, voiceOutreachService.VOICE_OUTREACH_CALL_JOB_TYPE)
  const insert = client.calls.find((call) => call.sql.includes('INSERT INTO ai_execution_jobs'))
  assert.strictEqual(insert.params[3], voiceOutreachService.VOICE_OUTREACH_CALL_JOB_TYPE)
  assert.strictEqual(JSON.parse(insert.params[4]).mockMode, true)
}

function testRevenueScoreUsesVoiceSignals() {
  const score = calculateRevenueLeadScore({
    lead: { id: 'lead-voice', status: 'qualified', value: 100000, contact: '+15551234567', updated_at: new Date().toISOString() },
    voiceCalls: [{ status: 'completed', sentiment: 'positive', outcome: 'qualified_demo_interest', created_at: new Date().toISOString() }],
  })
  assert.strictEqual(score.recommendedChannel, 'voice')
  assert.ok(score.engagementScore >= 50, `expected voice call to lift engagement, got ${score.engagementScore}`)
  assert.ok(score.closeProbability >= 50, `expected voice call to lift close probability, got ${score.closeProbability}`)
}

async function main() {
  await testMockCallLifecyclePersistsTranscriptAndAnalysis()
  await testConcurrentCallExecutionSerializesSharedClientQueries()
  await testEnsureVoiceWorkerUsesAllowedTypeAndPreservesExistingWorkerDetails()
  await testVoiceSequenceEnqueuesVoiceJob()
  testRevenueScoreUsesVoiceSignals()
  console.log('voiceOutreachService tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
