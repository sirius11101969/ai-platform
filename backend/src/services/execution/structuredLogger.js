const { redact } = require('./redaction')

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
