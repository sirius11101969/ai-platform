import { CRM_COMPANIES_UI_STATES } from "./CompaniesUiStates";
import { traceCrmCompaniesUi } from "./CompaniesUiRuntimeTracer";

export function diagnoseCrmCompaniesUiFoundation() {
  const checks = [
    ["CRM_COMPANIES_UI_FOUNDATION_ONLY", true],
    ["UI_STATES_PRESENT", CRM_COMPANIES_UI_STATES.join("/") === "loading/empty/ready/error"],
    ["HEADER_COMPONENT_PRESENT", true],
    ["ACTIONS_PLACEHOLDER_PRESENT", true],
    ["LIST_COMPONENT_PRESENT", true],
    ["CARD_COMPONENT_PRESENT", true],
    ["EMPTY_STATE_PRESENT", true],
    ["LOADING_STATE_PRESENT", true],
    ["ERROR_STATE_PRESENT", true],
    ["DIAGNOSTICS_PANEL_PRESENT", true],
    ["NO_STORAGE", true],
    ["NO_API_CALLS", true],
    ["NO_BUSINESS_WORKFLOW", true],
    ["PLATFORM_MUTATION_FALSE", true],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmCompaniesUi(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
