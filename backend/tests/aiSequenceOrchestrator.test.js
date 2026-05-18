const assert = require('assert')

const pool = require('../src/db/pool')
const sequenceService = require('../src/services/aiSequenceOrchestratorService')
const runner = require('../src/services/execution/aiExecutionRunnerService')

const workspaceId = '11111111-1111-4111-8111-111111111111'
const userId = '22222222-2222-4222-8222-222222222222'
const leadId = '33333333-3333-4333-8333-333333333333'
const templateId = '44444444-4444-4444-8444-444444444444'
const leadSequenceId = '55555555-5555-4555-8555-555555555555'

function createJsonResponse(status, body) {
  return {
    status,
    async text() { return JSON.stringify(body) },
    headers: { get(name) { return String(name).toLowerCase() === 'content-type' ? 'application/json' : null } },
  }
}

async function withEnv(updates, fn) {
  const originals = {}
  Object.keys(updates).forEach((key) => {
    originals[key] = process.env[key]
    if (updates[key] === undefined) delete process.env[key]
    else process.env[key] = updates[key]
  })
  try { return await fn() } finally {
    Object.keys(updates).forEach((key) => {
      if (originals[key] === undefined) delete process.env[key]
      else process.env[key] = originals[key]
    })
  }
}

async function withMockFetch(handler, fn) {
  const originalFetch = global.fetch
  global.fetch = async (url, options) => handler(url, options)
  try { return await fn() } finally { global.fetch = originalFetch }
}

async function withMockPoolQuery(handler, fn) {
  const calls = []
  const originalQuery = pool.query
  pool.query = async (sql, params = []) => {
    calls.push({ sql, params })
    return handler(sql, params, calls)
  }
  try { return await fn(calls) } finally { pool.query = originalQuery }
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

function sequenceRow(overrides = {}) {
  return {
    id: leadSequenceId,
    lead_id: leadId,
    template_id: templateId,
    current_step: 0,
    next_run_at: new Date(Date.now() - 1000).toISOString(),
    last_generated_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    workspace_id: workspaceId,
    user_id: userId,
    template_name: 'Enterprise Demo Follow-up',
    channel: 'telegram',
    lead_name: 'Anna',
    status: 'qualified',
    stage: 'qualified',
    metadata: {},
    ...overrides,
  }
}

async function testStartSequenceCreatesTimelineEvent() {
  await withMockPoolQuery((sql) => {
    if (sql.includes('FROM crm_leads')) return { rows: [{ id: leadId, name: 'Anna', workspace_id: workspaceId, user_id: userId }], rowCount: 1 }
    if (sql.includes('FROM ai_sequence_templates') && sql.includes('ORDER BY CASE')) return { rows: [{ id: templateId, name: 'Enterprise Demo Follow-up', channel: 'telegram' }], rowCount: 1 }
    if (sql.includes('SELECT delay_hours FROM ai_sequence_steps')) return { rows: [{ delay_hours: 0 }], rowCount: 1 }
    if (sql.includes('INSERT INTO ai_lead_sequences')) return { rows: [{ id: leadSequenceId, lead_id: leadId, template_id: templateId, status: 'active', current_step: 0, next_run_at: new Date().toISOString() }], rowCount: 1 }
    if (sql.includes('INSERT INTO lead_timeline_events')) return { rows: [{ id: 'event-1' }], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  }, async (calls) => {
    const result = await sequenceService.startSequence({ workspaceId, userId, leadId })
    assert.strictEqual(result.id, leadSequenceId)
    assert(calls.some((call) => call.sql.includes('INSERT INTO lead_timeline_events') && call.params[3] === 'ai_sequence_started'))
  })
}

async function testAutonomousSchedulingEnqueuesDueStep() {
  const client = createClient((sql) => {
    if (sql.includes('s.next_run_at IS NULL')) return { rows: [], rowCount: 0 }
    if (sql.includes('FROM ai_lead_sequences s') && sql.includes('FOR UPDATE SKIP LOCKED')) return { rows: [sequenceRow()], rowCount: 1 }
    if (sql.includes('SELECT MAX(outbound_at)')) return { rows: [{ last_outbound_at: null }], rowCount: 1 }
    if (sql.includes('FROM lead_timeline_events') && sql.includes('event_type = ANY')) return { rows: [], rowCount: 0 }
    if (sql.includes('SELECT * FROM ai_sequence_steps')) return { rows: [{ id: 'step-1', step_order: 1, delay_hours: 0, goal: 'Friendly reconnect' }], rowCount: 1 }
    if (sql.includes('information_schema.columns') && sql.includes("table_name = 'email_messages'")) return { rows: [{ column_name: 'lead_id' }, { column_name: 'created_at' }, { column_name: 'status' }], rowCount: 3 }
    if (sql.includes('INSERT INTO ai_execution_jobs')) return { rows: [{ id: 'job-1' }], rowCount: 1 }
    if (sql.includes('UPDATE ai_lead_sequences SET last_generated_at')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })
  const result = await sequenceService.enqueueDueSequenceSteps({ client, queueName: 'ai-execution' })
  assert.strictEqual(result.enqueuedCount, 1)
  const insert = client.calls.find((call) => call.sql.includes('INSERT INTO ai_execution_jobs'))
  assert.strictEqual(insert.params[3], sequenceService.SALES_SEQUENCE_STEP_GENERATION_JOB_TYPE)
  assert.deepStrictEqual(JSON.parse(insert.params[4]), { leadSequenceId, step: 1 })
}

async function testCooldownRespectReschedulesWithoutJob() {
  const recent = new Date().toISOString()
  const client = createClient((sql) => {
    if (sql.includes('s.next_run_at IS NULL')) return { rows: [], rowCount: 0 }
    if (sql.includes('FROM ai_lead_sequences s') && sql.includes('FOR UPDATE SKIP LOCKED')) return { rows: [sequenceRow()], rowCount: 1 }
    if (sql.includes('SELECT MAX(outbound_at)')) return { rows: [{ last_outbound_at: recent }], rowCount: 1 }
    if (sql.includes('FROM lead_timeline_events') && sql.includes('event_type = ANY')) return { rows: [], rowCount: 0 }
    if (sql.includes('SELECT * FROM ai_sequence_steps')) return { rows: [{ id: 'step-1', step_order: 1, delay_hours: 0, goal: 'Friendly reconnect' }], rowCount: 1 }
    if (sql.includes('information_schema.columns') && sql.includes("table_name = 'email_messages'")) return { rows: [{ column_name: 'lead_id' }, { column_name: 'created_at' }, { column_name: 'status' }], rowCount: 3 }
    if (sql.includes('information_schema.columns') && sql.includes("table_name = 'lead_timeline_events'")) return { rows: [{ column_name: 'workspace_id' }], rowCount: 1 }
    if (sql.includes("event_type = 'ai_followup_skipped_cooldown'")) return { rows: [{ id: 'audit-1', lead_id: leadId, event_type: 'ai_followup_skipped_cooldown', title: 'skip', created_at: recent }], rowCount: 1 }
    if (sql.includes('UPDATE ai_lead_sequences SET next_run_at')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })
  const result = await sequenceService.enqueueDueSequenceSteps({ client, queueName: 'ai-execution' })
  assert.strictEqual(result.enqueuedCount, 0)
  assert.strictEqual(result.skippedCount, 1)
  assert(!client.calls.some((call) => call.sql.includes('INSERT INTO ai_execution_jobs')))
}

async function testStopOnReplyStopsSequence() {
  const client = createClient((sql) => {
    if (sql.includes('s.next_run_at IS NULL')) return { rows: [], rowCount: 0 }
    if (sql.includes('FROM ai_lead_sequences s') && sql.includes('FOR UPDATE SKIP LOCKED')) return { rows: [sequenceRow()], rowCount: 1 }
    if (sql.includes('FROM lead_timeline_events') && sql.includes('event_type = ANY')) return { rows: [{ event_type: 'telegram_inbound' }], rowCount: 1 }
    if (sql.includes("UPDATE ai_lead_sequences SET status = 'stopped'")) return { rows: [{ id: leadSequenceId }], rowCount: 1 }
    if (sql.includes('INSERT INTO lead_timeline_events')) return { rows: [{ id: 'event-1' }], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })
  const result = await sequenceService.enqueueDueSequenceSteps({ client })
  assert.strictEqual(result.stoppedCount, 1)
  assert.strictEqual(result.stopped[0].reason, 'replied')
}

async function testExecutionJobCreatesPendingApprovalDraft() {
  await withEnv({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4.1-mini' }, async () => {
    await withMockFetch((url, options) => {
      const request = JSON.parse(options.body)
      assert.strictEqual(request.instructions, runner._private.SALES_SEQUENCE_SYSTEM_PROMPT)
      assert(request.input.includes('Friendly reconnect'))
      return createJsonResponse(200, {
        id: 'resp-seq-1',
        output_text: 'Hi Anna, just checking back in after your interest in the demo. Would it be helpful to look at a short walkthrough this week?',
        usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
      })
    }, async () => {
      await withMockPoolQuery((sql) => {
        if (sql.includes('FROM ai_lead_sequences s') && sql.includes('JOIN ai_sequence_steps')) return { rows: [{
          lead_sequence_id: leadSequenceId,
          current_step: 0,
          sequence_status: 'active',
          lead_id: leadId,
          template_id: templateId,
          workspace_id: workspaceId,
          user_id: userId,
          template_name: 'Enterprise Demo Follow-up',
          template_description: 'Default',
          channel: 'telegram',
          step_order: 1,
          delay_hours: 0,
          goal: 'Friendly reconnect',
          tone: 'friendly',
          instructions: 'Reconnect warmly.',
          name: 'Anna',
          email: 'anna@example.com',
          company: 'ACME',
          status: 'qualified',
          stage: 'qualified',
          source: 'website',
          next_step: 'demo',
          metadata: {},
        }], rowCount: 1 }
        if (sql.includes('FROM lead_timeline_events')) return { rows: [], rowCount: 0 }
        if (sql.includes('FROM ai_worker_queue')) return { rows: [], rowCount: 0 }
        throw new Error(`Unhandled SQL: ${sql}`)
      }, async () => {
        const result = await runner._private.executeSalesSequenceStepGenerationJob({
          id: 'job-seq-1',
          workspace_id: workspaceId,
          user_id: userId,
          job_type: sequenceService.SALES_SEQUENCE_STEP_GENERATION_JOB_TYPE,
          payload: { leadSequenceId, step: 1 },
        })
        assert.strictEqual(result.aiWorkerQueueDraft.actionType, sequenceService.SEQUENCE_ACTION_TYPE)
        assert.strictEqual(result.aiWorkerQueueDraft.payload.noAutoSend, true)
        assert.strictEqual(result.aiWorkerQueueDraft.payload.source, sequenceService.SALES_SEQUENCE_STEP_GENERATION_JOB_TYPE)
        assert(result.aiWorkerQueueDraft.recommendation.includes('step 1'))
      })
    })
  })
}

async function testSafeGenerationBlocksUnsafeText() {
  assert.throws(() => runner._private.assertSafeSalesSequenceMessage('Urgent: act now, our AI score guarantees you will win.'), /could not be generated safely/)
  const safe = runner._private.assertSafeSalesSequenceMessage('Hi Anna, would it be helpful to revisit the demo options this week?')
  assert(safe.length <= 700)
}

async function run() {
  await testStartSequenceCreatesTimelineEvent()
  await testAutonomousSchedulingEnqueuesDueStep()
  await testCooldownRespectReschedulesWithoutJob()
  await testStopOnReplyStopsSequence()
  await testExecutionJobCreatesPendingApprovalDraft()
  await testSafeGenerationBlocksUnsafeText()
  console.log('aiSequenceOrchestrator tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
