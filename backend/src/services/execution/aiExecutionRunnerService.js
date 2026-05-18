const os = require('os')
const pool = require('../../db/pool')
const { writeExecutionLog } = require('./executionLogService')
const { recordProviderUsage } = require('./providerUsageService')
const { OpenAiProvider } = require('../../providers/openAiProvider')

const RUNNER_LOG_PREFIX = '[ai-execution-runner]'
const DEFAULT_QUEUES = ['default', 'priority', 'ai-execution']
const DEFAULT_QUEUE_NAME = process.env.AI_EXECUTION_QUEUE_NAME || 'ai-execution'
const DEFAULT_JOB_TIMEOUT_SECONDS = Number(process.env.AI_EXECUTION_JOB_TIMEOUT_SECONDS || 300)
const OPENAI_TEXT_GENERATION_JOB_TYPE = 'openai_text_generation'
const DEFAULT_OPENAI_TEXT_PROMPT = 'Напиши короткий безопасный follow-up для CRM лида на русском языке.'
const MANAGER_SAFE_OPENAI_ERROR = 'OpenAI text generation could not be completed safely. Please check provider configuration or try again later.'

function getWorkerNodeName() {
  return String(process.env.AI_WORKER_NODE_NAME || '').trim() || os.hostname()
}

function getMaxConcurrency() {
  const value = Number(process.env.AI_MAX_CONCURRENT_JOBS || 4)
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : 4
}

function normalizeQueueName(queueName) {
  return String(queueName || DEFAULT_QUEUE_NAME).trim() || DEFAULT_QUEUE_NAME
}

function normalizePositiveInteger(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : fallback
}

function logRunner(event, fields = {}) {
  console.log(`${RUNNER_LOG_PREFIX} ${event}`, fields)
}

function getSafeErrorMessage(error) {
  return String(error?.safeMessage || error?.managerSafeMessage || error?.message || error || 'AI execution job failed').trim()
}

function getTechnicalErrorMessage(error) {
  return String(error?.technicalMessage || error?.message || error || 'Unknown execution error').trim()
}

function isOpenAiApiKeyConfigured() {
  const value = String(process.env.OPENAI_API_KEY || '').trim()
  return Boolean(value) && value !== 'replace_me'
}

function createManagerSafeExecutionError(safeMessage, technicalMessage, options = {}) {
  const error = new Error(safeMessage)
  error.safeMessage = safeMessage
  error.technicalMessage = technicalMessage || safeMessage
  if (options.nonRetryable) error.nonRetryable = true
  if (options.provider) error.provider = options.provider
  if (options.operation) error.operation = options.operation
  if (options.model) error.model = options.model
  return error
}

function sanitizeOpenAiTextPayload(payload = {}) {
  const prompt = String(payload.prompt || DEFAULT_OPENAI_TEXT_PROMPT).trim()
  const system = typeof payload.system === 'string' && payload.system.trim() ? payload.system.trim() : null
  const model = typeof payload.model === 'string' && payload.model.trim() ? payload.model.trim() : undefined
  const maxOutputTokens = normalizePositiveInteger(payload.maxOutputTokens || payload.max_output_tokens, 900)
  const temperatureValue = Number(payload.temperature)
  const temperature = Number.isFinite(temperatureValue) ? temperatureValue : 0.7
  return { prompt: prompt || DEFAULT_OPENAI_TEXT_PROMPT, system, model, maxOutputTokens, temperature }
}

async function registerWorkerNode(client = pool) {
  const nodeName = getWorkerNodeName()
  const maxConcurrency = getMaxConcurrency()
  const result = await client.query(
    `INSERT INTO worker_nodes(
       node_name, node_type, status, queues, max_concurrency, current_concurrency,
       heartbeat_at, started_at, stopped_at, metadata, updated_at
     ) VALUES($1, 'general', 'online', $2::text[], $3, 0, NOW(), NOW(), NULL, $4, NOW())
     ON CONFLICT (node_name) DO UPDATE SET
       node_type = 'general',
       status = 'online',
       queues = EXCLUDED.queues,
       max_concurrency = EXCLUDED.max_concurrency,
       heartbeat_at = NOW(),
       stopped_at = NULL,
       metadata = worker_nodes.metadata || EXCLUDED.metadata,
       updated_at = NOW()
     RETURNING *`,
    [
      nodeName,
      DEFAULT_QUEUES,
      maxConcurrency,
      {
        pid: process.pid,
        hostname: os.hostname(),
        service: 'ai-execution-runner',
      },
    ]
  )
  const worker = result.rows[0]
  logRunner('worker registered', { workerNodeId: worker.id, nodeName: worker.node_name })
  return worker
}

async function insertWorkerMetric({ workerNodeId, queueName, metricName, metricValue, labels = {} }, client = pool) {
  await client.query(
    `INSERT INTO worker_metrics(worker_node_id, queue_name, metric_name, metric_value, labels)
     VALUES($1, $2, $3, $4, $5)`,
    [workerNodeId || null, queueName, metricName, metricValue, labels]
  )
}

async function writeTaskHistory({ job, workerNodeId, previousStatus, nextStatus, latencyMs, errorMessage, metadata = {} }, client = pool) {
  if (!job.task_id) return null
  const result = await client.query(
    `INSERT INTO task_execution_history(
       task_id, workspace_id, user_id, previous_status, next_status, worker_node_id,
       attempt, latency_ms, error_message, metadata
     ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      job.task_id,
      job.workspace_id || null,
      job.user_id || null,
      previousStatus || null,
      nextStatus,
      workerNodeId || null,
      job.attempt_count || 1,
      latencyMs || null,
      errorMessage || null,
      metadata,
    ]
  )
  return result.rows[0]
}

async function claimNextJob({ queueName = DEFAULT_QUEUE_NAME, workerNode } = {}) {
  const client = await pool.connect()
  const normalizedQueueName = normalizeQueueName(queueName)
  try {
    await client.query('BEGIN')
    const worker = workerNode || await registerWorkerNode(client)
    const workerLockResult = await client.query(
      `SELECT * FROM worker_nodes WHERE id = $1 FOR UPDATE`,
      [worker.id]
    )
    const lockedWorker = workerLockResult.rows[0]
    if (!lockedWorker || lockedWorker.status !== 'online') {
      await client.query('COMMIT')
      return { worker: lockedWorker || worker, job: null, reason: 'worker_unavailable' }
    }
    if (!lockedWorker.queues.includes(normalizedQueueName)) {
      await client.query('COMMIT')
      return { worker: lockedWorker, job: null, reason: 'queue_not_supported' }
    }
    if (lockedWorker.current_concurrency >= lockedWorker.max_concurrency) {
      await client.query('COMMIT')
      return { worker: lockedWorker, job: null, reason: 'max_concurrency_reached' }
    }

    const timeoutSeconds = normalizePositiveInteger(DEFAULT_JOB_TIMEOUT_SECONDS, 300)
    const claimResult = await client.query(
      `WITH next_job AS (
         SELECT id, status AS previous_status
           FROM ai_execution_jobs
          WHERE queue_name = $1
            AND status IN ('queued', 'retrying')
            AND run_after <= NOW()
          ORDER BY priority ASC, run_after ASC, created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
       )
       UPDATE ai_execution_jobs jobs
          SET status = 'running',
              locked_by = $2,
              locked_at = NOW(),
              heartbeat_at = NOW(),
              timeout_at = NOW() + ($3::text || ' seconds')::interval,
              attempt_count = jobs.attempt_count + 1,
              error_message = NULL,
              updated_at = NOW()
         FROM next_job
        WHERE jobs.id = next_job.id
        RETURNING jobs.*, next_job.previous_status`,
      [normalizedQueueName, lockedWorker.id, timeoutSeconds]
    )

    if (claimResult.rowCount === 0) {
      await client.query(
        `UPDATE worker_nodes
            SET heartbeat_at = NOW(), updated_at = NOW()
          WHERE id = $1`,
        [lockedWorker.id]
      )
      await client.query('COMMIT')
      return { worker: lockedWorker, job: null, reason: 'no_claimable_job' }
    }

    const job = claimResult.rows[0]
    await client.query(
      `UPDATE worker_nodes
          SET current_concurrency = current_concurrency + 1,
              heartbeat_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [lockedWorker.id]
    )
    await writeExecutionLog({
      workspaceId: job.workspace_id,
      userId: job.user_id,
      taskId: job.task_id,
      jobId: job.id,
      level: 'info',
      event: 'job_claimed',
      message: 'AI execution job claimed',
      metadata: { queueName: normalizedQueueName, workerNodeId: lockedWorker.id, attempt: job.attempt_count },
    }, client)
    await writeTaskHistory({ job, workerNodeId: lockedWorker.id, previousStatus: job.previous_status, nextStatus: 'running' }, client)
    await insertWorkerMetric({ workerNodeId: lockedWorker.id, queueName: normalizedQueueName, metricName: 'job_claimed', metricValue: 1 }, client)
    await client.query('COMMIT')
    logRunner('job claimed', { jobId: job.id, queueName: normalizedQueueName, workerNodeId: lockedWorker.id })
    return { worker: lockedWorker, job }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function executeInternalTestJob(job) {
  return {
    ok: true,
    jobId: job.id,
    jobType: job.job_type,
    queueName: job.queue_name,
    attempt: job.attempt_count,
    payload: job.payload || {},
    completedAt: new Date().toISOString(),
  }
}

async function executeOpenAiTextGenerationJob(job) {
  const payload = sanitizeOpenAiTextPayload(job.payload || {})
  const provider = new OpenAiProvider({ model: payload.model })
  const model = payload.model || provider.model
  const metadata = {
    workspaceId: job.workspace_id,
    userId: job.user_id,
    taskId: job.task_id,
    jobId: job.id,
    traceId: `ai-execution-job-${job.id}`,
  }

  if (!isOpenAiApiKeyConfigured()) {
    throw createManagerSafeExecutionError(
      'OpenAI provider is not configured for execution.',
      'OPENAI_API_KEY is missing or set to replace_me',
      { nonRetryable: true, provider: 'openai', operation: 'responses.create', model }
    )
  }

  try {
    const response = await provider.createResponse({
      input: payload.prompt,
      instructions: payload.system || undefined,
      model,
      temperature: payload.temperature,
      maxOutputTokens: payload.maxOutputTokens,
      metadata,
    })

    return {
      ok: true,
      jobId: job.id,
      jobType: job.job_type,
      provider: response.provider,
      model: response.model,
      responseId: response.id,
      text: response.text,
      usage: response.usage,
      latencyMs: response.latencyMs,
      startedAt: response.startedAt,
      completedAt: new Date().toISOString(),
    }
  } catch (error) {
    if (error.safeMessage) throw error
    const safeError = createManagerSafeExecutionError(
      MANAGER_SAFE_OPENAI_ERROR,
      error && error.message ? error.message : String(error),
      { provider: 'openai', operation: 'responses.create', model }
    )
    safeError.providerUsageRecorded = true
    throw safeError
  }
}

async function executeJob(job) {
  if (job.job_type === 'internal_test_execution') {
    return executeInternalTestJob(job)
  }
  if (job.job_type === OPENAI_TEXT_GENERATION_JOB_TYPE) {
    return executeOpenAiTextGenerationJob(job)
  }
  const error = new Error(`Unsupported AI execution job type: ${job.job_type}`)
  error.nonRetryable = true
  throw error
}

async function completeJob({ job, worker, result, startedAt }) {
  const client = await pool.connect()
  const latencyMs = Date.now() - startedAt.getTime()
  try {
    await client.query('BEGIN')
    const updateResult = await client.query(
      `UPDATE ai_execution_jobs
          SET status = 'completed',
              result = $3,
              error_message = NULL,
              completed_at = NOW(),
              heartbeat_at = NOW(),
              timeout_at = NULL,
              updated_at = NOW()
        WHERE id = $1
          AND status = 'running'
          AND locked_by = $2
        RETURNING *`,
      [job.id, worker.id, result]
    )
    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { job, completed: false, reason: 'job_not_owned_or_not_running' }
    }
    const completedJob = updateResult.rows[0]
    await client.query(
      `UPDATE worker_nodes
          SET current_concurrency = GREATEST(current_concurrency - 1, 0),
              heartbeat_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [worker.id]
    )
    await writeExecutionLog({
      workspaceId: completedJob.workspace_id,
      userId: completedJob.user_id,
      taskId: completedJob.task_id,
      jobId: completedJob.id,
      level: 'info',
      event: 'job_completed',
      message: 'AI execution job completed',
      metadata: { workerNodeId: worker.id, latencyMs, result },
    }, client)
    await writeTaskHistory({ job: completedJob, workerNodeId: worker.id, previousStatus: 'running', nextStatus: 'completed', latencyMs }, client)
    await insertWorkerMetric({ workerNodeId: worker.id, queueName: completedJob.queue_name, metricName: 'job_completed', metricValue: 1, labels: { jobType: completedJob.job_type } }, client)
    await client.query('COMMIT')
    logRunner('job completed', { jobId: completedJob.id, queueName: completedJob.queue_name, workerNodeId: worker.id })
    return { job: completedJob, completed: true }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function failJob({ job, worker, error, startedAt }) {
  const client = await pool.connect()
  const latencyMs = Date.now() - startedAt.getTime()
  const message = getSafeErrorMessage(error)
  const technicalError = getTechnicalErrorMessage(error)
  try {
    await client.query('BEGIN')
    const freshResult = await client.query(
      `SELECT * FROM ai_execution_jobs
        WHERE id = $1 AND status = 'running' AND locked_by = $2
        FOR UPDATE`,
      [job.id, worker.id]
    )
    if (freshResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return { job, failed: false, reason: 'job_not_owned_or_not_running' }
    }
    const freshJob = freshResult.rows[0]
    let nextStatus = 'retrying'
    let runAfterSql = `NOW() + (LEAST(300, POWER(2, GREATEST($5 - 1, 0)))::text || ' seconds')::interval`
    if (error && error.nonRetryable) {
      nextStatus = 'failed'
      runAfterSql = 'run_after'
    } else if (freshJob.attempt_count >= freshJob.max_attempts) {
      nextStatus = 'dead_lettered'
      runAfterSql = 'run_after'
    }

    const updateResult = await client.query(
      `UPDATE ai_execution_jobs
          SET status = $3,
              error_message = $4,
              locked_by = NULL,
              locked_at = NULL,
              heartbeat_at = NOW(),
              timeout_at = NULL,
              run_after = ${runAfterSql},
              updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [freshJob.id, worker.id, nextStatus, message, freshJob.attempt_count]
    )
    const failedJob = updateResult.rows[0]

    if (nextStatus === 'dead_lettered') {
      await client.query(
        `INSERT INTO dead_letter_queue(
           workspace_id, source_queue, source_job_id, task_id, reason,
           error_message, payload, attempts
         ) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          failedJob.workspace_id || null,
          failedJob.queue_name,
          failedJob.id,
          failedJob.task_id || null,
          'max_attempts_exhausted',
          message,
          failedJob.payload || {},
          failedJob.attempt_count,
        ]
      )
    }

    await client.query(
      `UPDATE worker_nodes
          SET current_concurrency = GREATEST(current_concurrency - 1, 0),
              heartbeat_at = NOW(),
              updated_at = NOW()
        WHERE id = $1`,
      [worker.id]
    )
    await writeExecutionLog({
      workspaceId: failedJob.workspace_id,
      userId: failedJob.user_id,
      taskId: failedJob.task_id,
      jobId: failedJob.id,
      level: 'error',
      event: 'job_failed',
      message: 'AI execution job failed',
      metadata: { workerNodeId: worker.id, latencyMs, nextStatus, error: technicalError, safeError: message },
    }, client)
    await writeTaskHistory({ job: failedJob, workerNodeId: worker.id, previousStatus: 'running', nextStatus, latencyMs, errorMessage: message }, client)
    if (failedJob.job_type === OPENAI_TEXT_GENERATION_JOB_TYPE && !error?.providerUsageRecorded) {
      await recordProviderUsage({
        workspaceId: failedJob.workspace_id,
        userId: failedJob.user_id,
        taskId: failedJob.task_id,
        provider: 'openai',
        model: error?.model || (failedJob.payload || {}).model || process.env.OPENAI_MODEL || null,
        operation: error?.operation || 'responses.create',
        latencyMs,
        status: 'failed',
        metadata: { jobId: failedJob.id, nextStatus, safeError: message },
      }, client)
    }
    await insertWorkerMetric({ workerNodeId: worker.id, queueName: failedJob.queue_name, metricName: 'job_failed', metricValue: 1, labels: { jobType: failedJob.job_type, nextStatus } }, client)
    await client.query('COMMIT')
    logRunner('job failed', { jobId: failedJob.id, queueName: failedJob.queue_name, workerNodeId: worker.id, nextStatus, error: message })
    return { job: failedJob, failed: true, nextStatus }
  } catch (failureError) {
    await client.query('ROLLBACK')
    throw failureError
  } finally {
    client.release()
  }
}

async function runOnce({ queueName = DEFAULT_QUEUE_NAME } = {}) {
  const worker = await registerWorkerNode()
  const claimed = await claimNextJob({ queueName, workerNode: worker })
  if (!claimed.job) {
    return { worker: claimed.worker || worker, job: null, claimed: false, reason: claimed.reason }
  }

  const startedAt = new Date()
  try {
    const result = await executeJob(claimed.job)
    const completed = await completeJob({ job: claimed.job, worker: claimed.worker || worker, result, startedAt })
    return { worker: claimed.worker || worker, job: completed.job, claimed: true, completed: completed.completed, result }
  } catch (error) {
    const failed = await failJob({ job: claimed.job, worker: claimed.worker || worker, error, startedAt })
    return { worker: claimed.worker || worker, job: failed.job, claimed: true, completed: false, failed: true, nextStatus: failed.nextStatus, error: getSafeErrorMessage(error) }
  }
}

async function enqueueInternalTestJob({ queueName = DEFAULT_QUEUE_NAME, priority = 100, payload = {}, idempotencyKey = null } = {}) {
  const normalizedQueueName = normalizeQueueName(queueName)
  const result = await pool.query(
    `INSERT INTO ai_execution_jobs(queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
     VALUES($1, 'internal_test_execution', $2, 'queued', $3, $4, NOW(), $5)
     ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
     RETURNING *`,
    [
      normalizedQueueName,
      Number.isFinite(Number(priority)) ? Math.trunc(Number(priority)) : 100,
      { source: 'api', createdFor: 'internal_test_execution', ...payload },
      normalizePositiveInteger(payload.maxAttempts, 3),
      idempotencyKey,
    ]
  )
  if (result.rowCount > 0) return result.rows[0]
  if (!idempotencyKey) return null
  const existing = await pool.query(
    `SELECT * FROM ai_execution_jobs WHERE workspace_id IS NULL AND idempotency_key = $1 LIMIT 1`,
    [idempotencyKey]
  )
  return existing.rows[0] || null
}

async function enqueueOpenAiTextGenerationJob({ queueName = DEFAULT_QUEUE_NAME, priority = 100, payload = {}, idempotencyKey = null } = {}) {
  const normalizedQueueName = normalizeQueueName(queueName)
  const normalizedPayload = {
    source: 'api',
    createdFor: OPENAI_TEXT_GENERATION_JOB_TYPE,
    ...sanitizeOpenAiTextPayload(payload),
  }
  const result = await pool.query(
    `INSERT INTO ai_execution_jobs(queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
     VALUES($1, $2, $3, 'queued', $4, $5, NOW(), $6)
     ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
     RETURNING *`,
    [
      normalizedQueueName,
      OPENAI_TEXT_GENERATION_JOB_TYPE,
      Number.isFinite(Number(priority)) ? Math.trunc(Number(priority)) : 100,
      normalizedPayload,
      normalizePositiveInteger(payload.maxAttempts || payload.max_attempts, 3),
      idempotencyKey,
    ]
  )
  if (result.rowCount > 0) return result.rows[0]
  if (!idempotencyKey) return null
  const existing = await pool.query(
    `SELECT * FROM ai_execution_jobs WHERE workspace_id IS NULL AND idempotency_key = $1 LIMIT 1`,
    [idempotencyKey]
  )
  return existing.rows[0] || null
}

async function getHealth({ queueName = null } = {}) {
  const worker = await registerWorkerNode()
  const filters = []
  const params = []
  if (queueName) {
    params.push(normalizeQueueName(queueName))
    filters.push(`queue_name = $${params.length}`)
  }
  const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const countResult = await pool.query(
    `SELECT status, COUNT(*)::integer AS count
       FROM ai_execution_jobs
       ${whereSql}
      GROUP BY status`
    , params)
  const counts = {
    queued: 0,
    retrying: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    dead_lettered: 0,
  }
  countResult.rows.forEach((row) => {
    counts[row.status] = Number(row.count || 0)
  })
  return {
    status: 'ok',
    worker,
    counts,
    queueName: queueName ? normalizeQueueName(queueName) : null,
  }
}

module.exports = {
  claimNextJob,
  enqueueInternalTestJob,
  enqueueOpenAiTextGenerationJob,
  getHealth,
  registerWorkerNode,
  runOnce,
  _private: {
    DEFAULT_OPENAI_TEXT_PROMPT,
    OPENAI_TEXT_GENERATION_JOB_TYPE,
    executeOpenAiTextGenerationJob,
    getSafeErrorMessage,
    isOpenAiApiKeyConfigured,
    sanitizeOpenAiTextPayload,
  },
}
