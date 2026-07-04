import { createCrmActivitiesWorkspaceIntegration } from "./crmActivitiesWorkspaceIntegration";
import { traceCrmActivitiesWorkspace } from "./crmActivitiesWorkspaceTracer";

export function diagnoseCrmActivitiesWorkspaceIntegration() {
  const integration = createCrmActivitiesWorkspaceIntegration();

  const checks = [
    ["WORKSPACE_INTEGRATION_PRESENT", integration.id === "crm.activities.tasks.workspace.integration"],
    ["WORKSPACE_PANEL_PRESENT", integration.panel.id === "crm.activities.tasks.workspace.panel"],
    ["WORKSPACE_NAVIGATION_PRESENT", integration.navigation.route === "/crm/activities"],
    ["WORKSPACE_STATE_READY", integration.state.ready === true],
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
    ["WORKSPACE_TRACER_PRESENT", traceCrmActivitiesWorkspace().event === "CRM_ACTIVITIES_TASKS_WORKSPACE_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmActivitiesWorkspace(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
