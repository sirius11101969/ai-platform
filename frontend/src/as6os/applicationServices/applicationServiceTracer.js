export const as6ApplicationServiceTrace = [];

export function traceAS6ApplicationService(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6ApplicationServiceTrace.push(record);
  return record;
}

export function getAS6ApplicationServiceTrace() {
  return [...as6ApplicationServiceTrace];
}
