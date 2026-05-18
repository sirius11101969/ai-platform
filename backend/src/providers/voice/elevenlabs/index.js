class ElevenLabsVoiceCallProvider {
  constructor() {
    this.provider = 'elevenlabs'
  }

  async startCall() {
    throw Object.assign(new Error('ElevenLabs voice calling is not enabled. AI Voice Outreach is mock-mode only.'), { nonRetryable: true })
  }
}

module.exports = { ElevenLabsVoiceCallProvider }
