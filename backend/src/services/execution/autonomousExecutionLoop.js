const os = require('os')
const pool = require('../../db/pool')
const aiExecutionRunnerService = require('./aiExecutionRunnerService')
const { writeExecutionLog } = require('./executionLogService')
const aiSequenceOrchestratorService = require('../aiSequenceOrchestratorService')

const LOOP_LOG_PREFIX = '[autonomous-execution-loop]'
const DEFAULT_QUEUE_NAME = process.env.AI_EXECUTION_QUEUE_NAME || 'ai-execution'
const DEFAULT_POLL_INTERVAL_MS = 2000
const DEFAULT_MAX_PARALLEL = 4
const HEARTBEAT_TTL_MS = 15000
const POLL_LOCK_TTL_MS = 10000
const RECOVERY_LOCK_TTL_MS = 30000
const THROUGHPUT_WINDOW_MS = 5 * 60 * 1000

function logLoop(event, fields = {}) {
  console.log(`${LOOP_LOG_PREFIX} ${event}`, fields)
}

function warnLoop(event, fields = {}) {
  console.warn(`${LOOP_LOG_PREFIX} ${event}`, fields)
}

function normalizePositiveInteger(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : fallback
}

function isBackgroundLoopEnabled() {
  return String(process.env.AI_EXECUTION_ENABLE_BACKGROUND_LOOP || 'true').toLowerCase() !== 'false'
}

function getPollIntervalMs() {
  return normalizePositiveInteger(process.env.AI_EXECUTION_POLL_INTERVAL_MS, DEFAULT_POLL_INTERVAL_MS)
}

function getMaxParallel() {
  return normalizePositiveInteger(process.env.AI_EXECUTION_MAX_PARALLEL || process.env.AI_MAX_CONCURRENT_JOBS, DEFAULT_MAX_PARALLEL)
}

function getWorkerNodeName() {
  return String(process.env.AI_WORKER_NODE_NAME || '').trim() || `${os.hostname()}-${process.pid}`
}

function createRunId() {
  return `${getWorkerNodeName()}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function safeJsonb(value) {
  return JSON.stringify(value ?? {})
}

function normalizeDbParams(params = []) {
  return params.map((param) => (param === undefined ? null : param))
}

async function query(dbClient, queryText, params = []) {
  return dbClient.query(queryText, normalizeDbParams(params))
}

function createRedisClient({ redisUrl = process.env.REDIS_URL } = {}) {
  const url = String(redisUrl || '').trim()
  if (!url) return null

  let Redis
  try {
    Redis = require('ioredis')
  } catch (error) {
    warnLoop('redis client unavailable', { error: error.message })
    return null
  }

  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      return Math.min(times * 250, 2000)
    },
  })

  client.on('error', (error) => {
    warnLoop('redis error', { error: error.message })
  })

  return client
}

async function connectRedis(redisClient) {
  if (!redisClient) return { connected: false, reason: 'not_configured' }
  try {
    if (redisClient.status === 'ready') return { connected: true }
    await redisClient.connect()
    return { connected: true }
  } catch (error) {
    warnLoop('redis unavailable', { error: error.message })
    return { connected: false, reason: error.message }
  }
}

function isRedisConnected(redisClient) {
  return Boolean(redisClient && redisClient.status === 'ready')
}

async function withRedisLock(redisClient, key, ttlMs, fn) {
  if (!isRedisConnected(redisClient)) {
    return fn({ acquired: false, degraded: true })
  }

  const token = createRunId()
  let acquired = false
  try {
    const result = await redisClient.set(key, token, 'PX', ttlMs, 'NX')
    acquired = result === 'OK'
    if (!acquired) return { skipped: true, reason: 'lock_not_acquired' }
    return await fn({ acquired: true, degraded: false, token })
  } catch (error) {
    warnLoop('redis lock degraded', { key, error: error.message })
    return fn({ acquired: false, degraded: true, error })
  } finally {
    if (acquired) {
      try {
        const currentToken = await redisClient.get(key)
        if (currentToken === token) await redisClient.del(key)
      } catch (error) {
        warnLoop('redis lock release failed', { key, error: error.message })
      }
    }
  }
}

class AutonomousExecutionLoop {
  constructor({
    queueName = DEFAULT_QUEUE_NAME,
    pollIntervalMs = getPollIntervalMs(),
    maxParallel = getMaxParallel(),
    redisClient = createRedisClient(),
    runnerService = aiExecutionRunnerService,
  } = {}) {
    this.queueName = queueName
    this.pollIntervalMs = pollIntervalMs
    this.maxParallel = maxParallel
    this.redisClient = redisClient
    this.runnerService = runnerService
    this.worker = null
    this.timer = null
    this.running = false
    this.polling = false
    this.activeJobs = new Set()
    this.completedTimestamps = []
  }

  async start() {
    if (this.running) return this
    if (!isBackgroundLoopEnabled()) {
      logLoop('disabled', { queueName: this.queueName })
      return this
    }

    const redisState = await connectRedis(this.redisClient)
    this.worker = await this.runnerService.registerWorkerNode()
    this.running = true
    await this.writeHeartbeat(redisState)
    logLoop('started', { queueName: this.queueName, workerNodeId: this.worker.id, maxParallel: this.maxParallel, redisConnected: redisState.connected })
    this.schedule(0)
    return this
  }

  async stop() {
    this.running = false
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    if (this.redisClient) {
      try {
        await this.redisClient.quit()
      } catch (error) {
        if (typeof this.redisClient.disconnect === 'function') this.redisClient.disconnect()
      }
    }
    return this
  }

  schedule(delayMs = this.pollIntervalMs) {
    if (!this.running) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.poll().catch((error) => warnLoop('poll failed', { error: error.message }))
    }, delayMs)
    if (typeof this.timer.unref === 'function') this.timer.unref()
  }

  async writeHeartbeat(redisState = null) {
    if (!this.worker) return
    if (isRedisConnected(this.redisClient)) {
      await this.redisClient.set(
        `ai-execution:worker:${this.worker.id}:heartbeat`,
        JSON.stringify({ workerNodeId: this.worker.id, queueName: this.queueName, activeJobs: this.activeJobs.size, hostname: os.hostname(), pid: process.pid, at: new Date().toISOString() }),
        'PX',
        HEARTBEAT_TTL_MS
      )
    }
    await query(pool,
      `UPDATE worker_nodes
          SET heartbeat_at = NOW(),
              current_concurrency = $2::integer,
              max_concurrency = $3::integer,
              metadata = metadata || $4::jsonb,
              updated_at = NOW()
        WHERE id = $1::uuid`,
      [this.worker.id, this.activeJobs.size, this.maxParallel, safeJsonb({ redisConnected: redisState ? redisState.connected : isRedisConnected(this.redisClient), backgroundLoop: true })]
    )
  }

  async poll() {
    if (!this.running || this.polling) return
    this.polling = true
    try {
      logLoop('polling', { queueName: this.queueName, activeJobs: this.activeJobs.size, maxParallel: this.maxParallel })
      await this.writeHeartbeat()
      await withRedisLock(this.redisClient, `ai-execution:${this.queueName}:recovery-lock`, RECOVERY_LOCK_TTL_MS, () => recoverStuckJobs({ queueName: this.queueName }))
      await withRedisLock(this.redisClient, `ai-execution:${this.queueName}:sequence-orchestrator-lock`, POLL_LOCK_TTL_MS, () => aiSequenceOrchestratorService.enqueueDueSequenceSteps({ queueName: this.queueName }))
        .catch((error) => warnLoop('sequence orchestrator skipped', { error: error.message }))

      while (this.running && this.activeJobs.size < this.maxParallel) {
        const dispatch = await withRedisLock(this.redisClient, `ai-execution:${this.queueName}:dispatch-lock`, POLL_LOCK_TTL_MS, () => this.dispatchOne())
        if (!dispatch || dispatch.skipped || !dispatch.dispatched) break
      }
    } finally {
      this.polling = false
      this.schedule()
    }
  }

  async dispatchOne() {
    const claimed = await this.runnerService.claimNextJob({ queueName: this.queueName, workerNode: this.worker })
    if (!claimed.job) return { dispatched: false, reason: claimed.reason }

    const jobId = claimed.job.id
    this.activeJobs.add(jobId)
    logLoop('job dispatched', { jobId, queueName: claimed.job.queue_name, workerNodeId: (claimed.worker || this.worker).id })

    this.executeClaimedJob(claimed).catch((error) => {
      warnLoop('dispatch execution error', { jobId, error: error.message })
    })

    return { dispatched: true, jobId }
  }

  async executeClaimedJob(claimed) {
    const worker = claimed.worker || this.worker
    const job = claimed.job
    const startedAt = new Date()
    try {
      const result = await this.runnerService._private.executeJob(job)
      const completed = await this.runnerService._private.completeJob({ job, worker, result, startedAt })
      if (completed.completed) {
        this.completedTimestamps.push(Date.now())
        this.completedTimestamps = this.completedTimestamps.filter((timestamp) => timestamp >= Date.now() - THROUGHPUT_WINDOW_MS)
        logLoop('job completed', { jobId: completed.job.id, queueName: completed.job.queue_name, workerNodeId: worker.id })
      }
    } catch (error) {
      const failed = await this.runnerService._private.failJob({ job, worker, error, startedAt })
      logLoop('job failed', { jobId: job.id, queueName: job.queue_name, workerNodeId: worker.id, nextStatus: failed.nextStatus, error: this.runnerService._private.getSafeErrorMessage(error) })
      if (failed.nextStatus === 'retrying') {
        logLoop('retry scheduled', { jobId: job.id, queueName: job.queue_name, workerNodeId: worker.id })
      }
    } finally {
      this.activeJobs.delete(job.id)
      await this.writeHeartbeat().catch((error) => warnLoop('heartbeat failed', { error: error.message }))
    }
  }

  getThroughputPerMinute() {
    const cutoff = Date.now() - THROUGHPUT_WINDOW_MS
    this.completedTimestamps = this.completedTimestamps.filter((timestamp) => timestamp >= cutoff)
    return Number((this.completedTimestamps.length / (THROUGHPUT_WINDOW_MS / 60000)).toFixed(2))
  }
}

async function recoverStuckJobs({ queueName = DEFAULT_QUEUE_NAME, retryDelaySeconds = 30 } = {}) {
  const client = await pool.connect()
  try {
    await query(client, 'BEGIN')
    const stuckResult = await query(client,
      `SELECT *
         FROM ai_execution_jobs
        WHERE status = 'running'
          AND timeout_at IS NOT NULL
          AND timeout_at < NOW()
          AND queue_name = $1::text
        FOR UPDATE SKIP LOCKED`,
      [queueName]
    )

    const recovered = []
    for (const job of stuckResult.rows) {
      const nextAttemptCount = Number(job.attempt_count || 0) + 1
      const nextStatus = nextAttemptCount >= Number(job.max_attempts || 1) ? 'dead_lettered' : 'retrying'
      const updateResult = await query(client,
        `UPDATE ai_execution_jobs
            SET status = $2::text,
                attempt_count = $3::integer,
                error_message = 'Job recovered after execution timeout',
                locked_by = NULL,
                locked_at = NULL,
                heartbeat_at = NOW(),
                timeout_at = NULL,
                run_after = CASE WHEN $2::text = 'retrying' THEN NOW() + ($4::integer * INTERVAL '1 second') ELSE run_after END,
                updated_at = NOW()
          WHERE id = $1::uuid
          RETURNING *`,
        [job.id, nextStatus, nextAttemptCount, retryDelaySeconds]
      )
      const updatedJob = updateResult.rows[0]

      if (job.locked_by) {
        await query(client,
          `UPDATE worker_nodes
              SET current_concurrency = GREATEST(current_concurrency - 1, 0),
                  updated_at = NOW()
            WHERE id = $1::uuid`,
          [job.locked_by]
        )
      }

      if (nextStatus === 'dead_lettered') {
        await query(client,
          `INSERT INTO dead_letter_queue(
             workspace_id, source_queue, source_job_id, task_id, reason,
             error_message, payload, attempts
           ) VALUES($1::uuid,$2::text,$3::uuid,$4::uuid,$5::text,$6::text,$7::jsonb,$8::integer)`,
          [job.workspace_id, job.queue_name, job.id, job.task_id, 'execution_timeout', 'Job recovered after execution timeout', safeJsonb(job.payload), nextAttemptCount]
        )
      }

      await writeExecutionLog({
        workspaceId: job.workspace_id,
        userId: job.user_id,
        taskId: job.task_id,
        jobId: job.id,
        level: nextStatus === 'dead_lettered' ? 'error' : 'warn',
        event: nextStatus === 'dead_lettered' ? 'job_dead_lettered' : 'job_retry_scheduled',
        message: nextStatus === 'dead_lettered' ? 'Stuck AI execution job dead-lettered' : 'Stuck AI execution job scheduled for retry',
        metadata: { queueName: job.queue_name, previousWorkerNodeId: job.locked_by, attemptCount: nextAttemptCount, recovery: true },
      }, client)

      await query(client,
        `INSERT INTO worker_metrics(worker_node_id, queue_name, metric_name, metric_value, labels)
         VALUES($1::uuid, $2::text, $3::text, 1, $4::jsonb)`,
        [job.locked_by, job.queue_name, nextStatus === 'dead_lettered' ? 'job_dead_lettered' : 'job_retry_scheduled', safeJsonb({ recovery: true })]
      )

      recovered.push(updatedJob)
      if (nextStatus === 'retrying') logLoop('retry scheduled', { jobId: job.id, queueName: job.queue_name, recovery: true })
      if (nextStatus === 'dead_lettered') logLoop('job failed', { jobId: job.id, queueName: job.queue_name, nextStatus, recovery: true })
    }

    await query(client, 'COMMIT')
    return { recoveredCount: recovered.length, jobs: recovered }
  } catch (error) {
    await query(client, 'ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function getLiveStatus({ queueName = null, redisClient = null, loop = null } = {}) {
  const normalizedQueue = queueName || null
  const params = []
  const filters = []
  if (normalizedQueue) {
    params.push(normalizedQueue)
    filters.push(`queue_name = $${params.length}::text`)
  }
  const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : ''

  const countsResult = await query(pool,
    `SELECT status, COUNT(*)::integer AS count
       FROM ai_execution_jobs
       ${whereSql}
      GROUP BY status`,
    params
  )
  const counts = { queued: 0, retrying: 0, running: 0, completed: 0, failed: 0, cancelled: 0, dead_lettered: 0 }
  countsResult.rows.forEach((row) => { counts[row.status] = Number(row.count || 0) })

  const workersResult = await query(pool,
    `SELECT COUNT(*)::integer AS online
       FROM worker_nodes
      WHERE status = 'online'
        AND heartbeat_at >= NOW() - INTERVAL '30 seconds'`
  )

  const deadLetterResult = await query(pool,
    `SELECT COUNT(*)::integer AS count FROM dead_letter_queue WHERE resolved_at IS NULL`
  )

  const metricsResult = await query(pool,
    `WITH recent AS (
       SELECT metric_name, metric_value
         FROM worker_metrics
        WHERE measured_at >= NOW() - INTERVAL '5 minutes'
          ${normalizedQueue ? `AND queue_name = $1::text` : ''}
     )
     SELECT
       COALESCE(SUM(metric_value) FILTER (WHERE metric_name = 'job_completed'), 0)::numeric AS jobs_completed,
       COALESCE(SUM(metric_value) FILTER (WHERE metric_name = 'job_failed'), 0)::numeric AS jobs_failed,
       COALESCE(AVG(metric_value) FILTER (WHERE metric_name = 'job_latency_ms'), 0)::numeric AS avg_latency_ms,
       COALESCE(SUM(metric_value) FILTER (WHERE metric_name IN ('job_retry_scheduled')), 0)::numeric AS retries
       FROM recent`,
    normalizedQueue ? [normalizedQueue] : []
  )
  const metrics = metricsResult.rows[0] || {}
  const jobsCompleted = Number(metrics.jobs_completed || 0)
  const jobsFailed = Number(metrics.jobs_failed || 0)
  const retries = Number(metrics.retries || 0)

  return {
    workersOnline: Number((workersResult.rows[0] || {}).online || 0),
    activeJobs: counts.running,
    queuedJobs: counts.queued,
    retryingJobs: counts.retrying,
    deadLetterCount: Number((deadLetterResult.rows[0] || {}).count || counts.dead_lettered || 0),
    redis: { connected: isRedisConnected(redisClient || (loop && loop.redisClient)) },
    executionThroughput: loop ? loop.getThroughputPerMinute() : jobsCompleted / 5,
    workerMetrics: {
      jobs_completed: jobsCompleted,
      jobs_failed: jobsFailed,
      avg_latency_ms: Number(metrics.avg_latency_ms || 0),
      queue_depth: counts.queued + counts.retrying,
      retry_rate: jobsCompleted + jobsFailed > 0 ? Number((retries / (jobsCompleted + jobsFailed)).toFixed(4)) : 0,
    },
    counts,
    queueName: normalizedQueue,
  }
}

let singletonLoop = null

async function startAutonomousExecutionLoop(options = {}) {
  if (singletonLoop) return singletonLoop
  singletonLoop = new AutonomousExecutionLoop(options)
  try {
    await singletonLoop.start()
  } catch (error) {
    warnLoop('startup failed', { error: error.message })
  }
  return singletonLoop
}

function getAutonomousExecutionLoop() {
  return singletonLoop
}

module.exports = {
  AutonomousExecutionLoop,
  connectRedis,
  createRedisClient,
  getAutonomousExecutionLoop,
  getLiveStatus,
  isRedisConnected,
  recoverStuckJobs,
  startAutonomousExecutionLoop,
  _private: {
    DEFAULT_QUEUE_NAME,
    HEARTBEAT_TTL_MS,
    POLL_LOCK_TTL_MS,
    RECOVERY_LOCK_TTL_MS,
    getMaxParallel,
    getPollIntervalMs,
    isBackgroundLoopEnabled,
    withRedisLock,
  },
}
