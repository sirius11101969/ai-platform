const { sanitizeAiActionPayload } = require('../utils/aiCopySanitizer')

function safeStringify(value) {
  try { return JSON.stringify(value) } catch (_) { return null }
}

function aiCopySanitizerResponseMiddleware(req, res, next) {
  if (process.env.SHOW_INTERNAL_AI_DEBUG === 'true') return next()

  const originalJson = res.json.bind(res)
  res.json = (body) => {
    const before = safeStringify(body)
    const sanitizedBody = sanitizeAiActionPayload(body, new WeakMap(), { logSave: false })
    const after = safeStringify(sanitizedBody)
    if (before !== after) console.warn('[ai-copy-sanitizer] payload sanitized before response')
    return originalJson(sanitizedBody)
  }

  return next()
}

module.exports = { aiCopySanitizerResponseMiddleware }
