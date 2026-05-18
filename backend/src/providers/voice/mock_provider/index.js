class MockVoiceProvider {
  constructor(config = {}) {
    this.provider = 'mock_provider'
    this.durationSeconds = Number(config.durationSeconds || 142)
  }

  async startCall({ lead = {}, phoneNumber, context = {} }) {
    const leadName = lead.name || 'there'
    const product = context.product || 'AI CRM automation'
    const transcript = [
      `AI SDR: Hi ${leadName}, this is a simulated outreach call about ${product}. Is now a reasonable time?`,
      `Lead: Yes, I can talk briefly. We are evaluating options and want to understand implementation effort.`,
      'AI SDR: What business outcome matters most right now?',
      'Lead: Faster qualification and fewer missed follow-ups. If pricing is clear, a short demo would be useful.',
      'AI SDR: Great. I will recommend a demo follow-up with pricing context and note that this was a positive qualification call.',
    ].join('\n')

    return {
      provider: this.provider,
      status: 'completed',
      phoneNumber,
      durationSeconds: this.durationSeconds,
      transcript,
      recordingUrl: null,
      metadata: { mockMode: true, telephonyTrafficSent: false, generatedAt: new Date().toISOString() },
    }
  }
}

module.exports = { MockVoiceProvider }
