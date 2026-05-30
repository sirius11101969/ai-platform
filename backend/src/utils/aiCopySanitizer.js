const UNSAFE_PATTERNS = [
  /Плюсы:/i,
  /Минусы:/i,
  /Итог:/i,
  /Контекст:/i,
  /ai_score:/i,
  /ai_priority:/i,
  /ai_risk_level:/i,
  /scoring_reason/i,
]

const DEFAULT_MANAGER_TEXT = 'Высокий интерес к demo и внедрению.'
const MEETING_MANAGER_TEXT = 'Встреча запланирована, нужно подготовить agenda.'
const RISK_MANAGER_TEXT = 'Есть риск потери из-за паузы в коммуникации.'

function isInternalAiContext(text) {
  if (typeof text !== 'string') return false
  return UNSAFE_PATTERNS.some((pattern) => pattern.test(text))
}

function getSafeManagerText(text) {
  const value = String(text || '').toLowerCase()
  if (/(риск|risk|потер|пауза|ghost|high)/i.test(value)) return RISK_MANAGER_TEXT
  if (/(встреч|meeting|demo|демо|agenda|созвон|звон)/i.test(value)) return MEETING_MANAGER_TEXT
  return DEFAULT_MANAGER_TEXT
}

function sanitizeAiCopy(text, options = {}) {
  if (typeof text !== 'string') return text
  const { logSave = true } = options
  const trimmed = text.trim()
  if (!isInternalAiContext(trimmed)) return trimmed

  if (process.env.AI_COPY_SANITIZER_DEBUG === 'true') {
    console.warn('[ai-copy-sanitizer] unsafe text detected')
    if (logSave) console.warn('[ai-copy-sanitizer] text sanitized before save')
  }
  return getSafeManagerText(trimmed)
}

function sanitizeAiActionPayload(payload, seen = new WeakMap(), options = {}) {
  if (typeof payload === 'string') return sanitizeAiCopy(payload, options)
  if (payload === null || typeof payload !== 'object') return payload

  if (seen.has(payload)) return seen.get(payload)

  if (Array.isArray(payload)) {
    const sanitizedArray = []
    seen.set(payload, sanitizedArray)
    for (const item of payload) sanitizedArray.push(sanitizeAiActionPayload(item, seen, options))
    return sanitizedArray
  }

  if (payload instanceof Date) return payload

  const sanitizedObject = {}
  seen.set(payload, sanitizedObject)
  for (const [key, value] of Object.entries(payload)) {
    sanitizedObject[key] = sanitizeAiActionPayload(value, seen, options)
  }
  return sanitizedObject
}

module.exports = {
  isInternalAiContext,
  sanitizeAiCopy,
  sanitizeAiActionPayload,
}
