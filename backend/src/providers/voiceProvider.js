const { requestJson } = require('./httpClient')
const { persistBuffer } = require('./fileStorage')
const { recordProviderUsage } = require('../services/execution/providerUsageService')
const logger = require('../services/execution/structuredLogger')

class ElevenLabsVoiceProvider {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.ELEVENLABS_API_KEY
    this.voiceId = config.voiceId || process.env.ELEVENLABS_VOICE_ID
    this.model = config.model || process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'
    this.timeoutMs = Number(config.timeoutMs || process.env.ELEVENLABS_TIMEOUT_MS || 120000)
  }

  async generateSpeech({ text, workspaceId, userId, taskId, voiceId = this.voiceId, model = this.model, metadata = {} }) {
    if (!this.apiKey) throw new Error('ELEVENLABS_API_KEY is not configured')
    if (!voiceId) throw new Error('ELEVENLABS_VOICE_ID is not configured')
    const startedAt = Date.now()
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text, model_id: model, voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true } }),
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    if (!response.ok) throw new Error(`ElevenLabs speech generation failed with HTTP ${response.status}: ${await response.text()}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    const artifact = await persistBuffer({ buffer, workspaceId, kind: 'audio', extension: 'mp3', contentType: response.headers.get('content-type') || 'audio/mpeg', metadata: { ...metadata, voiceId } })
    const latencyMs = Date.now() - startedAt
    await recordProviderUsage({ workspaceId, userId, taskId, provider: 'elevenlabs', model, operation: 'speech.generate', latencyMs, status: 'succeeded', metadata: { artifact: artifact.relativePath, voiceId } }).catch((error) => logger.warn('provider_usage_record_failed', { error: error.message }))
    return { provider: 'elevenlabs', model, voiceId, status: 'completed', artifact, latencyMs, startedAt: new Date(startedAt).toISOString() }
  }

  async listVoices() {
    if (!this.apiKey) throw new Error('ELEVENLABS_API_KEY is not configured')
    const { data } = await requestJson('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': this.apiKey },
      timeoutMs: Number(process.env.ELEVENLABS_TIMEOUT_MS || 60000),
      operation: 'elevenlabs.voices.list',
    })
    return data?.voices || []
  }
}

module.exports = { ElevenLabsVoiceProvider }
