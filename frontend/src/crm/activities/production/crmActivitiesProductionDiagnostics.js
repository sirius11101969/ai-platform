import { crmActivitiesProductionContract } from "./crmActivitiesProductionContract";
import { traceCrmActivitiesProduction } from "./crmActivitiesProductionTracer";
import { getCrmActivitiesLiveLayoutMountHealthSnapshot } from "../live";

export function diagnoseCrmActivitiesProductionPolish() {
  const liveHealth = getCrmActivitiesLiveLayoutMountHealthSnapshot();

  const checks = [
    ["PRODUCTION_CONTRACT_PRESENT", crmActivitiesProductionContract.id === "crm.activities.tasks.production.contract"],
    ["LIVE_LAYOUT_HEALTH_PASS", liveHealth.diagnostic.status === "PASS"],
    ["PRODUCTION_READY", crmActivitiesProductionContract.productionReady === true],
    ["ARIA_PRESENT", crmActivitiesProductionContract.accessibility.aria === true],
    ["LIVE_REGIONS_PRESENT", crmActivitiesProductionContract.accessibility.liveRegions === true],
    ["VISIBLE_FOCUS_PRESENT", crmActivitiesProductionContract.accessibility.visibleFocus === true],
    ["SEMANTIC_SECTIONS_PRESENT", crmActivitiesProductionContract.accessibility.semanticSections === true],
    ["PREFERS_REDUCED_MOTION", crmActivitiesProductionContract.motion.prefersReducedMotion === true],
    ["NO_NONESSENTIAL_ANIMATION", crmActivitiesProductionContract.motion.nonEssentialAnimation === false],
    ["CSS_CONTAINMENT", crmActivitiesProductionContract.performance.cssContainment === true],
    ["NO_HEAVY_DEPENDENCIES", crmActivitiesProductionContract.performance.heavyDependencies === false],
    ["NO_RUNTIME_FETCH", crmActivitiesProductionContract.performance.runtimeFetch === false],
    ["NO_RUNTIME_STORAGE", crmActivitiesProductionContract.performance.runtimeStorage === false],
    ["NO_BUSINESS_WORKFLOW", crmActivitiesProductionContract.performance.businessWorkflow === false],
    ["USE_EXISTING_CRM_LAYOUT", crmActivitiesProductionContract.invariants.USE_EXISTING_CRM_LAYOUT === true],
    ["USE_EXISTING_CRM_WORKSPACE", crmActivitiesProductionContract.invariants.USE_EXISTING_CRM_WORKSPACE === true],
    ["USE_EXISTING_HEADER", crmActivitiesProductionContract.invariants.USE_EXISTING_HEADER === true],
    ["USE_EXISTING_SIDEBAR", crmActivitiesProductionContract.invariants.USE_EXISTING_SIDEBAR === true],
    ["NO_PARALLEL_LAYOUT", crmActivitiesProductionContract.invariants.NO_PARALLEL_LAYOUT === true],
    ["NO_PARALLEL_SHELL", crmActivitiesProductionContract.invariants.NO_PARALLEL_SHELL === true],
    ["NO_OWN_ROUTER", crmActivitiesProductionContract.invariants.NO_OWN_ROUTER === true],
    ["NO_OWN_STORE", crmActivitiesProductionContract.invariants.NO_OWN_STORE === true],
    ["NO_STORAGE", crmActivitiesProductionContract.invariants.NO_STORAGE === true],
    ["NO_API_CALLS", crmActivitiesProductionContract.invariants.NO_API_CALLS === true],
    ["PLATFORM_MUTATION_FALSE", crmActivitiesProductionContract.invariants.PLATFORM_MUTATION === false],
    ["PRODUCTION_TRACER_PRESENT", traceCrmActivitiesProduction().event === "CRM_ACTIVITIES_TASKS_PRODUCTION_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmActivitiesProduction(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
