const assert = require('assert')

const pool = require('../src/db/pool')
const aiExecutionRunnerService = require('../src/services/execution/aiExecutionRunnerService')
const autonomousExecutionLoop = require('../src/services/execution/autonomousExecutionLoop')

function createClient(handler) {
  const calls = []
  return {
    calls,
    async query(sql, params = []) {
      calls.push({ sql, params })
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 }
      return handler(sql, params, calls)
    },
    release() {},
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

async function withMockPoolQuery(handler, fn) {
  const calls = []
  const originalQuery = pool.query
  pool.query = async (sql, params = []) => {
    calls.push({ sql, params })
    return handler(sql, params, calls)
  }
  try {
    const result = await fn(calls)
    return { result, calls }
  } finally {
    pool.query = originalQuery
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

function assertNoUndefinedParams(calls) {
  for (const call of calls) {
    call.params.forEach((param, index) => assert.notStrictEqual(param, undefined, `Unexpected undefined param ${index + 1} for SQL: ${call.sql}`))
  }
}

function createRedisMock({ connected = true, lockResult = 'OK' } = {}) {
  return {
    status: connected ? 'ready' : 'end',
    calls: [],
    async connect() {
      if (!connected) throw new Error('redis down')
      this.status = 'ready'
    },
    async set(...args) {
      this.calls.push({ command: 'set', args })
      return lockResult
    },
    async get() {
      return null
    },
    async del(...args) {
      this.calls.push({ command: 'del', args })
      return 1
    },
    async quit() {
      this.status = 'end'
    },
  }
}

async function testAutonomousExecutionDispatchesCompletedJob() {
  const job = { id: 'job-1', queue_name: 'ai-execution', job_type: 'internal_test_execution', attempt_count: 1 }
  const completedJob = { ...job, status: 'completed' }
  const runnerService = {
    ...aiExecutionRunnerService,
    async registerWorkerNode() { return { id: 'worker-1' } },
    async claimNextJob() { return { worker: { id: 'worker-1' }, job } },
    _private: {
      ...aiExecutionRunnerService._private,
      async executeJob(executedJob) { return { ok: true, jobId: executedJob.id } },
      async completeJob({ job: completed }) { return { completed: true, job: completedJob || completed } },
      async failJob() { throw new Error('failJob should not be called') },
      getSafeErrorMessage: aiExecutionRunnerService._private.getSafeErrorMessage,
    },
  }

  await withMockPoolQuery((sql) => {
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  }, async () => {
    const loop = new autonomousExecutionLoop.AutonomousExecutionLoop({ redisClient: createRedisMock(), runnerService, maxParallel: 1, pollIntervalMs: 100000 })
    loop.worker = { id: 'worker-1' }
    loop.running = true
    await loop.dispatchOne()
    await new Promise((resolve) => setTimeout(resolve, 20))
    assert.strictEqual(loop.activeJobs.size, 0)
    assert.strictEqual(loop.getThroughputPerMinute(), 0.2)
    loop.running = false
  })
}

async function testRedisDisconnectRecoveryFallsBackToPostgres() {
  let dispatched = false
  const runnerService = {
    ...aiExecutionRunnerService,
    async registerWorkerNode() { return { id: 'worker-redis-down' } },
    async claimNextJob() { dispatched = true; return { worker: { id: 'worker-redis-down' }, job: null, reason: 'no_claimable_job' } },
  }
  const recoveryClient = createClient((sql) => {
    if (sql.includes('SELECT *') && sql.includes('ai_execution_jobs')) return { rows: [], rowCount: 0 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })
  await withMockPoolConnect(recoveryClient, async () => {
    await withMockPoolQuery((sql) => {
      if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
      throw new Error(`Unhandled SQL: ${sql}`)
    }, async () => {
      const loop = new autonomousExecutionLoop.AutonomousExecutionLoop({ redisClient: createRedisMock({ connected: false }), runnerService, maxParallel: 1, pollIntervalMs: 100000 })
      loop.worker = { id: 'worker-redis-down' }
      loop.running = true
      await loop.poll()
      loop.running = false
      assert.strictEqual(dispatched, true)
    })
  })
}

async function testRecoverStuckJobSchedulesRetry() {
  const stuckJob = {
    id: '11111111-1111-4111-8111-111111111111',
    workspace_id: null,
    user_id: null,
    task_id: null,
    queue_name: 'ai-execution',
    payload: { test: true },
    attempt_count: 1,
    max_attempts: 3,
    locked_by: '22222222-2222-4222-8222-222222222222',
  }
  const client = createClient((sql) => {
    if (sql.includes('SELECT *') && sql.includes('ai_execution_jobs')) return { rows: [stuckJob], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [{ ...stuckJob, status: 'retrying', attempt_count: 2 }], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'log-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })

  await withMockPoolConnect(client, async () => {
    const result = await autonomousExecutionLoop.recoverStuckJobs({ queueName: 'ai-execution', retryDelaySeconds: 5 })
    assert.strictEqual(result.recoveredCount, 1)
  })
  const update = client.calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
  assert.strictEqual(update.params[1], 'retrying')
  assert.strictEqual(update.params[2], 2)
  assertNoUndefinedParams(client.calls)
}

async function testRecoverStuckJobDeadLettersAfterMaxAttempts() {
  const stuckJob = {
    id: '33333333-3333-4333-8333-333333333333',
    workspace_id: null,
    user_id: null,
    task_id: null,
    queue_name: 'ai-execution',
    payload: { test: true },
    attempt_count: 2,
    max_attempts: 3,
    locked_by: '44444444-4444-4444-8444-444444444444',
  }
  const client = createClient((sql) => {
    if (sql.includes('SELECT *') && sql.includes('ai_execution_jobs')) return { rows: [stuckJob], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [{ ...stuckJob, status: 'dead_lettered', attempt_count: 3 }], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO dead_letter_queue')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'log-1' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  })

  await withMockPoolConnect(client, async () => {
    const result = await autonomousExecutionLoop.recoverStuckJobs({ queueName: 'ai-execution', retryDelaySeconds: 5 })
    assert.strictEqual(result.recoveredCount, 1)
  })
  const update = client.calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
  assert.strictEqual(update.params[1], 'dead_lettered')
  assert(client.calls.some((call) => call.sql.includes('INSERT INTO dead_letter_queue')))
  assertNoUndefinedParams(client.calls)
}

async function testRetryHandlingFromFailedExecution() {
  const retryError = new Error('temporary failure')
  const job = { id: 'job-retry', queue_name: 'ai-execution', job_type: 'internal_test_execution' }
  const runnerService = {
    ...aiExecutionRunnerService,
    async registerWorkerNode() { return { id: 'worker-retry' } },
    async claimNextJob() { return { worker: { id: 'worker-retry' }, job } },
    _private: {
      ...aiExecutionRunnerService._private,
      async executeJob() { throw retryError },
      async completeJob() { throw new Error('completeJob should not be called') },
      async failJob() { return { failed: true, nextStatus: 'retrying', job: { ...job, status: 'retrying' } } },
      getSafeErrorMessage: aiExecutionRunnerService._private.getSafeErrorMessage,
    },
  }

  await withMockPoolQuery((sql) => {
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  }, async () => {
    const loop = new autonomousExecutionLoop.AutonomousExecutionLoop({ redisClient: createRedisMock(), runnerService, maxParallel: 1, pollIntervalMs: 100000 })
    loop.worker = { id: 'worker-retry' }
    loop.running = true
    await loop.dispatchOne()
    await new Promise((resolve) => setTimeout(resolve, 20))
    assert.strictEqual(loop.activeJobs.size, 0)
    loop.running = false
  })
}

async function testLiveStatusIncludesRequiredMetrics() {
  await withMockPoolQuery((sql) => {
    if (sql.includes('FROM ai_execution_jobs')) return { rows: [{ status: 'queued', count: 2 }, { status: 'retrying', count: 1 }, { status: 'running', count: 3 }], rowCount: 3 }
    if (sql.includes('FROM worker_nodes')) return { rows: [{ online: 2 }], rowCount: 1 }
    if (sql.includes('FROM dead_letter_queue')) return { rows: [{ count: 4 }], rowCount: 1 }
    if (sql.includes('WITH recent')) return { rows: [{ jobs_completed: 10, jobs_failed: 2, avg_latency_ms: 125, retries: 1 }], rowCount: 1 }
    throw new Error(`Unhandled SQL: ${sql}`)
  }, async () => {
    const status = await autonomousExecutionLoop.getLiveStatus({ redisClient: createRedisMock(), queueName: 'ai-execution' })
    assert.strictEqual(status.workersOnline, 2)
    assert.strictEqual(status.activeJobs, 3)
    assert.strictEqual(status.queuedJobs, 2)
    assert.strictEqual(status.retryingJobs, 1)
    assert.strictEqual(status.deadLetterCount, 4)
    assert.strictEqual(status.redis.connected, true)
    assert.strictEqual(status.workerMetrics.jobs_completed, 10)
    assert.strictEqual(status.workerMetrics.retry_rate, 0.0833)
  })
}

async function run() {
  await withEnv({ AI_EXECUTION_ENABLE_BACKGROUND_LOOP: 'true' }, async () => {
    await testAutonomousExecutionDispatchesCompletedJob()
    await testRedisDisconnectRecoveryFallsBackToPostgres()
    await testRecoverStuckJobSchedulesRetry()
    await testRecoverStuckJobDeadLettersAfterMaxAttempts()
    await testRetryHandlingFromFailedExecution()
    await testLiveStatusIncludesRequiredMetrics()
  })
  console.log('autonomousExecutionLoop tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
