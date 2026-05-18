const os = require('os')
const pool = require('../../db/pool')
const { writeExecutionLog } = require('./executionLogService')
const { normalizeDbValue, recordProviderUsage } = require('./providerUsageService')
const { OpenAiProvider } = require('../../providers/openAiProvider')
const { redactForExecutionLog } = require('./redaction')
const { containsForbiddenCustomerCopy } = require('../customerCopyGuard')
const { sanitizeAiActionPayload, sanitizeAiCopy } = require('../../utils/aiCopySanitizer')

const RUNNER_LOG_PREFIX = '[ai-execution-runner]'
const DEFAULT_QUEUES = ['default', 'priority', 'ai-execution']
const DEFAULT_QUEUE_NAME = process.env.AI_EXECUTION_QUEUE_NAME || 'ai-execution'
const DEFAULT_JOB_TIMEOUT_SECONDS = Number(process.env.AI_EXECUTION_JOB_TIMEOUT_SECONDS || 300)
const OPENAI_TEXT_GENERATION_JOB_TYPE = 'openai_text_generation'
const SALES_FOLLOWUP_GENERATION_JOB_TYPE = 'sales_followup_generation'
const DEFAULT_OPENAI_TEXT_PROMPT = 'Напиши короткий безопасный follow-up для CRM лида на русском языке.'
const MANAGER_SAFE_OPENAI_ERROR = 'OpenAI text generation could not be completed safely. Please check provider configuration or try again later.'
const SALES_FOLLOWUP_SYSTEM_PROMPT = 'Ты AI sales assistant. Пиши короткий безопасный follow-up. Не выдумывай факты. Не раскрывай внутренний контекст.'
const SALES_FOLLOWUP_SAFE_ERROR = 'AI Sales follow-up could not be generated safely. Please review the lead and try again later.'
const SALES_FOLLOWUP_MAX_CHARS = 600

function safeJsonb(value) {
  return JSON.stringify(normalizeDbValue(value ?? {}) ?? {})
}

function safeJson(value) {
  return safeJsonb(value)
}

function normalizeDbParams(params = []) {
  return params.map((param) => (param === undefined ? null : param))
}

async function query(dbClient, queryText, params = []) {
  return dbClient.query(queryText, normalizeDbParams(params))
}

function normalizeNullableText(value) {
  if (value === undefined || value === null) return null
  const normalized = String(value).trim()
  return normalized || null
}

function getWorkerNodeName() {
  return String(process.env.AI_WORKER_NODE_NAME || '').trim() || os.hostname()
}

function getMaxConcurrency() {
  const value = Number(process.env.AI_EXECUTION_MAX_PARALLEL || process.env.AI_MAX_CONCURRENT_JOBS || 4)
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
  const system = normalizeNullableText(payload.system)
  const model = normalizeNullableText(payload.model)
  const maxOutputTokens = normalizePositiveInteger(payload.maxOutputTokens || payload.max_output_tokens, 900)
  const temperatureValue = Number(payload.temperature)
  const temperature = Number.isFinite(temperatureValue) ? temperatureValue : 0.7
  return { prompt: prompt || DEFAULT_OPENAI_TEXT_PROMPT, system, model, maxOutputTokens, temperature }
}

function normalizeSalesFollowupChannel(channel) {
  const normalized = String(channel || '').trim().toLowerCase()
  return normalized === 'email' ? 'email' : 'telegram'
}

function sanitizeSalesFollowupPayload(payload = {}) {
  const leadId = normalizeNullableText(payload.leadId || payload.lead_id)
  const channel = normalizeSalesFollowupChannel(payload.channel)
  const tone = normalizeNullableText(payload.tone) || 'professional'
  const language = normalizeNullableText(payload.language) || 'ru'
  const model = normalizeNullableText(payload.model)
  return { leadId, channel, tone, language, model }
}

function sanitizeShortContextText(value, maxLength = 280) {
  return String(value || '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/Контекст\s*:|Плюсы\s*:|Минусы\s*:|Итог\s*:|ai_score|ai_priority|ai_risk_level/ig, '')
    .replace(/\+\d+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function sanitizeCustomerMessage(text) {
  const raw = String(text || '').replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!raw) return ''
  const unsafePatterns = [
    /Контекст\s*:/ig,
    /Плюсы\s*:/ig,
    /Минусы\s*:/ig,
    /Итог\s*:/ig,
    /ai_score/ig,
    /ai_priority/ig,
    /ai_risk_level/ig,
  ]
  let sanitized = raw
  unsafePatterns.forEach((pattern) => { sanitized = sanitized.replace(pattern, '') })
  sanitized = sanitized
    .replace(/\b(aiScore|aiPriority|aiRiskLevel|aiScoringReason)\b/ig, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (sanitized.length > SALES_FOLLOWUP_MAX_CHARS) sanitized = sanitized.slice(0, SALES_FOLLOWUP_MAX_CHARS).trim()
  return sanitized
}

function assertSafeSalesFollowupMessage(text, context = {}) {
  const customerText = sanitizeCustomerMessage(text)
  if (!customerText || containsForbiddenCustomerCopy(customerText)) {
    console.warn('[ai-sales-worker] unsafe follow-up blocked', context)
    throw createManagerSafeExecutionError(
      SALES_FOLLOWUP_SAFE_ERROR,
      'Generated follow-up failed customer copy safety checks',
      { nonRetryable: true, provider: 'openai', operation: 'responses.create' }
    )
  }
  return customerText
}

function normalizeLeadForPrompt(lead = {}) {
  return {
    name: sanitizeShortContextText(lead.name, 120),
    company: sanitizeShortContextText(lead.company, 120),
    status: sanitizeShortContextText(lead.status || lead.stage, 80),
    source: sanitizeShortContextText(lead.source, 80),
    nextStep: sanitizeShortContextText(lead.next_step, 160),
  }
}

function buildSalesFollowupPrompt({ lead, timelineEvents = [], telegramMessages = [], emailMessages = [], channel, tone, language }) {
  const safeLead = normalizeLeadForPrompt(lead)
  const recentTimeline = timelineEvents.slice(0, 5).map((event) => ({
    type: sanitizeShortContextText(event.event_type, 80),
    title: sanitizeShortContextText(event.title, 120),
    body: sanitizeShortContextText(event.body, 180),
  }))
  const recentTelegram = telegramMessages.slice(0, 5).map((message) => ({
    direction: sanitizeShortContextText(message.direction || message.role, 40),
    text: sanitizeShortContextText(message.body || message.message, 180),
  }))
  const recentEmail = emailMessages.slice(0, 5).map((message) => ({
    status: sanitizeShortContextText(message.status, 40),
    subject: sanitizeShortContextText(message.subject, 120),
    text: sanitizeShortContextText(message.text_body || message.error, 180),
  }))
  return [
    `Создай только текст сообщения клиенту. Канал: ${channel}. Тон: ${tone}. Язык: ${language}.`,
    `Лид: ${JSON.stringify(safeLead)}`,
    `Недавние события CRM: ${JSON.stringify(recentTimeline)}`,
    `Недавние Telegram сообщения: ${JSON.stringify(recentTelegram)}`,
    `Недавние email сообщения: ${JSON.stringify(recentEmail)}`,
    'Не добавляй заголовки, анализ, внутренние оценки или пояснения. Максимум 600 символов.',
  ].join('\n')
}

async function loadSalesFollowupLead(job, payload) {
  const params = [payload.leadId]
  let workspaceFilter = ''
  if (job.workspace_id) {
    params.push(job.workspace_id)
    workspaceFilter = ` AND workspace_id = $${params.length}::uuid`
  }
  const result = await query(pool,
    `SELECT id, workspace_id, user_id, name, email, company, status, stage, source, next_step, metadata,
            telegram_chat_id, telegram_username, first_name, last_name, last_message_at
       FROM crm_leads
      WHERE id = $1::uuid${workspaceFilter}
      LIMIT 1`,
    params
  )
  return result.rows[0] || null
}

async function loadSalesFollowupContext(lead) {
  const [timeline, telegram, email] = await Promise.all([
    query(pool,
      `SELECT event_type, title, body, source, created_at
         FROM lead_timeline_events
        WHERE workspace_id = $1::uuid AND lead_id = $2::uuid
        ORDER BY created_at DESC
        LIMIT 5`,
      [lead.workspace_id, lead.id]
    ).catch(() => ({ rows: [] })),
    query(pool,
      `SELECT role, direction, COALESCE(body, message) AS body, created_at
         FROM telegram_messages
        WHERE workspace_id = $1::uuid AND lead_id = $2::uuid
        ORDER BY created_at DESC
        LIMIT 5`,
      [lead.workspace_id, lead.id]
    ).catch(() => ({ rows: [] })),
    query(pool,
      `SELECT status, subject, text_body, error, created_at
         FROM email_messages
        WHERE workspace_id = $1::uuid AND lead_id = $2::uuid
        ORDER BY created_at DESC
        LIMIT 5`,
      [lead.workspace_id, lead.id]
    ).catch(() => ({ rows: [] })),
  ])
  return { timelineEvents: timeline.rows || [], telegramMessages: telegram.rows || [], emailMessages: email.rows || [] }
}

async function registerWorkerNode(client = pool) {
  const nodeName = getWorkerNodeName()
  const maxConcurrency = getMaxConcurrency()
  const result = await query(client,
    `INSERT INTO worker_nodes(
       node_name, node_type, status, queues, max_concurrency, current_concurrency,
       heartbeat_at, started_at, stopped_at, metadata, updated_at
     ) VALUES($1::text, 'general', 'online', $2::text[], $3::integer, 0, NOW(), NOW(), NULL, $4::jsonb, NOW())
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
      safeJsonb({
        pid: process.pid,
        hostname: os.hostname(),
        service: 'ai-execution-runner',
      }),
    ]
  )
  const worker = result.rows[0]
  logRunner('worker registered', { workerNodeId: worker.id, nodeName: worker.node_name })
  return worker
}

async function insertWorkerMetric({ workerNodeId, queueName, metricName, metricValue, labels = {} }, client = pool) {
  await query(client,
    `INSERT INTO worker_metrics(worker_node_id, queue_name, metric_name, metric_value, labels)
     VALUES($1::uuid, $2::text, $3::text, $4::numeric, $5::jsonb)`,
    [normalizeDbValue(workerNodeId), normalizeDbValue(queueName), normalizeDbValue(metricName), Number(metricValue ?? 0), safeJsonb(labels)]
  )
}

async function writeTaskHistory({ job, workerNodeId, previousStatus, nextStatus, latencyMs, errorMessage, metadata = {} }, client = pool) {
  if (!job.task_id) return null
  const result = await query(client,
    `INSERT INTO task_execution_history(
       task_id, workspace_id, user_id, previous_status, next_status, worker_node_id,
       attempt, latency_ms, error_message, metadata
     ) VALUES($1::uuid,$2::uuid,$3::uuid,$4::text,$5::text,$6::uuid,$7::integer,$8::integer,$9::text,$10::jsonb)
     RETURNING id`,
    [
      job.task_id,
      normalizeDbValue(job.workspace_id),
      normalizeDbValue(job.user_id),
      normalizeDbValue(previousStatus),
      normalizeDbValue(nextStatus),
      normalizeDbValue(workerNodeId),
      job.attempt_count || 1,
      normalizeDbValue(latencyMs || null),
      normalizeDbValue(errorMessage),
      safeJsonb(metadata),
    ]
  )
  return result.rows[0]
}

async function claimNextJob({ queueName = DEFAULT_QUEUE_NAME, workerNode } = {}) {
  const client = await pool.connect()
  const normalizedQueueName = normalizeQueueName(queueName)
  try {
    await query(client, 'BEGIN')
    const worker = workerNode || await registerWorkerNode(client)
    const workerLockResult = await query(client,
      `SELECT * FROM worker_nodes WHERE id = $1::uuid FOR UPDATE`,
      [worker.id]
    )
    const lockedWorker = workerLockResult.rows[0]
    if (!lockedWorker || lockedWorker.status !== 'online') {
      await query(client, 'COMMIT')
      return { worker: lockedWorker || worker, job: null, reason: 'worker_unavailable' }
    }
    if (!lockedWorker.queues.includes(normalizedQueueName)) {
      await query(client, 'COMMIT')
      return { worker: lockedWorker, job: null, reason: 'queue_not_supported' }
    }
    if (lockedWorker.current_concurrency >= lockedWorker.max_concurrency) {
      await query(client, 'COMMIT')
      return { worker: lockedWorker, job: null, reason: 'max_concurrency_reached' }
    }

    const timeoutSeconds = normalizePositiveInteger(DEFAULT_JOB_TIMEOUT_SECONDS, 300)
    const claimResult = await query(client,
      `WITH next_job AS (
         SELECT id, status AS previous_status
           FROM ai_execution_jobs
          WHERE queue_name = $1::text
            AND status IN ('queued', 'retrying')
            AND run_after <= NOW()
          ORDER BY priority ASC, run_after ASC, created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT 1
       )
       UPDATE ai_execution_jobs jobs
          SET status = 'running',
              locked_by = $2::uuid,
              locked_at = NOW(),
              heartbeat_at = NOW(),
              timeout_at = NOW() + ($3::integer * INTERVAL '1 second'),
              attempt_count = jobs.attempt_count + 1,
              error_message = NULL,
              updated_at = NOW()
         FROM next_job
        WHERE jobs.id = next_job.id
        RETURNING jobs.*, next_job.previous_status`,
      [normalizedQueueName, lockedWorker.id, timeoutSeconds]
    )

    if (claimResult.rowCount === 0) {
      await query(client,
        `UPDATE worker_nodes
            SET heartbeat_at = NOW(), updated_at = NOW()
          WHERE id = $1::uuid`,
        [lockedWorker.id]
      )
      await query(client, 'COMMIT')
      return { worker: lockedWorker, job: null, reason: 'no_claimable_job' }
    }

    const job = claimResult.rows[0]
    await query(client,
      `UPDATE worker_nodes
          SET current_concurrency = current_concurrency + 1,
              heartbeat_at = NOW(),
              updated_at = NOW()
        WHERE id = $1::uuid`,
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
    await query(client, 'COMMIT')
    logRunner('job claimed', { jobId: job.id, queueName: normalizedQueueName, workerNodeId: lockedWorker.id })
    return { worker: lockedWorker, job }
  } catch (error) {
    await query(client, 'ROLLBACK')
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


async function executeSalesFollowupGenerationJob(job) {
  const payload = sanitizeSalesFollowupPayload(job.payload || {})
  if (!payload.leadId) {
    throw createManagerSafeExecutionError(
      'AI Sales follow-up requires a leadId.',
      'sales_followup_generation payload.leadId is missing',
      { nonRetryable: true }
    )
  }

  const lead = await loadSalesFollowupLead(job, payload)
  if (!lead) {
    throw createManagerSafeExecutionError(
      'Lead was not found for AI Sales follow-up.',
      `crm_leads row not found for leadId=${payload.leadId}`,
      { nonRetryable: true }
    )
  }

  const provider = new OpenAiProvider({ model: payload.model })
  const model = payload.model || provider.model
  if (!isOpenAiApiKeyConfigured()) {
    throw createManagerSafeExecutionError(
      'OpenAI provider is not configured for AI Sales follow-up.',
      'OPENAI_API_KEY is missing or set to replace_me',
      { nonRetryable: true, provider: 'openai', operation: 'responses.create', model }
    )
  }

  const context = await loadSalesFollowupContext(lead)
  const prompt = buildSalesFollowupPrompt({ lead, ...context, channel: payload.channel, tone: payload.tone, language: payload.language })
  const metadata = {
    workspaceId: lead.workspace_id || job.workspace_id,
    userId: job.user_id || lead.user_id,
    taskId: job.task_id,
    jobId: job.id,
    traceId: `ai-sales-followup-${job.id}`,
  }

  try {
    const response = await provider.createResponse({
      input: prompt,
      instructions: SALES_FOLLOWUP_SYSTEM_PROMPT,
      model,
      temperature: 0.3,
      maxOutputTokens: 260,
      metadata,
    })
    const customerText = assertSafeSalesFollowupMessage(response.text, { jobId: job.id, leadId: lead.id, channel: payload.channel })
    const actionType = payload.channel === 'email' ? 'email_followup_draft' : 'telegram_reply_draft'
    const recommendation = sanitizeAiCopy('AI Sales подготовил короткий follow-up. Проверьте текст и отправьте клиенту после одобрения.')
    return {
      ok: true,
      jobId: job.id,
      jobType: job.job_type,
      provider: response.provider,
      model: response.model,
      responseId: response.id,
      text: customerText,
      usage: response.usage,
      latencyMs: response.latencyMs,
      startedAt: response.startedAt,
      completedAt: new Date().toISOString(),
      aiWorkerQueueDraft: {
        workspaceId: lead.workspace_id || job.workspace_id,
        userId: job.user_id || lead.user_id,
        leadId: lead.id,
        leadName: lead.name,
        actionType,
        title: `AI Sales follow-up — ${lead.name || 'lead'}`,
        recommendation,
        payload: sanitizeAiActionPayload({
          customerText,
          leadId: lead.id,
          channel: payload.channel,
          source: SALES_FOLLOWUP_GENERATION_JOB_TYPE,
          executionJobId: job.id,
        }),
      },
    }
  } catch (error) {
    if (error.safeMessage) throw error
    const safeError = createManagerSafeExecutionError(
      SALES_FOLLOWUP_SAFE_ERROR,
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
  if (job.job_type === SALES_FOLLOWUP_GENERATION_JOB_TYPE) {
    return executeSalesFollowupGenerationJob(job)
  }
  const error = new Error(`Unsupported AI execution job type: ${job.job_type}`)
  error.nonRetryable = true
  throw error
}

async function completeJob({ job, worker, result, startedAt }) {
  const client = await pool.connect()
  const latencyMs = Date.now() - startedAt.getTime()
  try {
    await query(client, 'BEGIN')
    const persistedResult = { ...(result || {}) }
    const queueDraft = persistedResult.aiWorkerQueueDraft || null
    delete persistedResult.aiWorkerQueueDraft
    if (queueDraft) {
      const workerResult = await query(client,
        `INSERT INTO ai_workers(workspace_id, name, type, status, mode, description)
         VALUES($1::uuid, 'AI Sales Worker', 'ai_sdr_agent', 'active', 'approval_required', 'Готовит безопасные follow-up черновики для менеджерского одобрения.')
         ON CONFLICT (workspace_id, type) DO UPDATE SET
           name = EXCLUDED.name,
           status = 'active',
           mode = 'approval_required',
           description = EXCLUDED.description,
           updated_at = NOW()
         RETURNING id`,
        [queueDraft.workspaceId]
      )
      const queueResult = await query(client,
        `INSERT INTO ai_worker_queue(worker_id, workspace_id, lead_id, action_type, status, title, recommendation, payload)
         VALUES($1::uuid, $2::uuid, $3::uuid, $4::text, 'pending_approval', $5::text, $6::text, $7::jsonb)
         RETURNING id`,
        [workerResult.rows[0].id, queueDraft.workspaceId, queueDraft.leadId, queueDraft.actionType, queueDraft.title, queueDraft.recommendation, safeJsonb(queueDraft.payload)]
      )
      persistedResult.aiWorkerQueueId = queueResult.rows[0]?.id || null
    }

    const updateResult = await query(client,
      `UPDATE ai_execution_jobs
          SET status = 'completed',
              result = $3::jsonb,
              error_message = NULL,
              completed_at = NOW(),
              heartbeat_at = NOW(),
              timeout_at = NULL,
              updated_at = NOW()
        WHERE id = $1::uuid
          AND status = 'running'
          AND locked_by = $2::uuid
        RETURNING *`,
      [job.id, worker.id, safeJsonb(persistedResult)]
    )
    if (updateResult.rowCount === 0) {
      await query(client, 'ROLLBACK')
      return { job, completed: false, reason: 'job_not_owned_or_not_running' }
    }
    const completedJob = updateResult.rows[0]
    await query(client,
      `UPDATE worker_nodes
          SET current_concurrency = GREATEST(current_concurrency - 1, 0),
              heartbeat_at = NOW(),
              updated_at = NOW()
        WHERE id = $1::uuid`,
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
      metadata: redactForExecutionLog({ workerNodeId: worker.id, latencyMs, result: persistedResult }),
    }, client)
    await writeTaskHistory({ job: completedJob, workerNodeId: worker.id, previousStatus: 'running', nextStatus: 'completed', latencyMs }, client)
    await insertWorkerMetric({ workerNodeId: worker.id, queueName: completedJob.queue_name, metricName: 'job_completed', metricValue: 1, labels: { jobType: completedJob.job_type } }, client)
    await insertWorkerMetric({ workerNodeId: worker.id, queueName: completedJob.queue_name, metricName: 'job_latency_ms', metricValue: latencyMs, labels: { jobType: completedJob.job_type, status: 'completed' } }, client)
    await query(client, 'COMMIT')
    logRunner('job completed', { jobId: completedJob.id, queueName: completedJob.queue_name, workerNodeId: worker.id })
    return { job: completedJob, completed: true }
  } catch (error) {
    await query(client, 'ROLLBACK')
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
    await query(client, 'BEGIN')
    const freshResult = await query(client,
      `SELECT * FROM ai_execution_jobs
        WHERE id = $1::uuid AND status = 'running' AND locked_by = $2::uuid
        FOR UPDATE`,
      [job.id, worker.id]
    )
    if (freshResult.rowCount === 0) {
      await query(client, 'ROLLBACK')
      return { job, failed: false, reason: 'job_not_owned_or_not_running' }
    }
    const freshJob = freshResult.rows[0]
    let nextStatus = 'retrying'
    if (error && error.nonRetryable) {
      nextStatus = 'failed'
    } else if (freshJob.attempt_count >= freshJob.max_attempts) {
      nextStatus = 'dead_lettered'
    }

    const updateResult = await query(client,
      `UPDATE ai_execution_jobs
          SET status = $3::text,
              error_message = $4::text,
              locked_by = NULL,
              locked_at = NULL,
              heartbeat_at = NOW(),
              timeout_at = NULL,
              run_after = CASE
                WHEN $3::text = 'retrying' THEN NOW() + (LEAST(300, POWER(2, GREATEST($5::integer - 1, 0)))::integer * INTERVAL '1 second')
                ELSE run_after
              END,
              updated_at = NOW()
        WHERE id = $1::uuid
          AND locked_by = $2::uuid
        RETURNING *`,
      [freshJob.id, worker.id, nextStatus, message, freshJob.attempt_count]
    )
    const failedJob = updateResult.rows[0]

    if (nextStatus === 'dead_lettered') {
      await query(client,
        `INSERT INTO dead_letter_queue(
           workspace_id, source_queue, source_job_id, task_id, reason,
           error_message, payload, attempts
         ) VALUES($1::uuid,$2::text,$3::uuid,$4::uuid,$5::text,$6::text,$7::jsonb,$8::integer)`,
        [
          normalizeDbValue(failedJob.workspace_id),
          normalizeDbValue(failedJob.queue_name),
          normalizeDbValue(failedJob.id),
          normalizeDbValue(failedJob.task_id),
          'max_attempts_exhausted',
          message,
          safeJsonb(failedJob.payload),
          failedJob.attempt_count,
        ]
      )
    }

    await query(client,
      `UPDATE worker_nodes
          SET current_concurrency = GREATEST(current_concurrency - 1, 0),
              heartbeat_at = NOW(),
              updated_at = NOW()
        WHERE id = $1::uuid`,
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
      metadata: redactForExecutionLog({ workerNodeId: worker.id, latencyMs, nextStatus, error: technicalError, safeError: message }),
    }, client)
    await writeTaskHistory({ job: failedJob, workerNodeId: worker.id, previousStatus: 'running', nextStatus, latencyMs, errorMessage: message }, client)
    if ([OPENAI_TEXT_GENERATION_JOB_TYPE, SALES_FOLLOWUP_GENERATION_JOB_TYPE].includes(failedJob.job_type) && !error?.providerUsageRecorded) {
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
    await insertWorkerMetric({ workerNodeId: worker.id, queueName: failedJob.queue_name, metricName: 'job_latency_ms', metricValue: latencyMs, labels: { jobType: failedJob.job_type, status: nextStatus } }, client)
    if (nextStatus === 'retrying') {
      await insertWorkerMetric({ workerNodeId: worker.id, queueName: failedJob.queue_name, metricName: 'job_retry_scheduled', metricValue: 1, labels: { jobType: failedJob.job_type } }, client)
    }
    await query(client, 'COMMIT')
    logRunner('job failed', { jobId: failedJob.id, queueName: failedJob.queue_name, workerNodeId: worker.id, nextStatus })
    return { job: failedJob, failed: true, nextStatus }
  } catch (failureError) {
    await query(client, 'ROLLBACK')
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
  const result = await query(pool,
    `INSERT INTO ai_execution_jobs(queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
     VALUES($1::text, 'internal_test_execution', $2::integer, 'queued', $3::jsonb, $4::integer, NOW(), $5::text)
     ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
     RETURNING *`,
    [
      normalizedQueueName,
      Number.isFinite(Number(priority)) ? Math.trunc(Number(priority)) : 100,
      safeJsonb({ source: 'api', createdFor: 'internal_test_execution', ...(payload || {}) }),
      normalizePositiveInteger(payload.maxAttempts, 3),
      normalizeDbValue(idempotencyKey),
    ]
  )
  if (result.rowCount > 0) return result.rows[0]
  if (!idempotencyKey) return null
  const existing = await query(pool,
    `SELECT * FROM ai_execution_jobs WHERE workspace_id IS NULL AND idempotency_key = $1::text LIMIT 1`,
    [normalizeDbValue(idempotencyKey)]
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
  const result = await query(pool,
    `INSERT INTO ai_execution_jobs(queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
     VALUES($1::text, $2::text, $3::integer, 'queued', $4::jsonb, $5::integer, NOW(), $6::text)
     ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
     RETURNING *`,
    [
      normalizedQueueName,
      OPENAI_TEXT_GENERATION_JOB_TYPE,
      Number.isFinite(Number(priority)) ? Math.trunc(Number(priority)) : 100,
      safeJsonb(normalizedPayload),
      normalizePositiveInteger(payload.maxAttempts || payload.max_attempts, 3),
      normalizeDbValue(idempotencyKey),
    ]
  )
  if (result.rowCount > 0) return result.rows[0]
  if (!idempotencyKey) return null
  const existing = await query(pool,
    `SELECT * FROM ai_execution_jobs WHERE workspace_id IS NULL AND idempotency_key = $1::text LIMIT 1`,
    [normalizeDbValue(idempotencyKey)]
  )
  return existing.rows[0] || null
}


async function enqueueSalesFollowupGenerationJob({ queueName = DEFAULT_QUEUE_NAME, priority = 100, payload = {}, idempotencyKey = null, workspaceId = null, userId = null } = {}) {
  const normalizedQueueName = normalizeQueueName(queueName)
  const normalizedPayload = {
    source: 'api',
    createdFor: SALES_FOLLOWUP_GENERATION_JOB_TYPE,
    ...sanitizeSalesFollowupPayload(payload),
  }
  if (!normalizedPayload.leadId) {
    throw createManagerSafeExecutionError('AI Sales follow-up requires a leadId.', 'enqueue payload.leadId is missing', { nonRetryable: true })
  }
  const result = await query(pool,
    `INSERT INTO ai_execution_jobs(workspace_id, user_id, queue_name, job_type, priority, status, payload, max_attempts, run_after, idempotency_key)
     VALUES($1::uuid, $2::uuid, $3::text, $4::text, $5::integer, 'queued', $6::jsonb, $7::integer, NOW(), $8::text)
     ON CONFLICT (workspace_id, idempotency_key) DO NOTHING
     RETURNING *`,
    [
      normalizeDbValue(workspaceId),
      normalizeDbValue(userId),
      normalizedQueueName,
      SALES_FOLLOWUP_GENERATION_JOB_TYPE,
      Number.isFinite(Number(priority)) ? Math.trunc(Number(priority)) : 100,
      safeJsonb(normalizedPayload),
      normalizePositiveInteger(payload.maxAttempts || payload.max_attempts, 3),
      normalizeDbValue(idempotencyKey),
    ]
  )
  if (result.rowCount > 0) return result.rows[0]
  if (!idempotencyKey) return null
  const existing = await query(pool,
    `SELECT * FROM ai_execution_jobs WHERE workspace_id IS NOT DISTINCT FROM $1::uuid AND idempotency_key = $2::text LIMIT 1`,
    [normalizeDbValue(workspaceId), normalizeDbValue(idempotencyKey)]
  )
  return existing.rows[0] || null
}

async function getHealth({ queueName = null } = {}) {
  const worker = await registerWorkerNode()
  const filters = []
  const params = []
  if (queueName) {
    params.push(normalizeQueueName(queueName))
    filters.push(`queue_name = $${params.length}::text`)
  }
  const whereSql = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const countResult = await query(pool,
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
  enqueueSalesFollowupGenerationJob,
  getHealth,
  registerWorkerNode,
  runOnce,
  _private: {
    DEFAULT_OPENAI_TEXT_PROMPT,
    OPENAI_TEXT_GENERATION_JOB_TYPE,
    SALES_FOLLOWUP_GENERATION_JOB_TYPE,
    SALES_FOLLOWUP_SYSTEM_PROMPT,
    completeJob,
    executeJob,
    executeOpenAiTextGenerationJob,
    executeSalesFollowupGenerationJob,
    failJob,
    getSafeErrorMessage,
    isOpenAiApiKeyConfigured,
    safeJson,
    safeJsonb,
    normalizeNullableText,
    sanitizeOpenAiTextPayload,
    sanitizeCustomerMessage,
    sanitizeSalesFollowupPayload,
  },
}
