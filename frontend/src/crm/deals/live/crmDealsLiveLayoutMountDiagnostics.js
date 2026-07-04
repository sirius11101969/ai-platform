import { crmDealsLiveLayoutMountContract } from "./crmDealsLiveLayoutMountContract";
import { traceCrmDealsLiveLayoutMount } from "./crmDealsLiveLayoutMountTracer";
import { getCrmDealsLayoutHealthSnapshot } from "../layout";

export function diagnoseCrmDealsLiveLayoutMount() {
  const layoutHealth = getCrmDealsLayoutHealthSnapshot();

  const checks = [
    ["LIVE_LAYOUT_MOUNT_CONTRACT", crmDealsLiveLayoutMountContract.id === "crm.deals.live-layout.mount"],
    ["MOUNTED_IN_PRODUCTION_LAYOUT", crmDealsLiveLayoutMountContract.mountedInProductionLayout === true],
    ["ROUTE_CONNECTED", crmDealsLiveLayoutMountContract.route === "/crm/deals"],
    ["ACTIVE_SECTION_CONNECTED", crmDealsLiveLayoutMountContract.activeSection === "deals"],
    ["LAYOUT_HEALTH_CONNECTED", layoutHealth.diagnostic.status === "PASS"],
    ["USE_EXISTING_CRM_LAYOUT", crmDealsLiveLayoutMountContract.useExistingCrmLayout === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmDealsLiveLayoutMountContract.useExistingCrmWorkspace === true],
    ["USE_EXISTING_ROUTER", crmDealsLiveLayoutMountContract.useExistingRouter === true],
    ["NO_OWN_ROUTER", crmDealsLiveLayoutMountContract.ownRouter === false],
    ["NO_OWN_STORE", crmDealsLiveLayoutMountContract.ownStore === false],
    ["NO_DUPLICATE_ROUTE", crmDealsLiveLayoutMountContract.duplicateRoute === false],
    ["NO_DUPLICATE_PANEL", crmDealsLiveLayoutMountContract.duplicatePanel === false],
    ["NO_PARALLEL_LAYOUT", crmDealsLiveLayoutMountContract.noParallelLayout === true],
    ["NO_PARALLEL_SHELL", crmDealsLiveLayoutMountContract.noParallelShell === true],
    ["NO_STORAGE", crmDealsLiveLayoutMountContract.storageEnabled === false],
    ["NO_API_CALLS", crmDealsLiveLayoutMountContract.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmDealsLiveLayoutMountContract.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmDealsLiveLayoutMountContract.platformMutation === false],
    ["LIVE_TRACER_PRESENT", traceCrmDealsLiveLayoutMount().event === "CRM_DEALS_LIVE_LAYOUT_MOUNT_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealsLiveLayoutMount(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
