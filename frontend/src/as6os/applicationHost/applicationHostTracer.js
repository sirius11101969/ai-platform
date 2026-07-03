export const as6ApplicationHostTrace = [];

export function traceAS6ApplicationHost(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6ApplicationHostTrace.push(record);
  return record;
}

export function getAS6ApplicationHostTrace() {
  return [...as6ApplicationHostTrace];
}
