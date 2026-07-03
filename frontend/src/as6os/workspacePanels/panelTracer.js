export function traceAS6WorkspacePanel(event, payload = {}) {
  return {
    source: "AS6_WORKSPACE_PANELS",
    event,
    payload,
    timestamp: new Date().toISOString(),
  };
}
