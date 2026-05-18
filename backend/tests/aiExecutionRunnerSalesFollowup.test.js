const assert = require('assert')

const pool = require('../src/db/pool')
const runner = require('../src/services/execution/aiExecutionRunnerService')
const { _private } = runner

const workspaceId = '11111111-1111-4111-8111-111111111111'
const userId = '22222222-2222-4222-8222-222222222222'
const leadId = '33333333-3333-4333-8333-333333333333'
const workerId = '44444444-4444-4444-8444-444444444444'
const jobId = '55555555-5555-4555-8555-555555555555'

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
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') return { rows: [], rowCount: 0 }
      return handler(sql, params, calls)
    },
    release() { calls.push({ sql: '__release__', params: [] }) },
  }
}

async function withMockPool(directHandler, clients, fn) {
  const directCalls = []
  const originalQuery = pool.query
  const originalConnect = pool.connect
  pool.query = async (sql, params = []) => {
    directCalls.push({ sql, params })
    return directHandler(sql, params, directCalls)
  }
  pool.connect = async () => {
    const client = clients.shift()
    if (!client) throw new Error('Unexpected pool.connect call')
    return client
  }
  try { return await fn({ directCalls }) } finally {
    pool.query = originalQuery
    pool.connect = originalConnect
  }
}

function assertNoUndefinedParams(calls) {
  calls.forEach((call) => call.params.forEach((param, index) => {
    assert.notStrictEqual(param, undefined, `undefined param ${index + 1} for ${call.sql}`)
  }))
}

function createLead() {
  return {
    id: leadId,
    workspace_id: workspaceId,
    user_id: userId,
    name: 'Анна Иванова',
    email: 'anna@example.com',
    company: 'ACME',
    status: 'qualified',
    stage: 'qualified',
    source: 'telegram',
    next_step: 'Ответить на вопрос о внедрении',
    metadata: {},
    telegram_chat_id: '123',
  }
}

async function testSanitizeCustomerMessageRemovesUnsafeMarkers() {
  const raw = 'Контекст: Плюсы: ai_score ai_priority ai_risk_level Здравствуйте, Анна! Возвращаюсь к вашему вопросу по AS6 AI CRM.'
  const sanitized = _private.sanitizeCustomerMessage(raw)
  assert.strictEqual(sanitized.includes('Контекст:'), false)
  assert.strictEqual(sanitized.includes('Плюсы:'), false)
  assert.strictEqual(sanitized.includes('ai_score'), false)
  assert.strictEqual(sanitized.includes('ai_priority'), false)
  assert.strictEqual(sanitized.includes('ai_risk_level'), false)
  assert(sanitized.length <= 600)
  assert(sanitized.includes('Здравствуйте, Анна!'))
}

async function testExecuteSalesFollowupReturnsPendingApprovalDraft() {
  await withEnv({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4.1-mini' }, async () => {
    await withMockFetch((url, options) => {
      const request = JSON.parse(options.body)
      assert.strictEqual(request.instructions, _private.SALES_FOLLOWUP_SYSTEM_PROMPT)
      assert.strictEqual(request.max_output_tokens, 260)
      return createJsonResponse(200, {
        id: 'resp-sales-1',
        output_text: 'Здравствуйте, Анна! Возвращаюсь к вашему вопросу по AS6 AI CRM. Удобно обсудить детали внедрения сегодня или завтра?',
        usage: { input_tokens: 50, output_tokens: 20, total_tokens: 70 },
      })
    }, async () => {
      await withMockPoolQuery((sql) => {
        if (sql.includes('FROM crm_leads')) return { rows: [createLead()], rowCount: 1 }
        if (sql.includes('FROM lead_timeline_events')) return { rows: [{ event_type: 'note', title: 'Вопрос', body: 'Интересуется внедрением' }], rowCount: 1 }
        if (sql.includes('FROM telegram_messages')) return { rows: [{ role: 'user', direction: 'inbound', body: 'Хочу узнать детали' }], rowCount: 1 }
        if (sql.includes('FROM email_messages')) return { rows: [], rowCount: 0 }
        if (sql.includes('INSERT INTO ai_provider_usage')) return { rows: [{ id: 'usage-sales' }], rowCount: 1 }
        throw new Error(`Unhandled SQL: ${sql}`)
      }, async (calls) => {
        const result = await _private.executeSalesFollowupGenerationJob({
          id: jobId,
          job_type: _private.SALES_FOLLOWUP_GENERATION_JOB_TYPE,
          workspace_id: workspaceId,
          user_id: userId,
          task_id: null,
          payload: { leadId, channel: 'telegram', tone: 'professional', language: 'ru' },
        })
        assert.strictEqual(result.ok, true)
        assert.strictEqual(result.aiWorkerQueueDraft.actionType, 'telegram_reply_draft')
        assert.strictEqual(result.aiWorkerQueueDraft.title, 'AI Sales follow-up — Анна Иванова')
        assert.strictEqual(result.aiWorkerQueueDraft.payload.channel, 'telegram')
        assert.strictEqual(result.aiWorkerQueueDraft.payload.source, 'sales_followup_generation')
        assert.strictEqual(result.aiWorkerQueueDraft.payload.executionJobId, jobId)
        assert.strictEqual(result.aiWorkerQueueDraft.payload.customerText, result.text)
        assert(result.text.length <= 600)
        assertNoUndefinedParams(calls)
      })
    })
  })
}

async function testCompleteJobCreatesAiWorkerQueuePendingApproval() {
  const client = createClient((sql, params) => {
    if (sql.includes('INSERT INTO ai_workers')) return { rows: [{ id: 'sales-worker-id' }], rowCount: 1 }
    if (sql.includes('INSERT INTO ai_worker_queue')) return { rows: [{ id: 'queue-item-id' }], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [{ id: jobId, workspace_id: workspaceId, user_id: userId, task_id: null, queue_name: 'ai-execution', job_type: _private.SALES_FOLLOWUP_GENERATION_JOB_TYPE, status: 'completed' }], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'log-id' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled complete SQL: ${sql}; params=${JSON.stringify(params)}`)
  })
  const originalConnect = pool.connect
  pool.connect = async () => client
  try {
    const completed = await _private.completeJob({
      job: { id: jobId, task_id: null },
      worker: { id: workerId },
      startedAt: new Date(),
      result: {
        ok: true,
        text: 'Здравствуйте! Удобно обсудить детали?',
        aiWorkerQueueDraft: {
          workspaceId,
          leadId,
          actionType: 'telegram_reply_draft',
          title: 'AI Sales follow-up — Анна Иванова',
          recommendation: 'AI Sales подготовил короткий follow-up. Проверьте текст и отправьте клиенту после одобрения.',
          payload: { customerText: 'Здравствуйте! Удобно обсудить детали?', leadId, channel: 'telegram', source: 'sales_followup_generation', executionJobId: jobId },
        },
      },
    })
    assert.strictEqual(completed.completed, true)
    const queueInsert = client.calls.find((call) => call.sql.includes('INSERT INTO ai_worker_queue'))
    assert(queueInsert, 'expected ai_worker_queue insert')
    assert(queueInsert.sql.includes("'pending_approval'"))
    assert.strictEqual(queueInsert.params[3], 'telegram_reply_draft')
    const payload = JSON.parse(queueInsert.params[6])
    assert.strictEqual(payload.customerText, 'Здравствуйте! Удобно обсудить детали?')
    assert.strictEqual(payload.source, 'sales_followup_generation')
    const jobUpdate = client.calls.find((call) => call.sql.includes('UPDATE ai_execution_jobs'))
    const savedResult = JSON.parse(jobUpdate.params[2])
    assert.strictEqual(savedResult.aiWorkerQueueDraft, undefined)
    assert.strictEqual(savedResult.aiWorkerQueueId, 'queue-item-id')
    assertNoUndefinedParams(client.calls)
  } finally {
    pool.connect = originalConnect
  }
}

async function testMissingLeadFailsSafely() {
  await withEnv({ OPENAI_API_KEY: 'test-key' }, async () => {
    await withMockPoolQuery((sql) => {
      if (sql.includes('FROM crm_leads')) return { rows: [], rowCount: 0 }
      throw new Error(`Unhandled SQL: ${sql}`)
    }, async () => {
      await assert.rejects(
        () => _private.executeSalesFollowupGenerationJob({ id: jobId, job_type: _private.SALES_FOLLOWUP_GENERATION_JOB_TYPE, workspace_id: workspaceId, payload: { leadId, channel: 'email' } }),
        (error) => error.safeMessage === 'Lead was not found for AI Sales follow-up.' && error.nonRetryable === true
      )
    })
  })
}

async function testOpenAiMissingKeyFailsSafely() {
  await withEnv({ OPENAI_API_KEY: undefined }, async () => {
    await withMockPoolQuery((sql) => {
      if (sql.includes('FROM crm_leads')) return { rows: [createLead()], rowCount: 1 }
      throw new Error(`Unhandled SQL: ${sql}`)
    }, async () => {
      await assert.rejects(
        () => _private.executeSalesFollowupGenerationJob({ id: jobId, job_type: _private.SALES_FOLLOWUP_GENERATION_JOB_TYPE, workspace_id: workspaceId, payload: { leadId, channel: 'telegram' } }),
        (error) => error.safeMessage === 'OpenAI provider is not configured for AI Sales follow-up.' && error.nonRetryable === true
      )
    })
  })
}

async function testAutonomousRunnerCanExecuteSalesFollowupJob() {
  const queueName = 'ai-execution'
  const job = {
    id: jobId,
    workspace_id: workspaceId,
    user_id: userId,
    task_id: null,
    queue_name: queueName,
    job_type: _private.SALES_FOLLOWUP_GENERATION_JOB_TYPE,
    status: 'running',
    previous_status: 'queued',
    attempt_count: 1,
    max_attempts: 3,
    payload: { leadId, channel: 'email', tone: 'professional', language: 'ru' },
  }
  const worker = { id: workerId, node_name: 'test-worker', status: 'online', queues: [queueName], current_concurrency: 0, max_concurrency: 2 }
  const claimClient = createClient((sql) => {
    if (sql.includes('SELECT * FROM worker_nodes')) return { rows: [worker], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs jobs')) return { rows: [job], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'claim-log' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled claim SQL: ${sql}`)
  })
  const completeClient = createClient((sql) => {
    if (sql.includes('INSERT INTO ai_workers')) return { rows: [{ id: 'sales-worker-id' }], rowCount: 1 }
    if (sql.includes('INSERT INTO ai_worker_queue')) return { rows: [{ id: 'queue-item-id' }], rowCount: 1 }
    if (sql.includes('UPDATE ai_execution_jobs')) return { rows: [{ ...job, status: 'completed' }], rowCount: 1 }
    if (sql.includes('UPDATE worker_nodes')) return { rows: [], rowCount: 1 }
    if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'complete-log' }], rowCount: 1 }
    if (sql.includes('INSERT INTO worker_metrics')) return { rows: [], rowCount: 1 }
    throw new Error(`Unhandled complete SQL: ${sql}`)
  })

  await withEnv({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4.1-mini' }, async () => {
    await withMockFetch(() => createJsonResponse(200, { id: 'resp-run-once', output_text: 'Здравствуйте, Анна! Удобно обсудить следующие шаги по AS6 AI CRM?', usage: { input_tokens: 40, output_tokens: 14, total_tokens: 54 } }), async () => {
      await withMockPool((sql) => {
        if (sql.includes('INSERT INTO worker_nodes')) return { rows: [worker], rowCount: 1 }
        if (sql.includes('FROM crm_leads')) return { rows: [createLead()], rowCount: 1 }
        if (sql.includes('FROM lead_timeline_events')) return { rows: [], rowCount: 0 }
        if (sql.includes('FROM telegram_messages')) return { rows: [], rowCount: 0 }
        if (sql.includes('FROM email_messages')) return { rows: [], rowCount: 0 }
        if (sql.includes('INSERT INTO ai_provider_usage')) return { rows: [{ id: 'usage-id' }], rowCount: 1 }
        throw new Error(`Unhandled direct SQL: ${sql}`)
      }, [claimClient, completeClient], async ({ directCalls }) => {
        const result = await runner.runOnce({ queueName })
        assert.strictEqual(result.claimed, true)
        assert.strictEqual(result.completed, true)
        assert.strictEqual(result.result.aiWorkerQueueDraft.actionType, 'email_followup_draft')
        const queueInsert = completeClient.calls.find((call) => call.sql.includes('INSERT INTO ai_worker_queue'))
        assert(queueInsert, 'expected ai_worker_queue insert from autonomous run')
        assert.strictEqual(queueInsert.params[3], 'email_followup_draft')
        assertNoUndefinedParams([...directCalls, ...claimClient.calls, ...completeClient.calls])
      })
    })
  })
}

async function main() {
  await testSanitizeCustomerMessageRemovesUnsafeMarkers()
  await testExecuteSalesFollowupReturnsPendingApprovalDraft()
  await testCompleteJobCreatesAiWorkerQueuePendingApproval()
  await testMissingLeadFailsSafely()
  await testOpenAiMissingKeyFailsSafely()
  await testAutonomousRunnerCanExecuteSalesFollowupJob()
  console.log('aiExecutionRunnerSalesFollowup tests passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
