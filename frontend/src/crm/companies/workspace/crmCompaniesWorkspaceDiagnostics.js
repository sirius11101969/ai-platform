import { createCrmCompaniesWorkspaceIntegration } from "./crmCompaniesWorkspaceIntegration";
import { CRM_COMPANIES_WORKSPACE_STATES } from "./crmCompaniesWorkspaceState";

export function diagnoseCrmCompaniesWorkspaceIntegration() {
  const integration = createCrmCompaniesWorkspaceIntegration();
  const checks = [
    ["WORKSPACE_PANEL_REGISTERED", integration.panel.id === "crm.companies.workspace.panel"],
    ["WORKSPACE_NAVIGATION_REGISTERED", integration.navigation.route === "/crm/companies"],
    ["UI_COMPONENT_CONNECTED", Boolean(integration.panel.component)],
    ["FOUNDATION_SNAPSHOT_CONNECTED", integration.foundationSnapshot.diagnostic.status === "PASS"],
    ["UI_SNAPSHOT_CONNECTED", integration.uiSnapshot.diagnostic.status === "PASS"],
    ["WORKSPACE_STATES_PRESENT", CRM_COMPANIES_WORKSPACE_STATES.join("/") === "loading/empty/ready/error"],
    ["USE_EXISTING_CRM_WORKSPACE", integration.useExistingCrmWorkspace === true],
    ["USE_EXISTING_CRM_LAYOUT", integration.useExistingCrmLayout === true],
    ["NO_PARALLEL_SHELL", integration.noParallelShell === true],
    ["NO_STORAGE", integration.storageEnabled === false],
    ["NO_API_CALLS", integration.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", integration.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", integration.platformMutation === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: integration.trace,
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
