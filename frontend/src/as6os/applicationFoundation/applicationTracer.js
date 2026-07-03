export const as6ApplicationTrace = [];

export function traceAS6Application(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6ApplicationTrace.push(record);
  return record;
}

export function getAS6ApplicationTrace() {
  return [...as6ApplicationTrace];
}
