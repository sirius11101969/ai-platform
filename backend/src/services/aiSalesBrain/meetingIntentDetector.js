const INTENTS = [
  { type: 'wants_demo', keywords: ['demo', 'walkthrough', 'show me'] },
  { type: 'wants_pricing', keywords: ['pricing', 'plan', 'quote'] },
  { type: 'wants_follow_up', keywords: ['follow up', 'next week', 'send details'] },
  { type: 'wants_human_manager', keywords: ['manager', 'human', 'representative'] },
  { type: 'wants_technical_consultation', keywords: ['technical', 'integration', 'architecture', 'api'] },
]
function detectMeetingIntent(text = '') { const normalized = String(text).toLowerCase(); const hits = INTENTS.filter((i) => i.keywords.some((k) => normalized.includes(k))); if (!hits.length) return null; return { primaryIntent: hits[0].type, intents: hits.map((h) => h.type), confidence: Math.min(0.95, 0.55 + hits.length * 0.15) } }
module.exports = { detectMeetingIntent, INTENTS }
