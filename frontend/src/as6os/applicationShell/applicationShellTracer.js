export const as6ApplicationShellTrace = [];

export function traceAS6ApplicationShell(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6ApplicationShellTrace.push(record);
  return record;
}

export function getAS6ApplicationShellTrace() {
  return [...as6ApplicationShellTrace];
}
