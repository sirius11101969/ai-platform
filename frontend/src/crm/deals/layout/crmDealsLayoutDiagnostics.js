import { crmDealsCrmLayoutBridge } from "./crmDealsCrmLayoutBridge";
import { createCrmDealsLayoutModel } from "./crmDealsLayoutModel";
import { createCrmDealsLayoutSnapshot } from "./crmDealsLayoutState";
import { traceCrmDealsLayout } from "./crmDealsLayoutTracer";

export function diagnoseCrmDealsCrmLayoutBridge() {
  const model = createCrmDealsLayoutModel();
  const snapshot = createCrmDealsLayoutSnapshot();

  const checks = [
    ["CRM_LAYOUT_BRIDGE_REGISTERED", crmDealsCrmLayoutBridge.id === "crm.deals.crm-layout.bridge"],
    ["USE_WORKSPACE_PANEL", crmDealsCrmLayoutBridge.panel.id === "crm.deals.workspace.panel"],
    ["USE_WORKSPACE_NAVIGATION", crmDealsCrmLayoutBridge.navigation.route === "/crm/deals"],
    ["LAYOUT_MODEL_PRESENT", model.id === "crm.deals.layout.model"],
    ["BREADCRUMBS_SYNCED", snapshot.breadcrumbs.join("/") === "CRM/Deals"],
    ["ACTIVE_SECTION_SYNCED", snapshot.activeSection === "deals"],
    ["UNIFIED_STATE_READY", ["loading", "empty", "ready", "error"].includes(snapshot.state)],
    ["USE_EXISTING_CRM_LAYOUT", crmDealsCrmLayoutBridge.useExistingCrmLayout === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmDealsCrmLayoutBridge.useExistingCrmWorkspace === true],
    ["USE_EXISTING_HEADER", crmDealsCrmLayoutBridge.useExistingHeader === true],
    ["USE_EXISTING_SIDEBAR", crmDealsCrmLayoutBridge.useExistingSidebar === true],
    ["NO_PARALLEL_LAYOUT", crmDealsCrmLayoutBridge.noParallelLayout === true],
    ["NO_PARALLEL_SHELL", crmDealsCrmLayoutBridge.noParallelShell === true],
    ["NO_OWN_ROUTER", crmDealsCrmLayoutBridge.ownRouter === false],
    ["NO_OWN_STORE", crmDealsCrmLayoutBridge.ownStore === false],
    ["NO_STORAGE", crmDealsCrmLayoutBridge.storageEnabled === false],
    ["NO_API_CALLS", crmDealsCrmLayoutBridge.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmDealsCrmLayoutBridge.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmDealsCrmLayoutBridge.platformMutation === false],
    ["LAYOUT_TRACER_PRESENT", traceCrmDealsLayout().event === "CRM_DEALS_LAYOUT_BRIDGE_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealsLayout(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
