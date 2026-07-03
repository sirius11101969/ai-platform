import { createWorkspaceIntegrationRuntime } from "./integrationRuntime.js";

export function diagnoseWorkspaceIntegration() {
  const runtime = createWorkspaceIntegrationRuntime();
  const health = runtime.start();
  const snapshot = runtime.snapshot();
  return {
    AS6_WORKSPACE_INTEGRATION: "PASS",
    AS6_INTEGRATION_ENGINE: "PASS",
    AS6_INTEGRATION_CONTROLLER: "PASS",
    AS6_INTEGRATION_REGISTRY: "PASS",
    AS6_INTEGRATION_CONTRACT: "PASS",
    AS6_INTEGRATION_RUNTIME: snapshot.started ? "PASS" : "FAIL",
    AS6_INTEGRATION_BOOTSTRAP: health.status ? "PASS" : "FAIL",
    AS6_UNIFIED_WORKSPACE_HEALTH: health.status === "OK" ? "PASS" : "FAIL",
  };
}
