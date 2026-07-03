import { crmContactsProductionPolish } from "./crmContactsProductionPolish";

export function diagnoseCrmContactsProductionPolish() {
  const checks = [
    ["ACCESSIBILITY_REGION_LABEL", crmContactsProductionPolish.accessibility.regionLabel === true],
    ["ACCESSIBILITY_LIST_LABEL", crmContactsProductionPolish.accessibility.listLabel === true],
    ["ACCESSIBILITY_ROW_LABEL", crmContactsProductionPolish.accessibility.rowLabel === true],
    ["ACCESSIBILITY_STATUS_LABEL", crmContactsProductionPolish.accessibility.statusLabel === true],
    ["STABLE_STATES", crmContactsProductionPolish.states.join("/") === "loading/empty/ready/error"],
    ["PERFORMANCE_NO_RUNTIME_FETCH", crmContactsProductionPolish.performance.noRuntimeFetch === true],
    ["PERFORMANCE_NO_RUNTIME_STORAGE", crmContactsProductionPolish.performance.noRuntimeStorage === true],
    ["PERFORMANCE_NO_HEAVY_DEPENDENCY", crmContactsProductionPolish.performance.noHeavyDependency === true],
    ["NO_STORAGE", crmContactsProductionPolish.storageEnabled === false],
    ["NO_API_CALLS", crmContactsProductionPolish.apiEnabled === false],
    ["NO_BUSINESS_WORKFLOW", crmContactsProductionPolish.workflowEnabled === false],
    ["PLATFORM_MUTATION_FALSE", crmContactsProductionPolish.platformMutation === false],
  ];
  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
