import { crmCompaniesCrmLayoutBridge } from "./crmCompaniesCrmLayoutBridge";
import { createCrmCompaniesLayoutModel } from "./crmCompaniesLayoutModel";
import { createCrmCompaniesLayoutSnapshot } from "./crmCompaniesLayoutState";
import { traceCrmCompaniesLayout } from "./crmCompaniesLayoutTracer";

export function diagnoseCrmCompaniesCrmLayoutBridge() {
  const model = createCrmCompaniesLayoutModel();
  const snapshot = createCrmCompaniesLayoutSnapshot();

  const checks = [
    ["CRM_LAYOUT_BRIDGE_REGISTERED", crmCompaniesCrmLayoutBridge.id === "crm.companies.crm-layout.bridge"],
    ["USE_EXISTING_WORKSPACE_PANEL", crmCompaniesCrmLayoutBridge.panel.id === "crm.companies.workspace.panel"],
    ["USE_EXISTING_NAVIGATION", crmCompaniesCrmLayoutBridge.navigation.route === "/crm/companies"],
    ["BREADCRUMBS_SYNCED", snapshot.breadcrumbs.join("/") === "CRM/Companies"],
    ["ACTIVE_SECTION_SYNCED", snapshot.activeSection === "companies"],
    ["UNIFIED_STATE_READY", ["loading", "empty", "ready", "error"].includes(snapshot.state)],
    ["USE_EXISTING_CRM_LAYOUT", crmCompaniesCrmLayoutBridge.useExistingCrmLayout === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmCompaniesCrmLayoutBridge.useExistingCrmWorkspace === true],
    ["USE_EXISTING_HEADER", crmCompaniesCrmLayoutBridge.useExistingHeader === true],
    ["USE_EXISTING_SIDEBAR", crmCompaniesCrmLayoutBridge.useExistingSidebar === true],
    ["NO_PARALLEL_LAYOUT", crmCompaniesCrmLayoutBridge.noParallelLayout === true],
    ["NO_PARALLEL_SHELL", crmCompaniesCrmLayoutBridge.noParallelShell === true],
    ["NO_OWN_ROUTER", crmCompaniesCrmLayoutBridge.ownRouter === false],
    ["NO_OWN_STORE", crmCompaniesCrmLayoutBridge.ownStore === false],
    ["NO_STORAGE", crmCompaniesCrmLayoutBridge.storageEnabled === false],
    ["NO_API_CALLS", crmCompaniesCrmLayoutBridge.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmCompaniesCrmLayoutBridge.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmCompaniesCrmLayoutBridge.platformMutation === false],
    ["MODEL_COMPONENT_CONNECTED", Boolean(model.component)],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmCompaniesLayout(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
