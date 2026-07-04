import { crmDealsProductionContract } from "./crmDealsProductionContract";
import { traceCrmDealsProduction } from "./crmDealsProductionTracer";
import { getCrmDealsLiveLayoutMountHealthSnapshot } from "../live";
import { getCrmDealsLayoutHealthSnapshot } from "../layout";
import { getCrmDealsUiHealthSnapshot } from "../ui";

export function diagnoseCrmDealsProductionPolish() {
  const live = getCrmDealsLiveLayoutMountHealthSnapshot();
  const layout = getCrmDealsLayoutHealthSnapshot();
  const ui = getCrmDealsUiHealthSnapshot();

  const checks = [
    ["PRODUCTION_CONTRACT_PRESENT", crmDealsProductionContract.productionReady === true],
    ["LIVE_MOUNT_HEALTH_PASS", live.diagnostic.status === "PASS"],
    ["LAYOUT_HEALTH_PASS", layout.diagnostic.status === "PASS"],
    ["UI_HEALTH_PASS", ui.diagnostic.status === "PASS"],
    ["ARIA_REQUIRED", crmDealsProductionContract.accessibility.aria === true],
    ["KEYBOARD_SAFE", crmDealsProductionContract.accessibility.keyboardSafe === true],
    ["VISIBLE_FOCUS", crmDealsProductionContract.accessibility.visibleFocus === true],
    ["PREFERS_REDUCED_MOTION", crmDealsProductionContract.motion.prefersReducedMotion === true],
    ["NO_REQUIRED_ANIMATION", crmDealsProductionContract.motion.requiredAnimation === false],
    ["NO_RUNTIME_FETCH", crmDealsProductionContract.performance.runtimeFetch === false],
    ["NO_RUNTIME_STORAGE", crmDealsProductionContract.performance.runtimeStorage === false],
    ["NO_HEAVY_DEPENDENCIES", crmDealsProductionContract.performance.heavyDependencies === false],
    ["USE_EXISTING_CRM_LAYOUT", crmDealsProductionContract.invariants.USE_EXISTING_CRM_LAYOUT === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmDealsProductionContract.invariants.USE_EXISTING_CRM_WORKSPACE === true],
    ["NO_PARALLEL_LAYOUT", crmDealsProductionContract.invariants.NO_PARALLEL_LAYOUT === true],
    ["NO_PARALLEL_SHELL", crmDealsProductionContract.invariants.NO_PARALLEL_SHELL === true],
    ["NO_OWN_ROUTER", crmDealsProductionContract.invariants.NO_OWN_ROUTER === true],
    ["NO_OWN_STORE", crmDealsProductionContract.invariants.NO_OWN_STORE === true],
    ["NO_STORAGE", crmDealsProductionContract.invariants.NO_STORAGE === true],
    ["NO_API_CALLS", crmDealsProductionContract.invariants.NO_API_CALLS === true],
    ["NO_BUSINESS_WORKFLOW", crmDealsProductionContract.invariants.NO_BUSINESS_WORKFLOW === true],
    ["PLATFORM_MUTATION_FALSE", crmDealsProductionContract.invariants.PLATFORM_MUTATION === false],
    ["PRODUCTION_TRACER_PRESENT", traceCrmDealsProduction().event === "CRM_DEALS_PRODUCTION_POLISH_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealsProduction(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
