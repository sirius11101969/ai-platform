import { diagnoseActivitiesUiFoundation } from "./ActivitiesUiDiagnostics";
import { traceActivitiesUi } from "./ActivitiesUiRuntimeTracer";

export function getActivitiesUiHealthSnapshot() {
  return Object.freeze({
    module: "CRM_ACTIVITIES_TASKS",
    readiness: 99,
    diagnostic: diagnoseActivitiesUiFoundation(),
    trace: traceActivitiesUi(),
  });
}
