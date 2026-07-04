const traceEvents = []

export function traceCrmFollowupRuntime(event) {
  const entry = Object.freeze({
    ts: new Date().toISOString(),
    domain: 'crm.followups',
    event,
  })
  traceEvents.push(entry)
  return entry
}

export function getCrmFollowupTraceEvents() {
  return [...traceEvents]
}

export function clearCrmFollowupTraceEvents() {
  traceEvents.length = 0
}
