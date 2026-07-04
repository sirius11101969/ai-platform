const traceEvents = []

export function traceCrmAnalyticsRuntime(event, payload = {}) {
  const entry = Object.freeze({
    ts: new Date().toISOString(),
    domain: 'crm.analytics',
    event,
    payload,
  })
  traceEvents.push(entry)
  return entry
}

export function getCrmAnalyticsTraceEvents() {
  return [...traceEvents]
}

export function clearCrmAnalyticsTraceEvents() {
  traceEvents.length = 0
}
