function appendTranscript(current = [], chunk = {}) {
  return [...current, { role: chunk.role || 'system', text: chunk.text || '', createdAt: new Date().toISOString() }]
}

function computeLatency(events = []) {
  const start = events.find((e) => e.eventType === 'session_started')
  const end = events.findLast ? events.findLast((e) => e.eventType === 'completed') : [...events].reverse().find((e) => e.eventType === 'completed')
  if (!start || !end) return null
  return Math.max(0, new Date(end.createdAt).getTime() - new Date(start.createdAt).getTime())
}

module.exports = { appendTranscript, computeLatency }
