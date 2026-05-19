function buildSalesPersona({ leadScore = 0, forecast = null, sentiment = 'neutral' } = {}) {
  const urgency = leadScore >= 80 ? 'high' : leadScore >= 50 ? 'medium' : 'low'
  return {
    tone: sentiment === 'negative' ? 'calm_consultative' : 'confident_consultative',
    urgency,
    talkTrack: forecast === 'enterprise' ? 'enterprise_value' : 'smb_velocity',
  }
}

module.exports = { buildSalesPersona }
