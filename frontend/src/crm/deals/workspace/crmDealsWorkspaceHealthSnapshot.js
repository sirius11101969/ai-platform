import { diagnoseCrmDealsWorkspaceIntegration } from "./crmDealsWorkspaceDiagnostics";
import { traceCrmDealsWorkspace } from "./crmDealsWorkspaceTracer";

export function getCrmDealsWorkspaceHealthSnapshot() {
  return Object.freeze({
    module: "CRM_DEALS_OPPORTUNITIES",
    readiness: 99,
    diagnostic: diagnoseCrmDealsWorkspaceIntegration(),
    trace: traceCrmDealsWorkspace(),
  });
}
