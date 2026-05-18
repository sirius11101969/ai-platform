class OpenAiRealtimeVoiceProvider {
  constructor() {
    this.provider = 'openai_realtime'
  }

  async startCall() {
    throw Object.assign(new Error('OpenAI realtime voice calling is not enabled. AI Voice Outreach is mock-mode only.'), { nonRetryable: true })
  }
}

module.exports = { OpenAiRealtimeVoiceProvider }
