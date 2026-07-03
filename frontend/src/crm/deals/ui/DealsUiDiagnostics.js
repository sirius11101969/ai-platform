import { CRM_DEALS_UI_STATES } from "./DealsUiStates";
import { traceCrmDealsUi } from "./DealsUiRuntimeTracer";

export function diagnoseCrmDealsUiFoundation() {
  const checks = [
    ["UI_FOUNDATION_PRESENT", true],
    ["UI_STATES_PRESENT", CRM_DEALS_UI_STATES.join("/") === "loading/empty/ready/error"],
    ["UI_RUNTIME_TRACER_PRESENT", traceCrmDealsUi().event === "CRM_DEALS_UI_TRACE"],
    ["DESIGN_SYSTEM_SCOPE", traceCrmDealsUi().designSystem === "crm-shared-foundation"],
    ["NO_STORAGE", traceCrmDealsUi().storage === "disabled"],
    ["NO_API_CALLS", traceCrmDealsUi().apiCalls === "disabled"],
    ["NO_BUSINESS_WORKFLOW", traceCrmDealsUi().workflow === "disabled"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealsUi(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
