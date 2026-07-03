export const as6RuntimeServicesTrace = [];

export function traceAS6RuntimeServices(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6RuntimeServicesTrace.push(record);
  return record;
}

export function getAS6RuntimeServicesTrace() {
  return [...as6RuntimeServicesTrace];
}
