const { requestJson, requestStream } = require('./httpClient')
const { recordProviderUsage } = require('../services/execution/providerUsageService')
const { writeExecutionLog } = require('../services/execution/executionLogService')
const logger = require('../services/execution/structuredLogger')

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses'
const DEFAULT_OPENAI_MODEL = 'gpt-4.1'

function requireApiKey(apiKey) {
  if (!apiKey) {
    const error = new Error('OPENAI_API_KEY is not configured')
    error.statusCode = 500
    throw error
  }
}

function extractResponseText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) return response.output_text.trim()
  const textParts = []
  for (const outputItem of response?.output || []) {
    for (const contentItem of outputItem?.content || []) {
      if (typeof contentItem?.text === 'string') textParts.push(contentItem.text)
    }
  }
  return textParts.join('\n').trim()
}

function extractUsage(response) {
  const usage = response?.usage || {}
  const promptTokens = Number(usage.input_tokens || usage.prompt_tokens || 0)
  const completionTokens = Number(usage.output_tokens || usage.completion_tokens || 0)
  return {
    promptTokens,
    completionTokens,
    totalTokens: Number(usage.total_tokens || promptTokens + completionTokens || 0),
  }
}

class OpenAiProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY
    this.model = config.model || process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL
    this.timeoutMs = Number(config.timeoutMs || process.env.OPENAI_TIMEOUT_MS || 60000)
    this.retries = Number(config.retries || process.env.OPENAI_RETRIES || 3)
  }

  async createResponse({ input, instructions, metadata = {}, model, temperature = 0.7, maxOutputTokens = 900 }) {
    requireApiKey(this.apiKey)
    const startedAt = Date.now()
    const payload = {
      model: model || this.model,
      input,
      temperature,
      max_output_tokens: maxOutputTokens,
    }
    if (instructions) payload.instructions = instructions
    if (metadata.traceId) payload.metadata = { trace_id: metadata.traceId }

    logger.info('openai_response_started', { model: payload.model, taskId: metadata.taskId, workspaceId: metadata.workspaceId })
    try {
      const { data, latencyMs } = await requestJson(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeoutMs: this.timeoutMs,
        retries: this.retries,
        operation: 'openai.responses.create',
      })
      const text = extractResponseText(data)
      if (!text) throw new Error('OpenAI returned an empty response')
      const usage = extractUsage(data)
      await recordProviderUsage({
        workspaceId: metadata.workspaceId,
        userId: metadata.userId,
        taskId: metadata.taskId,
        provider: 'openai',
        model: payload.model,
        operation: 'responses.create',
        ...usage,
        latencyMs,
        status: 'succeeded',
        metadata: { responseId: data.id },
      }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))
      logger.info('openai_response_completed', { model: payload.model, taskId: metadata.taskId, latencyMs, ...usage })
      return { id: data.id, text, raw: data, usage, latencyMs, model: payload.model, provider: 'openai', startedAt: new Date(startedAt).toISOString() }
    } catch (error) {
      const latencyMs = Date.now() - startedAt
      await recordProviderUsage({
        workspaceId: metadata.workspaceId,
        userId: metadata.userId,
        taskId: metadata.taskId,
        provider: 'openai',
        model: payload.model,
        operation: 'responses.create',
        latencyMs,
        status: 'failed',
        metadata: { status: error.status },
      }).catch(() => {})
      await writeExecutionLog({
        workspaceId: metadata.workspaceId,
        userId: metadata.userId,
        taskId: metadata.taskId,
        jobId: metadata.jobId,
        level: 'error',
        event: 'openai_response_failed',
        message: 'OpenAI response request failed',
        metadata: { status: error.status, error: error.message },
        traceId: metadata.traceId,
      }).catch(() => {})
      throw error
    }
  }

  async streamResponse({ input, instructions, metadata = {}, model, temperature = 0.7, maxOutputTokens = 900, onToken }) {
    requireApiKey(this.apiKey)
    const payload = {
      model: model || this.model,
      input,
      temperature,
      max_output_tokens: maxOutputTokens,
      stream: true,
    }
    if (instructions) payload.instructions = instructions

    const { text, latencyMs } = await requestStream(
      OPENAI_RESPONSES_URL,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeoutMs: Number(process.env.OPENAI_STREAM_TIMEOUT_MS || 180000),
        operation: 'openai.responses.stream',
      },
      async (chunk) => {
        if (typeof onToken === 'function') await onToken(chunk)
      }
    )

    await recordProviderUsage({
      workspaceId: metadata.workspaceId,
      userId: metadata.userId,
      taskId: metadata.taskId,
      provider: 'openai',
      model: payload.model,
      operation: 'responses.stream',
      latencyMs,
      status: 'succeeded',
      metadata: { streamed: true },
    }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))

    return { text, latencyMs, model: payload.model, provider: 'openai' }
  }
}

module.exports = { OpenAiProvider, extractResponseText, extractUsage }
