const PRICING_KNOWLEDGE = {
  planComparison: 'Starter for early teams, Growth for multi-rep workflows, Enterprise for governance + custom controls.',
  creditsExplanation: 'Credits map to AI actions and realtime usage; predictable burn is managed by workspace policies.',
  aiFeatureExplanation: 'AI covers lead scoring, outreach guidance, realtime conversation intelligence, and next-best-action support.',
  onboardingPositioning: 'Start with one pipeline, one persona, and measurable SLA goals in the first 2 weeks.',
  roiPositioning: 'ROI comes from faster first response, improved conversion, and lower manual rep overhead.'
}

function getPricingKnowledge(topic = '') {
  const key = Object.keys(PRICING_KNOWLEDGE).find((k) => k.toLowerCase().includes(String(topic).toLowerCase()))
  if (!key) return { topic: 'overview', content: Object.values(PRICING_KNOWLEDGE).join(' ') }
  return { topic: key, content: PRICING_KNOWLEDGE[key] }
}

module.exports = { PRICING_KNOWLEDGE, getPricingKnowledge }
