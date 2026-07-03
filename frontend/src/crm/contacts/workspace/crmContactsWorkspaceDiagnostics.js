import { createCrmContactsWorkspaceIntegration } from "./crmContactsWorkspaceIntegration";

export function diagnoseCrmContactsWorkspaceIntegration() {
  const integration = createCrmContactsWorkspaceIntegration();
  const checks = [
    ["REGISTER_WORKSPACE_PANEL", integration.panel.id === "crm.contacts.workspace.panel"],
    ["REGISTER_NAVIGATION", integration.navigation.route === "/crm/contacts"],
    ["REGISTER_HEALTH_SNAPSHOT", integration.snapshot.diagnostic.status === "PASS"],
    ["REGISTER_WORKSPACE_STATE", ["loading", "empty", "ready", "error"].includes(integration.state)],
    ["NO_STORAGE", integration.storageEnabled === false],
    ["NO_API_CALLS", integration.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", integration.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", integration.platformMutation === false],
  ];
  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
