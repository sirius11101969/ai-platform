const { requestJson, sleep } = require('./httpClient')
const { downloadAndPersist } = require('./fileStorage')
const { recordProviderUsage } = require('../services/execution/providerUsageService')
const logger = require('../services/execution/structuredLogger')

const TERMINAL_STATES = new Set(['completed', 'succeeded', 'failed', 'cancelled'])

class AsyncVideoProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.VIDEO_PROVIDER_API_KEY
    this.submitUrl = config.submitUrl || process.env.VIDEO_PROVIDER_SUBMIT_URL
    this.statusUrlTemplate = config.statusUrlTemplate || process.env.VIDEO_PROVIDER_STATUS_URL_TEMPLATE
    this.cancelUrlTemplate = config.cancelUrlTemplate || process.env.VIDEO_PROVIDER_CANCEL_URL_TEMPLATE
    this.model = config.model || process.env.VIDEO_PROVIDER_MODEL || 'default'
    this.timeoutMs = Number(config.timeoutMs || process.env.VIDEO_PROVIDER_TIMEOUT_MS || 60000)
  }

  ensureConfigured() {
    if (!this.apiKey || !this.submitUrl || !this.statusUrlTemplate) {
      throw new Error('VIDEO_PROVIDER_API_KEY, VIDEO_PROVIDER_SUBMIT_URL and VIDEO_PROVIDER_STATUS_URL_TEMPLATE are required')
    }
  }

  headers() {
    return { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
  }

  buildStatusUrl(jobId) {
    return this.statusUrlTemplate.replace('{jobId}', encodeURIComponent(jobId))
  }

  async submitJob({ prompt, workspaceId, userId, taskId, model = this.model, metadata = {}, webhookUrl }) {
    this.ensureConfigured()
    const { data, latencyMs } = await requestJson(this.submitUrl, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ prompt, model, metadata, webhook_url: webhookUrl }),
      timeoutMs: this.timeoutMs,
      retries: Number(process.env.VIDEO_PROVIDER_RETRIES || 2),
      operation: 'video.jobs.submit',
      expectedStatuses: [200, 201, 202],
    })
    const providerJobId = data?.id || data?.job_id
    if (!providerJobId) throw new Error('Video provider did not return a job id')
    await recordProviderUsage({ workspaceId, userId, taskId, provider: 'video', model, operation: 'jobs.submit', latencyMs, status: 'submitted', metadata: { providerJobId } }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))
    return { provider: 'video', model, status: data?.status || 'submitted', providerJobId, raw: data, latencyMs }
  }

  async getJob(providerJobId) {
    this.ensureConfigured()
    const { data, latencyMs } = await requestJson(this.buildStatusUrl(providerJobId), {
      headers: this.headers(),
      timeoutMs: this.timeoutMs,
      retries: Number(process.env.VIDEO_PROVIDER_RETRIES || 2),
      operation: 'video.jobs.status',
    })
    return { status: data?.status || data?.state || 'unknown', outputUrl: data?.output_url || data?.video_url || data?.result?.url, raw: data, latencyMs }
  }

  async pollUntilComplete({ providerJobId, workspaceId, userId, taskId, pollIntervalMs = Number(process.env.VIDEO_PROVIDER_POLL_INTERVAL_MS || 10000), maxWaitMs = Number(process.env.VIDEO_PROVIDER_MAX_WAIT_MS || 900000), metadata = {} }) {
    const startedAt = Date.now()
    while (Date.now() - startedAt < maxWaitMs) {
      const job = await this.getJob(providerJobId)
      const normalized = String(job.status || '').toLowerCase()
      if (TERMINAL_STATES.has(normalized)) {
        if (normalized === 'failed' || normalized === 'cancelled') return { ...job, providerJobId, status: normalized }
        if (!job.outputUrl) throw new Error('Completed video job did not include an output URL')
        const artifact = await downloadAndPersist({ url: job.outputUrl, workspaceId, kind: 'video', extension: 'mp4', contentType: 'video/mp4', metadata: { ...metadata, providerJobId } })
        await recordProviderUsage({ workspaceId, userId, taskId, provider: 'video', model: this.model, operation: 'jobs.complete', latencyMs: Date.now() - startedAt, status: 'succeeded', metadata: { providerJobId, artifact: artifact.relativePath } }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))
        return { ...job, providerJobId, status: 'completed', artifact }
      }
      await sleep(pollIntervalMs)
    }
    throw new Error(`Video job ${providerJobId} polling exceeded ${maxWaitMs}ms`)
  }

  async cancelJob(providerJobId) {
    this.ensureConfigured()
    if (!this.cancelUrlTemplate) throw new Error('VIDEO_PROVIDER_CANCEL_URL_TEMPLATE is not configured')
    const url = this.cancelUrlTemplate.replace('{jobId}', encodeURIComponent(providerJobId))
    const { data } = await requestJson(url, { method: 'POST', headers: this.headers(), timeoutMs: this.timeoutMs, operation: 'video.jobs.cancel', expectedStatuses: [200, 202, 204] })
    return data || { status: 'cancelled' }
  }
}

module.exports = { AsyncVideoProvider, TERMINAL_STATES }
