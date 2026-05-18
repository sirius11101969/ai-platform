const REDACTED = '[REDACTED]'
const TRUNCATED_SUFFIX = '…[truncated]'

const SENSITIVE_KEY_PATTERN = /api[_-]?key|secret|access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|password|prompt(?!Tokens?$)|input|instructions|raw|response|text|content/i
const SECRET_VALUE_PATTERN = /\b(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._~+/-]+=*|[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{12,})\b/g
const MAX_SAFE_STRING_LENGTH = 512

function redactString(value) {
  const replaced = value.replace(SECRET_VALUE_PATTERN, REDACTED)
  if (replaced.length > MAX_SAFE_STRING_LENGTH) {
    return `${replaced.slice(0, MAX_SAFE_STRING_LENGTH)}${TRUNCATED_SUFFIX}`
  }
  return replaced
}

function redact(value, seen = new WeakSet()) {
  if (value === undefined || value === null) return value
  if (typeof value === 'string') return redactString(value)
  if (typeof value !== 'object') return value
  if (value instanceof Date) return value
  if (seen.has(value)) return '[Circular]'
  seen.add(value)

  if (Array.isArray(value)) return value.map((item) => redact(item, seen))

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redact(item, seen),
    ])
  )
}

function redactForExecutionLog(value) {
  return redact(value)
}

module.exports = {
  REDACTED,
  redact,
  redactForExecutionLog,
}
