const traceEvents = []

export function traceCrmKanbanRuntime(event, payload = {}) {
  const entry = Object.freeze({
    ts: new Date().toISOString(),
    domain: 'crm.kanban',
    event,
    payload,
  })
  traceEvents.push(entry)
  return entry
}

export function getCrmKanbanTraceEvents() {
  return [...traceEvents]
}

export function clearCrmKanbanTraceEvents() {
  traceEvents.length = 0
}
