import { diagnoseCrmActivitiesLiveLayoutMount } from "./crmActivitiesLiveLayoutMountDiagnostics";
import { traceCrmActivitiesLiveLayoutMount } from "./crmActivitiesLiveLayoutMountTracer";

export function getCrmActivitiesLiveLayoutMountHealthSnapshot() {
  return Object.freeze({
    module: "CRM_ACTIVITIES_TASKS",
    readiness: 99,
    diagnostic: diagnoseCrmActivitiesLiveLayoutMount(),
    trace: traceCrmActivitiesLiveLayoutMount(),
  });
}
