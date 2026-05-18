const logger = require('../services/execution/structuredLogger')

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryAfter(value) {
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now())
}

function shouldRetry(status, error) {
  if (error?.name === 'AbortError') return true
  if (!status) return true
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500
}

async function requestJson(url, options = {}) {
  const {
    retries = 3,
    timeoutMs = 60000,
    retryBaseMs = 500,
    retryMaxMs = 8000,
    operation = 'http.request',
    expectedStatuses = [200],
    logRetries = true,
    ...fetchOptions
  } = options
  let lastError

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const startedAt = Date.now()
    let response

    try {
      response = await fetch(url, { ...fetchOptions, signal: controller.signal })
      const text = await response.text()
      const contentType = response.headers.get('content-type') || ''
      const body = contentType.includes('application/json') && text ? JSON.parse(text) : text
      const latencyMs = Date.now() - startedAt

      if (expectedStatuses.includes(response.status)) {
        return { data: body, status: response.status, headers: response.headers, latencyMs }
      }

      const error = new Error(typeof body === 'string' ? body : body?.error?.message || body?.message || `HTTP ${response.status}`)
      error.status = response.status
      error.body = body
      error.latencyMs = latencyMs
      lastError = error

      if (!shouldRetry(response.status) || attempt > retries) throw error

      const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'))
      const backoffMs = retryAfterMs ?? Math.min(retryMaxMs, retryBaseMs * 2 ** (attempt - 1))
      const jitterMs = Math.floor(Math.random() * Math.min(250, backoffMs))
      if (logRetries) logger.warn('provider_http_retry', { operation, attempt, status: response.status, latencyMs, backoffMs: backoffMs + jitterMs })
      await sleep(backoffMs + jitterMs)
    } catch (error) {
      lastError = error
      if (!shouldRetry(error.status, error) || attempt > retries) throw error
      const backoffMs = Math.min(retryMaxMs, retryBaseMs * 2 ** (attempt - 1))
      const jitterMs = Math.floor(Math.random() * Math.min(250, backoffMs))
      if (logRetries) logger.warn('provider_http_retry', { operation, attempt, error: error.message, backoffMs: backoffMs + jitterMs })
      await sleep(backoffMs + jitterMs)
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
}

async function requestStream(url, options = {}, onChunk = async () => {}) {
  const { timeoutMs = 120000, operation = 'http.stream', ...fetchOptions } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const startedAt = Date.now()

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal })
    if (!response.ok || !response.body) {
      const body = await response.text()
      const error = new Error(body || `HTTP ${response.status}`)
      error.status = response.status
      throw error
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      fullText += chunk
      await onChunk(chunk)
    }
    return { text: fullText, status: response.status, headers: response.headers, latencyMs: Date.now() - startedAt }
  } catch (error) {
    logger.error('provider_stream_error', { operation, error: error.message })
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

module.exports = { requestJson, requestStream, sleep }
