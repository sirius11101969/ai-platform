const traceEvents = []

export function traceCrmFiltersRuntime(event, payload = {}) {
  const entry = Object.freeze({
    ts: new Date().toISOString(),
    domain: 'crm.filters',
    event,
    payload,
  })
  traceEvents.push(entry)
  return entry
}

export function getCrmFiltersTraceEvents() {
  return [...traceEvents]
}

export function clearCrmFiltersTraceEvents() {
  traceEvents.length = 0
}
