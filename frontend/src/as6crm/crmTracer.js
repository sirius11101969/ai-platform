export const as6CrmTrace = [];

export function traceAS6Crm(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6CrmTrace.push(record);
  return record;
}

export function getAS6CrmTrace() {
  return [...as6CrmTrace];
}
