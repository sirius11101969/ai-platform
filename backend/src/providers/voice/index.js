const { MockVoiceProvider } = require('./mock_provider')
const { ElevenLabsVoiceCallProvider } = require('./elevenlabs')
const { OpenAiRealtimeVoiceProvider } = require('./openai_realtime')

function createVoiceProvider(provider = 'mock_provider', config = {}) {
  const normalized = String(provider || 'mock_provider').trim().toLowerCase()
  if (normalized === 'mock_provider' || normalized === 'mock') return new MockVoiceProvider(config)
  if (normalized === 'elevenlabs') return new ElevenLabsVoiceCallProvider(config)
  if (normalized === 'openai_realtime') return new OpenAiRealtimeVoiceProvider(config)
  throw Object.assign(new Error('Unsupported voice provider'), { statusCode: 400, nonRetryable: true })
}

module.exports = { createVoiceProvider, MockVoiceProvider, ElevenLabsVoiceCallProvider, OpenAiRealtimeVoiceProvider }
