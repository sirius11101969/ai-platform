import { diagnoseCrmActivitiesLayoutBridge } from "./crmActivitiesLayoutDiagnostics";
import { traceCrmActivitiesLayout } from "./crmActivitiesLayoutRuntimeTracer";

export function getCrmActivitiesLayoutHealthSnapshot() {
  return Object.freeze({
    module: "CRM_ACTIVITIES_TASKS",
    readiness: 99,
    diagnostic: diagnoseCrmActivitiesLayoutBridge(),
    trace: traceCrmActivitiesLayout(),
  });
}
