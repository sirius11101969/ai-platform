import { crmActivitiesCrmLayoutBridge } from "./crmActivitiesCrmLayoutBridge";
import { crmActivitiesLayoutModel } from "./crmActivitiesLayoutModel";
import { resolveCrmActivitiesLayoutState } from "./crmActivitiesLayoutStateResolver";
import { traceCrmActivitiesLayout } from "./crmActivitiesLayoutRuntimeTracer";

export function diagnoseCrmActivitiesLayoutBridge() {
  const state = resolveCrmActivitiesLayoutState();

  const checks = [
    ["CRM_LAYOUT_BRIDGE_PRESENT", crmActivitiesCrmLayoutBridge.id === "crm.activities.tasks.crm-layout.bridge"],
    ["LAYOUT_MODEL_PRESENT", crmActivitiesLayoutModel.id === "crm.activities.tasks.layout.model"],
    ["LAYOUT_STATE_READY", state.ready === true],
    ["BREADCRUMBS_SYNCED", crmActivitiesCrmLayoutBridge.breadcrumbs.includes("Activities / Tasks")],
    ["ACTIVE_SECTION_SYNCED", crmActivitiesCrmLayoutBridge.activeSection === "activities"],
    ["USE_EXISTING_CRM_LAYOUT", crmActivitiesCrmLayoutBridge.useExistingCrmLayout === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmActivitiesCrmLayoutBridge.useExistingCrmWorkspace === true],
    ["USE_EXISTING_HEADER", crmActivitiesCrmLayoutBridge.useExistingHeader === true],
    ["USE_EXISTING_SIDEBAR", crmActivitiesCrmLayoutBridge.useExistingSidebar === true],
    ["NO_PARALLEL_LAYOUT", crmActivitiesCrmLayoutBridge.noParallelLayout === true],
    ["NO_PARALLEL_SHELL", crmActivitiesCrmLayoutBridge.noParallelShell === true],
    ["NO_OWN_ROUTER", crmActivitiesCrmLayoutBridge.ownRouter === false],
    ["NO_OWN_STORE", crmActivitiesCrmLayoutBridge.ownStore === false],
    ["NO_STORAGE", crmActivitiesCrmLayoutBridge.storageEnabled === false],
    ["NO_API_CALLS", crmActivitiesCrmLayoutBridge.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmActivitiesCrmLayoutBridge.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmActivitiesCrmLayoutBridge.platformMutation === false],
    ["LAYOUT_TRACER_PRESENT", traceCrmActivitiesLayout().event === "CRM_ACTIVITIES_TASKS_LAYOUT_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmActivitiesLayout(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
