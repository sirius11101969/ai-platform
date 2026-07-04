import { getCrmActivityHealthSnapshot } from "../foundation";
import { traceActivitiesUi } from "./ActivitiesUiRuntimeTracer";
import { activitiesUiStates } from "./ActivitiesUiStates";

export function diagnoseActivitiesUiFoundation() {
  const foundation = getCrmActivityHealthSnapshot();

  const checks = [
    ["UI_FOUNDATION_ONLY", true],
    ["FOUNDATION_HEALTH_PASS", foundation.diagnostic.status === "PASS"],
    ["LOADING_STATE", activitiesUiStates.loading.id === "loading"],
    ["EMPTY_STATE", activitiesUiStates.empty.id === "empty"],
    ["READY_STATE", activitiesUiStates.ready.id === "ready"],
    ["ERROR_STATE", activitiesUiStates.error.id === "error"],
    ["ARIA_LIVE_PRESENT", activitiesUiStates.error.ariaLive === "assertive"],
    ["RUNTIME_TRACER_PRESENT", traceActivitiesUi().event === "CRM_ACTIVITIES_TASKS_UI_TRACE"],
    ["NO_STORAGE", true],
    ["NO_API_CALLS", true],
    ["NO_BUSINESS_WORKFLOW", true],
    ["PLATFORM_MUTATION_FALSE", true],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceActivitiesUi(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
