export const as6CrmDomainTrace = [];

export function traceAS6CrmDomain(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6CrmDomainTrace.push(record);
  return record;
}

export function getAS6CrmDomainTrace() {
  return [...as6CrmDomainTrace];
}
