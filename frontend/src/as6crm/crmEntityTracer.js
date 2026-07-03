export const as6CrmEntityTrace = [];

export function traceAS6CrmEntity(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6CrmEntityTrace.push(record);
  return record;
}

export function getAS6CrmEntityTrace() {
  return [...as6CrmEntityTrace];
}
