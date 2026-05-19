const OBJECTION_RULES = {
  price_objection: { keywords: ['expensive', 'price', 'cost', 'budget', 'too much'], strategy: 'Anchor on ROI, outcome value, and phased adoption.', escalation: 'offer_pricing_review' },
  timing_objection: { keywords: ['later', 'not now', 'timing', 'quarter', 'busy'], strategy: 'Offer milestone-based rollout with low-lift first step.', escalation: 'create_followup_task' },
  trust_objection: { keywords: ['trust', 'security', 'risk', 'compliance', 'prove'], strategy: 'Share evidence, references, and safety controls.', escalation: 'assign_human_manager' },
  competitor_objection: { keywords: ['competitor', 'alternative', 'already use', 'switch'], strategy: 'Differentiate on workflow outcomes and switching support.', escalation: 'escalate_enterprise_lead' },
  feature_objection: { keywords: ['feature', 'missing', 'integration', 'api', 'cannot'], strategy: 'Map requirements to roadmap/alternatives with transparent gaps.', escalation: 'wants_technical_consultation' },
}

function detectObjection(text = '') {
  const normalized = String(text).toLowerCase()
  let best = { category: null, score: 0 }
  for (const [category, rule] of Object.entries(OBJECTION_RULES)) {
    const score = rule.keywords.reduce((acc, k) => acc + (normalized.includes(k) ? 1 : 0), 0)
    if (score > best.score) best = { category, score }
  }
  if (!best.category) return null
  const rule = OBJECTION_RULES[best.category]
  const confidence = Math.min(0.98, 0.45 + best.score * 0.15)
  return { category: best.category, confidence, recommendedResponseStrategy: rule.strategy, escalationSuggestion: rule.escalation }
}

module.exports = { detectObjection, OBJECTION_RULES }
