export const as6ApplicationIntegrationTrace = [];

export function traceAS6ApplicationIntegration(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6ApplicationIntegrationTrace.push(record);
  return record;
}

export function getAS6ApplicationIntegrationTrace() {
  return [...as6ApplicationIntegrationTrace];
}
