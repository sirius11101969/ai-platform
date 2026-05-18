const assert = require('assert')

const service = require('../src/services/execution/aiExecutionRunnerService')
const { _private } = service

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

function testSanitizeOpenAiTextPayloadDefaults() {
  const payload = _private.sanitizeOpenAiTextPayload({})
  assert.strictEqual(payload.prompt, _private.DEFAULT_OPENAI_TEXT_PROMPT)
  assert.strictEqual(payload.system, null)
  assert.strictEqual(payload.model, undefined)
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
  .then(testSanitizeOpenAiTextPayloadDefaults)
  .then(testSanitizeOpenAiTextPayloadOverrides)
  .then(testMissingOpenAiKeyFailsSafely)
  .then(() => console.log('aiExecutionRunnerOpenAi tests passed'))
