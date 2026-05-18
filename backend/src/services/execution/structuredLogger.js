function redact(value) {
  if (value === undefined || value === null) return value
  if (typeof value === 'string') {
    if (/^(sk-|Bearer\s+)/i.test(value)) return '[REDACTED]'
    if (value.length > 2048) return `${value.slice(0, 2048)}…[truncated]`
    return value
  }
  if (Array.isArray(value)) return value.map(redact)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /api[_-]?key|secret|token|authorization|password/i.test(key) ? '[REDACTED]' : redact(item),
      ])
    )
  }
  return value
}

function log(level, event, fields = {}) {
  const entry = {
    level,
    event,
    service: 'ai-platform-backend',
    timestamp: new Date().toISOString(),
    ...redact(fields),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

module.exports = {
  debug: (event, fields) => log('debug', event, fields),
  info: (event, fields) => log('info', event, fields),
  warn: (event, fields) => log('warn', event, fields),
  error: (event, fields) => log('error', event, fields),
  redact,
}
