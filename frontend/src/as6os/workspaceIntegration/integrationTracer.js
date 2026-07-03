export function traceAS6WorkspaceIntegration(event, payload = {}) {
  return {
    source: "AS6_WORKSPACE_INTEGRATION",
    event,
    payload,
    timestamp: new Date().toISOString(),
  };
}
