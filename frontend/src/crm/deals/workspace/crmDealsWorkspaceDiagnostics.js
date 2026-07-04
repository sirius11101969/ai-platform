import { createCrmDealsWorkspaceIntegration } from "./crmDealsWorkspaceIntegration";
import { CRM_DEALS_WORKSPACE_STATES } from "./crmDealsWorkspaceState";
import { traceCrmDealsWorkspace } from "./crmDealsWorkspaceTracer";

export function diagnoseCrmDealsWorkspaceIntegration() {
  const integration = createCrmDealsWorkspaceIntegration();

  const checks = [
    ["WORKSPACE_INTEGRATION_PRESENT", integration.id === "crm.deals.workspace.integration"],
    ["WORKSPACE_PANEL_REGISTERED", integration.panel.id === "crm.deals.workspace.panel"],
    ["WORKSPACE_NAVIGATION_REGISTERED", integration.navigation.route === "/crm/deals"],
    ["WORKSPACE_STATES_PRESENT", CRM_DEALS_WORKSPACE_STATES.join("/") === "loading/empty/ready/error"],
    ["UI_FOUNDATION_CONNECTED", Boolean(integration.panel.component)],
    ["FOUNDATION_HEALTH_CONNECTED", integration.foundationSnapshot.diagnostic.status === "PASS"],
    ["UI_HEALTH_CONNECTED", integration.uiSnapshot.diagnostic.status === "PASS"],
    ["USE_EXISTING_CRM_WORKSPACE", integration.useExistingCrmWorkspace === true],
    ["USE_EXISTING_CRM_LAYOUT", integration.useExistingCrmLayout === true],
    ["NO_PARALLEL_SHELL", integration.noParallelShell === true],
    ["NO_PARALLEL_LAYOUT", integration.noParallelLayout === true],
    ["NO_OWN_ROUTER", integration.ownRouter === false],
    ["NO_OWN_STORE", integration.ownStore === false],
    ["NO_STORAGE", integration.storageEnabled === false],
    ["NO_API_CALLS", integration.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", integration.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", integration.platformMutation === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealsWorkspace(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
