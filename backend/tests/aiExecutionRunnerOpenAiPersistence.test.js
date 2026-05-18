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


function createJsonResponse(status, body) {
  return {
    status,
    async text() {
      return JSON.stringify(body)
    },
    headers: {
      get(name) {
        return String(name).toLowerCase() === 'content-type' ? 'application/json' : null
      },
    },
  }
}

async function withMockFetch(responseFactory, fn) {
  const originalFetch = global.fetch
  global.fetch = async (url, options) => responseFactory(url, options)
  try {
    return await fn()
  } finally {
    global.fetch = originalFetch
  }
}

async function withEnv(updates, fn) {
  const originals = {}
  for (const key of Object.keys(updates)) {
    originals[key] = process.env[key]
    if (updates[key] === undefined) delete process.env[key]
    else process.env[key] = updates[key]
  }
  try {
    return await fn()
  } finally {
    for (const key of Object.keys(updates)) {
      if (originals[key] === undefined) delete process.env[key]
      else process.env[key] = originals[key]
    }
  }
}

async function withMockPool(queryHandler, clients, fn) {
  const originalQuery = pool.query
  const originalConnect = pool.connect
  const directCalls = []
  pool.query = async (sql, params = []) => {
    directCalls.push({ sql, params })
    return queryHandler(sql, params, directCalls)
  }
  pool.connect = async () => {
    const client = clients.shift()
    if (!client) throw new Error('No mock client available')
    return client
  }
  try {
    const result = await fn({ directCalls })
    return { result, directCalls }
  } finally {
    pool.query = originalQuery
    pool.connect = originalConnect
  }
}


async function testEnqueueOpenAiJobNormalizesNullModelWithoutUndefinedParams() {
  const calls = []
  const originalQuery = pool.query
  pool.query = async (sql, params = []) => {
    calls.push({ sql, params })
    if (sql.includes('INSERT INTO ai_execution_jobs')) {
      return {
        rows: [{ id: jobId, payload: JSON.parse(params[3]) }],
        rowCount: 1,
      }
    }
    throw new Error(`Unhandled enqueue SQL: ${sql}`)
  }
  try {
    const job = await runner.enqueueOpenAiTextGenerationJob({ payload: { prompt: 'Hello', model: null, system: undefined } })
    assert.strictEqual(job.payload.model, null)
    assert.strictEqual(job.payload.system, null)
  } finally {
    pool.query = originalQuery
  }

  const insertCall = calls.find((call) => call.sql.includes('INSERT INTO ai_execution_jobs'))
  assert(insertCall.sql.includes('$2::text'))
  assert(insertCall.sql.includes('$4::jsonb'))
  assertJsonParam(insertCall.params[3], {
    source: 'api',
    createdFor: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
    prompt: 'Hello',
    system: null,
    model: null,
    maxOutputTokens: 900,
    temperature: 0.7,
  })
  assertNoUndefinedParams(calls)
}

async function testRunOnceCompletesOpenAiJobWithNullModelAndTypedPersistence() {
  const queueName = 'ai-execution'
  const worker = {
    id: workerId,
    node_name: 'test-node',
    status: 'online',
    queues: [queueName],
    max_concurrency: 4,
    current_concurrency: 0,
  }
  const queuedJob = {
    id: jobId,
    workspace_id: workspaceId,
    user_id: userId,
    task_id: taskId,
    queue_name: queueName,
    job_type: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
    payload: { prompt: 'Hello', system: null, model: null },
    attempt_count: 1,
    previous_status: 'queued',
  }
  const completedJob = { ...queuedJob, status: 'completed', result: { ok: true } }

  const claimClient = createClient(async (sql) => {
    if (sql.includes('INSERT INTO worker_nodes')) return { rows: [worker], rowCount: 1 }
    if (sql.includes('SELECT * FROM worker_nodes')) return { rows: [worker], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [queuedJob], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'claim-log' }], rowCount: 1 }
    if (sql.includes('INSERT INTO task_execution_history')) return { rows: [{ id: 'claim-history' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled claim SQL: ${sql}`)
  })
  const completeClient = createClient(async (sql) => {
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [completedJob], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'complete-log' }], rowCount: 1 }
    if (sql.includes('INSERT INTO task_execution_history')) return { rows: [{ id: 'complete-history' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled complete SQL: ${sql}`)
  })

  await withEnv({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4.1-mini' }, async () => {
    await withMockFetch((url, options) => {
      const requestPayload = JSON.parse(options.body)
      assert.strictEqual(requestPayload.model, 'gpt-4.1-mini')
      assert.strictEqual(Object.prototype.hasOwnProperty.call(requestPayload, 'instructions'), false)
      return createJsonResponse(200, {
        id: 'resp-null-model',
        output_text: 'Saved result',
        usage: { input_tokens: 5, output_tokens: 7, total_tokens: 12 },
      })
    }, async () => {
      const { result, directCalls } = await withMockPool((sql) => {
        if (sql.includes('INSERT INTO worker_nodes')) return { rows: [worker], rowCount: 1 }
        if (sql.includes('INSERT INTO ai_provider_usage')) return { rows: [{ id: 'usage-null-model' }], rowCount: 1 }
        throw new Error(`Unhandled direct SQL: ${sql}`)
      }, [claimClient, completeClient], async () => runner.runOnce({ queueName }))

      assert.strictEqual(result.claimed, true)
      assert.strictEqual(result.completed, true)
      assert.strictEqual(result.job.status, 'completed')
      assert.strictEqual(result.result.text, 'Saved result')
      assert.strictEqual(result.result.model, 'gpt-4.1-mini')

      const usageInsert = directCalls.find((call) => call.sql.includes('INSERT INTO ai_provider_usage'))
      assert(usageInsert, 'expected provider usage insert')
      assert(usageInsert.sql.includes('$5::text'))
      assert(usageInsert.sql.includes('$14::jsonb'))
      assert.strictEqual(usageInsert.params[4], 'gpt-4.1-mini')
      assertJsonParam(usageInsert.params[13], { responseId: 'resp-null-model' })

      const completeUpdate = completeClient.calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
      assert(completeUpdate.sql.includes('result = $3::jsonb'))
      const savedResult = JSON.parse(completeUpdate.params[2])
      assert.strictEqual(savedResult.model, 'gpt-4.1-mini')
      assert.strictEqual(savedResult.text, 'Saved result')

      const executionLogInserts = [
        ...claimClient.calls.filter((call) => call.sql.includes('INSERT INTO execution_logs')),
        ...completeClient.calls.filter((call) => call.sql.includes('INSERT INTO execution_logs')),
      ]
      assert.strictEqual(executionLogInserts.length, 2)
      executionLogInserts.forEach((call) => assert(call.sql.includes('$10::jsonb')))
      assertNoUndefinedParams([...directCalls, ...claimClient.calls, ...completeClient.calls])
    })
  })
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
    providerCostUsd: '0.125',
    status: 'retrying',
    metadata: { nested: true, optional: undefined },
  }, client)

  const logInsert = calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
  assert(logInsert.sql.includes('$10::jsonb'))
  assertJsonParam(logInsert.params[9], {})

  const usageInsert = calls.find((call) => call.sql.includes('INSERT INTO ai_provider_usage'))
  assert(usageInsert.sql.includes('workspace_id, user_id, task_id, provider, model, operation'))
  assert(!usageInsert.sql.includes('model_name'))
  assert(usageInsert.sql.includes('$10::numeric'))
  assert(usageInsert.sql.includes('$14::jsonb'))
  assert.strictEqual(usageInsert.params[1], null)
  assert.strictEqual(usageInsert.params[6], 0)
  assert.strictEqual(usageInsert.params[9], 0.125)
  assert.strictEqual(usageInsert.params[12], 'failed')
  assertJsonParam(usageInsert.params[13], { nested: true, optional: null })
  assertNoUndefinedParams(calls)
}

Promise.resolve()
  .then(testCompleteJobUsesTypedPersistenceQueries)
  .then(testFailJobRetryingUsesTypedPersistenceQueries)
  .then(testFailJobDeadLetteredUsesTypedPersistenceQueries)
  .then(testFailJobNonRetryableUsesTypedPersistenceQueries)
  .then(testEnqueueOpenAiJobNormalizesNullModelWithoutUndefinedParams)
  .then(testRunOnceCompletesOpenAiJobWithNullModelAndTypedPersistence)
  .then(testExecutionLogAndProviderUsageHelpersCastJsonb)
  .then(() => console.log('aiExecutionRunnerOpenAiPersistence tests passed'))
