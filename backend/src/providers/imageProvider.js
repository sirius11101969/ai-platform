const { requestJson } = require('./httpClient')
const { downloadAndPersist, persistBuffer } = require('./fileStorage')
const { recordProviderUsage } = require('../services/execution/providerUsageService')
const logger = require('../services/execution/structuredLogger')

class ImageGenerationProvider {
  constructor(config = {}) {
    this.openAiApiKey = config.openAiApiKey || process.env.OPENAI_API_KEY
    this.fluxApiKey = config.fluxApiKey || process.env.FLUX_API_KEY
    this.fluxEndpoint = config.fluxEndpoint || process.env.FLUX_API_URL
    this.provider = config.provider || process.env.IMAGE_PROVIDER || 'openai'
    this.timeoutMs = Number(config.timeoutMs || process.env.IMAGE_PROVIDER_TIMEOUT_MS || 120000)
  }

  async generate({ prompt, workspaceId, userId, taskId, provider = this.provider, model, size = '1024x1024', quality = 'standard', metadata = {} }) {
    if (provider === 'flux') return this.generateFlux({ prompt, workspaceId, userId, taskId, model, size, metadata })
    return this.generateOpenAi({ prompt, workspaceId, userId, taskId, model, size, quality, metadata })
  }

  async generateOpenAi({ prompt, workspaceId, userId, taskId, model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', size, quality, metadata }) {
    if (!this.openAiApiKey) throw new Error('OPENAI_API_KEY is not configured')
    const startedAt = Date.now()
    const { data, latencyMs } = await requestJson('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.openAiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, size, quality, n: 1 }),
      timeoutMs: this.timeoutMs,
      retries: Number(process.env.IMAGE_PROVIDER_RETRIES || 2),
      operation: 'openai.images.generate',
    })
    const image = data?.data?.[0]
    if (!image?.b64_json && !image?.url) throw new Error('OpenAI image response did not include an image artifact')
    const artifact = image.b64_json
      ? await persistBuffer({ buffer: Buffer.from(image.b64_json, 'base64'), workspaceId, kind: 'images', extension: 'png', contentType: 'image/png', metadata })
      : await downloadAndPersist({ url: image.url, workspaceId, kind: 'images', extension: 'png', contentType: 'image/png', metadata })
    await recordProviderUsage({ workspaceId, userId, taskId, provider: 'openai', model, operation: 'images.generate', latencyMs, status: 'succeeded', metadata: { artifact: artifact.relativePath } }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))
    return { provider: 'openai', model, status: 'completed', artifact, latencyMs, startedAt: new Date(startedAt).toISOString() }
  }

  async generateFlux({ prompt, workspaceId, userId, taskId, model = process.env.FLUX_MODEL || 'flux-pro', size, metadata }) {
    if (!this.fluxApiKey || !this.fluxEndpoint) throw new Error('FLUX_API_KEY and FLUX_API_URL are required for Flux image generation')
    const { data, latencyMs } = await requestJson(this.fluxEndpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.fluxApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, size }),
      timeoutMs: this.timeoutMs,
      retries: Number(process.env.IMAGE_PROVIDER_RETRIES || 2),
      operation: 'flux.images.generate',
    })
    const imageUrl = data?.url || data?.image_url || data?.data?.[0]?.url
    if (!imageUrl) throw new Error('Flux response did not include an image URL')
    const artifact = await downloadAndPersist({ url: imageUrl, workspaceId, kind: 'images', extension: 'png', metadata })
    await recordProviderUsage({ workspaceId, userId, taskId, provider: 'flux', model, operation: 'images.generate', latencyMs, status: 'succeeded', metadata: { artifact: artifact.relativePath, jobId: data?.id } }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))
    return { provider: 'flux', model, status: 'completed', artifact, providerJobId: data?.id, latencyMs }
  }
}

module.exports = { ImageGenerationProvider }
