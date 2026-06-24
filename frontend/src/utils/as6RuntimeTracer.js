const TRACE_EVENT = "as6-runtime-trace";

export function traceAs6Runtime(eventName, payload = {}) {
  const detail = {
    source: "AS6_RUNTIME_TRACER_V220",
    eventName,
    payload,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent(TRACE_EVENT, { detail }));
  }

  return detail;
}

export function markAs6DesignSystemReady(payload = {}) {
  return traceAs6Runtime("AS6_DESIGN_SYSTEM_FOUNDATION_READY", {
    version: "v220",
    ...payload,
  });
}

export const AS6_RUNTIME_TRACE_EVENT = TRACE_EVENT;
