import { crmCompaniesProductionPolish } from "./crmCompaniesProductionPolish";
import { traceCrmCompaniesProductionPolish } from "./crmCompaniesProductionTracer";

export function diagnoseCrmCompaniesProductionPolish() {
  const checks = [
    ["ACCESSIBILITY_REGION_LABEL", crmCompaniesProductionPolish.accessibility.regionLabel === true],
    ["ACCESSIBILITY_LIST_LABEL", crmCompaniesProductionPolish.accessibility.listLabel === true],
    ["ACCESSIBILITY_CARD_LABEL", crmCompaniesProductionPolish.accessibility.cardLabel === true],
    ["ACCESSIBILITY_STATUS_LABEL", crmCompaniesProductionPolish.accessibility.statusLabel === true],
    ["ACCESSIBILITY_ACTIONS_LABEL", crmCompaniesProductionPolish.accessibility.actionsLabel === true],
    ["ACCESSIBILITY_DIAGNOSTICS_LABEL", crmCompaniesProductionPolish.accessibility.diagnosticsLabel === true],
    ["STABLE_STATES", crmCompaniesProductionPolish.states.join("/") === "loading/empty/ready/error"],
    ["PERFORMANCE_NO_RUNTIME_FETCH", crmCompaniesProductionPolish.performance.noRuntimeFetch === true],
    ["PERFORMANCE_NO_RUNTIME_STORAGE", crmCompaniesProductionPolish.performance.noRuntimeStorage === true],
    ["PERFORMANCE_NO_HEAVY_DEPENDENCY", crmCompaniesProductionPolish.performance.noHeavyDependency === true],
    ["DESIGN_SYSTEM_PRODUCTION_SCOPE", crmCompaniesProductionPolish.designSystem.productionScope === "as6-crm-companies-ui--production"],
    ["DESIGN_SYSTEM_REDUCED_MOTION", crmCompaniesProductionPolish.designSystem.reducedMotion === true],
    ["NO_STORAGE", crmCompaniesProductionPolish.storageEnabled === false],
    ["NO_API_CALLS", crmCompaniesProductionPolish.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmCompaniesProductionPolish.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmCompaniesProductionPolish.platformMutation === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmCompaniesProductionPolish(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
