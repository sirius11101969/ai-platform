const assert = require('assert')

const pool = require('../src/db/pool')
const service = require('../src/services/execution/aiExecutionRunnerService')
const { _private } = service


async function withMockFetch(responseFactory, fn) {
  const originalFetch = global.fetch
  global.fetch = async (url, options) => responseFactory(url, options)
  try {
    return await fn()
  } finally {
    global.fetch = originalFetch
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

function assertNoUndefinedParams(calls) {
  for (const call of calls) {
    call.params.forEach((param, index) => {
      assert.notStrictEqual(param, undefined, `Unexpected undefined param ${index + 1} for SQL: ${call.sql}`)
    })
  }
}

function withEnv(updates, fn) {
  const originals = {}
  for (const key of Object.keys(updates)) {
    originals[key] = process.env[key]
    if (updates[key] === undefined) delete process.env[key]
    else process.env[key] = updates[key]
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const key of Object.keys(updates)) {
        if (originals[key] === undefined) delete process.env[key]
        else process.env[key] = originals[key]
      }
    })
}

function testNormalizeNullableText() {
  assert.strictEqual(_private.normalizeNullableText(undefined), null)
  assert.strictEqual(_private.normalizeNullableText(null), null)
  assert.strictEqual(_private.normalizeNullableText('   '), null)
  assert.strictEqual(_private.normalizeNullableText(' gpt-4.1-mini '), 'gpt-4.1-mini')
}

function testSanitizeOpenAiTextPayloadDefaults() {
  const payload = _private.sanitizeOpenAiTextPayload({})
  assert.strictEqual(payload.prompt, _private.DEFAULT_OPENAI_TEXT_PROMPT)
  assert.strictEqual(payload.system, null)
  assert.strictEqual(payload.model, null)
  assert.strictEqual(payload.maxOutputTokens, 900)
  assert.strictEqual(payload.temperature, 0.7)
}

function testSanitizeOpenAiTextPayloadOverrides() {
  const payload = _private.sanitizeOpenAiTextPayload({
    prompt: '  Напиши follow-up  ',
    system: '  Ты AI sales assistant  ',
    model: ' gpt-4.1-mini ',
    max_output_tokens: 128,
    temperature: 0.2,
  })
  assert.strictEqual(payload.prompt, 'Напиши follow-up')
  assert.strictEqual(payload.system, 'Ты AI sales assistant')
  assert.strictEqual(payload.model, 'gpt-4.1-mini')
  assert.strictEqual(payload.maxOutputTokens, 128)
  assert.strictEqual(payload.temperature, 0.2)
}


async function testOpenAiSuccessPersistsProviderUsage() {
  await withEnv({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4.1-mini' }, async () => {
    await withMockFetch(() => createJsonResponse(200, {
      id: 'resp-success',
      output_text: 'Hello from OpenAI',
      usage: { input_tokens: 4, output_tokens: 6, total_tokens: 10 },
    }), async () => {
      const { result, calls } = await withMockPoolQuery((sql) => {
        if (sql.includes('INSERT INTO ai_provider_usage')) return { rows: [{ id: 'usage-success' }], rowCount: 1 }
        throw new Error(`Unhandled SQL: ${sql}`)
      }, async () => _private.executeOpenAiTextGenerationJob({
        id: '22222222-2222-4222-8222-222222222222',
        job_type: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
        workspace_id: null,
        user_id: null,
        task_id: null,
        payload: { prompt: 'Hello', model: 'gpt-4.1-mini' },
      }))

      assert.strictEqual(result.ok, true)
      assert.strictEqual(result.text, 'Hello from OpenAI')
      assert.deepStrictEqual(result.usage, { promptTokens: 4, completionTokens: 6, totalTokens: 10 })
      const usageInsert = calls.find((call) => call.sql.includes('INSERT INTO ai_provider_usage'))
      assert(usageInsert, 'expected provider usage insert')
      assert(usageInsert.sql.includes('provider'))
      assert(usageInsert.sql.includes('model'))
      assert(usageInsert.sql.includes('operation'))
      assert(!usageInsert.sql.includes('model_name'))
      assert.strictEqual(usageInsert.params[0], null)
      assert.strictEqual(usageInsert.params[3], 'openai')
      assert.strictEqual(usageInsert.params[4], 'gpt-4.1-mini')
      assert.strictEqual(usageInsert.params[6], 4)
      assert.strictEqual(usageInsert.params[7], 6)
      assert.strictEqual(usageInsert.params[8], 10)
      assert.strictEqual(usageInsert.params[12], 'succeeded')
      assert.deepStrictEqual(JSON.parse(usageInsert.params[13]), { responseId: 'resp-success' })
      assertNoUndefinedParams(calls)
    })
  })
}

async function testOpenAiFailurePersistsProviderUsageAndExecutionLog() {
  await withEnv({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-4.1-mini', OPENAI_RETRIES: '0' }, async () => {
    await withMockFetch(() => createJsonResponse(400, { error: { message: 'bad request' } }), async () => {
      const { calls } = await withMockPoolQuery((sql) => {
        if (sql.includes('INSERT INTO ai_provider_usage')) return { rows: [{ id: 'usage-failed' }], rowCount: 1 }
        if (sql.includes('INSERT INTO execution_logs')) return { rows: [{ id: 'log-failed' }], rowCount: 1 }
        throw new Error(`Unhandled SQL: ${sql}`)
      }, async () => {
        await assert.rejects(
          () => _private.executeOpenAiTextGenerationJob({
            id: '22222222-2222-4222-8222-222222222222',
            job_type: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
            workspace_id: null,
            user_id: null,
            task_id: null,
            payload: { prompt: 'Hello', model: 'gpt-4.1-mini' },
          }),
          (error) => {
            assert.strictEqual(error.safeMessage, 'OpenAI text generation could not be completed safely. Please check provider configuration or try again later.')
            assert.strictEqual(error.providerUsageRecorded, true)
            assert.strictEqual(error.provider, 'openai')
            return true
          }
        )
      })

      const usageInsert = calls.find((call) => call.sql.includes('INSERT INTO ai_provider_usage'))
      assert(usageInsert, 'expected failed provider usage insert')
      assert(!usageInsert.sql.includes('model_name'))
      assert.strictEqual(usageInsert.params[3], 'openai')
      assert.strictEqual(usageInsert.params[4], 'gpt-4.1-mini')
      assert.strictEqual(usageInsert.params[12], 'failed')
      assert.deepStrictEqual(JSON.parse(usageInsert.params[13]), { status: 400 })

      const logInsert = calls.find((call) => call.sql.includes('INSERT INTO execution_logs'))
      assert(logInsert, 'expected execution log insert')
      assert(logInsert.sql.includes('$10::jsonb'))
      assert.strictEqual(logInsert.params[6], 'error')
      assert.strictEqual(logInsert.params[7], 'openai_response_failed')
      assert.deepStrictEqual(JSON.parse(logInsert.params[9]), { status: 400 })
      assertNoUndefinedParams(calls)
    })
  })
}

async function testMissingOpenAiKeyFailsSafely() {
  await withEnv({ OPENAI_API_KEY: 'replace_me', OPENAI_MODEL: 'gpt-4.1-mini' }, async () => {
    assert.strictEqual(_private.isOpenAiApiKeyConfigured(), false)
    await assert.rejects(
      () => _private.executeOpenAiTextGenerationJob({
        id: 'job-1',
        job_type: _private.OPENAI_TEXT_GENERATION_JOB_TYPE,
        payload: { prompt: 'Hello' },
      }),
      (error) => {
        assert.strictEqual(error.safeMessage, 'OpenAI provider is not configured for execution.')
        assert.strictEqual(error.message, 'OpenAI provider is not configured for execution.')
        assert.strictEqual(error.technicalMessage, 'OPENAI_API_KEY is missing or set to replace_me')
        assert.strictEqual(error.nonRetryable, true)
        assert.strictEqual(error.provider, 'openai')
        assert.strictEqual(error.operation, 'responses.create')
        assert.strictEqual(error.model, 'gpt-4.1-mini')
        return true
      }
    )
  })
}

Promise.resolve()
  .then(testNormalizeNullableText)
  .then(testSanitizeOpenAiTextPayloadDefaults)
  .then(testSanitizeOpenAiTextPayloadOverrides)
  .then(testOpenAiSuccessPersistsProviderUsage)
  .then(testOpenAiFailurePersistsProviderUsageAndExecutionLog)
  .then(testMissingOpenAiKeyFailsSafely)
  .then(() => console.log('aiExecutionRunnerOpenAi tests passed'))
