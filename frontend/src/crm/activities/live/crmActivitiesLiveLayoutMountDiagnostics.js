import { crmActivitiesLiveLayoutMountContract } from "./crmActivitiesLiveLayoutMountContract";
import { traceCrmActivitiesLiveLayoutMount } from "./crmActivitiesLiveLayoutMountTracer";
import { getCrmActivitiesLayoutHealthSnapshot } from "../layout";

export function diagnoseCrmActivitiesLiveLayoutMount() {
  const layoutHealth = getCrmActivitiesLayoutHealthSnapshot();

  const checks = [
    ["LIVE_LAYOUT_MOUNT_CONTRACT", crmActivitiesLiveLayoutMountContract.id === "crm.activities.tasks.live-layout.mount"],
    ["LAYOUT_HEALTH_PASS", layoutHealth.diagnostic.status === "PASS"],
    ["MOUNTED_IN_PRODUCTION_LAYOUT", crmActivitiesLiveLayoutMountContract.mountedInProductionLayout === true],
    ["USE_EXISTING_CRM_LAYOUT", crmActivitiesLiveLayoutMountContract.useExistingCrmLayout === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmActivitiesLiveLayoutMountContract.useExistingCrmWorkspace === true],
    ["USE_EXISTING_HEADER", crmActivitiesLiveLayoutMountContract.useExistingHeader === true],
    ["USE_EXISTING_SIDEBAR", crmActivitiesLiveLayoutMountContract.useExistingSidebar === true],
    ["USE_EXISTING_ROUTER", crmActivitiesLiveLayoutMountContract.useExistingRouter === true],
    ["NO_OWN_ROUTER", crmActivitiesLiveLayoutMountContract.ownRouter === false],
    ["NO_OWN_STORE", crmActivitiesLiveLayoutMountContract.ownStore === false],
    ["NO_DUPLICATE_ROUTE", crmActivitiesLiveLayoutMountContract.duplicateRoute === false],
    ["NO_DUPLICATE_PANEL", crmActivitiesLiveLayoutMountContract.duplicatePanel === false],
    ["NO_PARALLEL_LAYOUT", crmActivitiesLiveLayoutMountContract.noParallelLayout === true],
    ["NO_PARALLEL_SHELL", crmActivitiesLiveLayoutMountContract.noParallelShell === true],
    ["NO_STORAGE", crmActivitiesLiveLayoutMountContract.storageEnabled === false],
    ["NO_API_CALLS", crmActivitiesLiveLayoutMountContract.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmActivitiesLiveLayoutMountContract.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmActivitiesLiveLayoutMountContract.platformMutation === false],
    ["LIVE_TRACER_PRESENT", traceCrmActivitiesLiveLayoutMount().event === "CRM_ACTIVITIES_TASKS_LIVE_LAYOUT_MOUNT_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmActivitiesLiveLayoutMount(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
