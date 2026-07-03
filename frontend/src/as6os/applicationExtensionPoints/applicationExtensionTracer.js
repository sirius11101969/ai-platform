export const as6ExtensionTrace = [];

export function traceAS6Extension(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6ExtensionTrace.push(record);
  return record;
}

export function getAS6ExtensionTrace() {
  return [...as6ExtensionTrace];
}
