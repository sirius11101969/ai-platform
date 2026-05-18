const assert = require('assert')

const pool = require('../src/db/pool')
const runner = require('../src/services/execution/aiExecutionRunnerService')
const { recordProviderUsage } = require('../src/services/execution/providerUsageService')
const { writeExecutionLog } = require('../src/services/execution/executionLogService')

const { _private } = runner

const workerId = '11111111-1111-4111-8111-111111111111'
const jobId = '22222222-2222-4222-8222-222222222222'
const taskId = '33333333-3333-4333-8333-333333333333'
const workspaceId = '44444444-4444-4444-8444-444444444444'
const userId = '55555555-5555-4555-8555-555555555555'

function assertNoUndefinedParams(calls) {
  for (const call of calls) {
    if (!Array.isArray(call.params)) continue
    call.params.forEach((param, index) => {
      assert.notStrictEqual(param, undefined, `Unexpected undefined param ${index + 1} for SQL: ${call.sql}`)
    })
  }
}

function assertJsonParam(value, expected) {
  assert.strictEqual(typeof value, 'string')
  assert.deepStrictEqual(JSON.parse(value), expected)
}

function createClient(handler) {
  const calls = []
  return {
    calls,
    released: false,
    async query(sql, params = []) {
      calls.push({ sql, params })
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 }
      return handler(sql, params, calls)
    },
    release() {
      this.released = true
    },
  }
}

async function withMockPoolConnect(client, fn) {
  const originalConnect = pool.connect
  pool.connect = async () => client
  try {
    return await fn()
  } finally {
    pool.connect = originalConnect
  }
}

async function testCompleteJobUsesTypedPersistenceQueries() {
  const completedJob = {
    id: jobId,
    workspace_id: workspaceId,
    user_id: userId,
    task_id: null,
    queue_name: 'ai-execution',
    job_type: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
  }
  const client = createClient(async (sql) => {
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [completedJob], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'log-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })

  const resultPayload = { ok: true, text: 'done', usage: { totalTokens: 7 }, optional: undefined }
  await withMockPoolConnect(client, async () => {
    const result = await _private.completeJob({
      job: { id: jobId },
      worker: { id: workerId },
      result: resultPayload,
      startedAt: new Date(Date.now() - 25),
    })
    assert.strictEqual(result.completed, true)
  })

  const jobUpdate = client.calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
  assert(jobUpdate.sql.includes('result = $3::jsonb'))
  assertJsonParam(jobUpdate.params[2], { ok: true, text: 'done', usage: { totalTokens: 7 }, optional: null })

  const logInsert = client.calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
  assert(logInsert.sql.includes('$10::jsonb'))
  assertJsonParam(logInsert.params[9], {
    workerNodeId: workerId,
    latencyMs: JSON.parse(logInsert.params[9]).latencyMs,
    result: { ok: true, text: 'done', usage: { totalTokens: 7 }, optional: null },
  })

  const metricInsert = client.calls.find((call) => call.sql.includes('INSERT INTO worker_metrics'))
  assert(metricInsert.sql.includes('$5::jsonb'))
  assertJsonParam(metricInsert.params[4], { jobType: _private.OPENAI_TEXT_GENERATION_JOB_TYPE })
  assertNoUndefinedParams(client.calls)
}

async function runFailureScenario({ error, freshJobOverrides = {} }) {
  const freshJob = {
    id: jobId,
    workspace_id: workspaceId,
    user_id: userId,
    task_id: taskId,
    queue_name: 'ai-execution',
    job_type: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
    payload: { model: 'gpt-4.1-mini' },
    attempt_count: 1,
    max_attempts: 3,
    ...freshJobOverrides,
  }
  const client = createClient(async (sql) => {
    if (sql.includes('SELECT * FROM ai_execution_jobs')) return { rows: [freshJob], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [freshJob], rowCount: 1 }
    if (sql.includes('INSERT INTO dead_letter_queue')) return { rows: [], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'log-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO task_execution_history')) return { rows: [{ id: 'history-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO ai_provider_usage')) return { rows: [{ id: 'usage-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })

  await withMockPoolConnect(client, async () => {
    return _private.failJob({
      job: { id: jobId },
      worker: { id: workerId },
      error,
      startedAt: new Date(Date.now() - 25),
    })
  })
  assertNoUndefinedParams(client.calls)
  return client.calls
}

async function testFailJobRetryingUsesTypedPersistenceQueries() {
  const calls = await runFailureScenario({ error: new Error('temporary outage') })
  const update = calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
  assert(update.sql.includes('status = $3::text'))
  assert(update.sql.includes('error_message = $4::text'))
  assert(update.sql.includes('$5::integer'))
  assert.strictEqual(update.params[2], 'retrying')

  const logInsert = calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
  assert(logInsert.sql.includes('$10::jsonb'))
  assert.strictEqual(JSON.parse(logInsert.params[9]).nextStatus, 'retrying')

  const usageInsert = calls.find((call) => call.sql.includes('INSERT INTO ai_provider_usage'))
  assert(usageInsert.sql.includes('$14::jsonb'))
  assertJsonParam(usageInsert.params[13], { jobId, nextStatus: 'retrying', safeError: 'temporary outage' })

  const historyInsert = calls.find((call) => call.sql.includes('INSERT INTO task_execution_history'))
  assert(historyInsert.sql.includes('$10::jsonb'))
  assertJsonParam(historyInsert.params[9], {})

  const metricInsert = calls.find((call) => call.sql.includes('INSERT INTO worker_metrics'))
  assertJsonParam(metricInsert.params[4], { jobType: _private.OPENAI_TEXT_GENERATION_JOB_TYPE, nextStatus: 'retrying' })
}

async function testFailJobDeadLetteredUsesTypedPersistenceQueries() {
  const calls = await runFailureScenario({ error: new Error('exhausted'), freshJobOverrides: { attempt_count: 3, max_attempts: 3 } })
  const deadLetterInsert = calls.find((call) => call.sql.includes('INSERT INTO dead_letter_queue'))
  assert(deadLetterInsert.sql.includes('$7::jsonb'))
  assertJsonParam(deadLetterInsert.params[6], { model: 'gpt-4.1-mini' })

  const logInsert = calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
  assert.strictEqual(JSON.parse(logInsert.params[9]).nextStatus, 'dead_lettered')

  const metricInsert = calls.find((call) => call.sql.includes('INSERT INTO worker_metrics'))
  assertJsonParam(metricInsert.params[4], { jobType: _private.OPENAI_TEXT_GENERATION_JOB_TYPE, nextStatus: 'dead_lettered' })
}

async function testFailJobNonRetryableUsesTypedPersistenceQueries() {
  const nonRetryable = new Error('configuration problem')
  nonRetryable.nonRetryable = true
  nonRetryable.providerUsageRecorded = true
  const calls = await runFailureScenario({ error: nonRetryable })
  const update = calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
  assert.strictEqual(update.params[2], 'failed')
  assert(!calls.some((call) => call.sql.includes('INSERT INTO ai_provider_usage')))

  const logInsert = calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
  assert.strictEqual(JSON.parse(logInsert.params[9]).nextStatus, 'failed')
}

async function testExecutionLogAndProviderUsageHelpersCastJsonb() {
  const calls = []
  const client = {
    async query(sql, params = []) {
      calls.push({ sql, params })
      return { rows: [{ id: 'inserted' }], rowCount: 1 }
    },
  }

  await writeExecutionLog({
    workspaceId: null,
    userId: undefined,
    taskId,
    jobId,
    level: 'info',
    event: null,
    message: 'typed log',
    metadata: null,
  }, client)
  await recordProviderUsage({
    workspaceId: undefined,
    provider: 'openai',
    model: null,
    operation: 'responses.create',
    promptTokens: undefined,
    metadata: { nested: true },
  }, client)

  const logInsert = calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
  assert(logInsert.sql.includes('$10::jsonb'))
  assertJsonParam(logInsert.params[9], {})

  const usageInsert = calls.find((call) => call.sql.includes('INSERT INTO ai_provider_usage'))
  assert(usageInsert.sql.includes('workspace_id, user_id, task_id, provider, model, operation'))
  assert(!usageInsert.sql.includes('model_name'))
  assert(usageInsert.sql.includes('$14::jsonb'))
  assert.strictEqual(usageInsert.params[1], null)
  assert.strictEqual(usageInsert.params[6], 0)
  assertJsonParam(usageInsert.params[13], { nested: true })
  assertNoUndefinedParams(calls)
}

Promise.resolve()
  .then(testCompleteJobUsesTypedPersistenceQueries)
  .then(testFailJobRetryingUsesTypedPersistenceQueries)
  .then(testFailJobDeadLetteredUsesTypedPersistenceQueries)
  .then(testFailJobNonRetryableUsesTypedPersistenceQueries)
  .then(testExecutionLogAndProviderUsageHelpersCastJsonb)
  .then(() => console.log('aiExecutionRunnerOpenAiPersistence tests passed'))
