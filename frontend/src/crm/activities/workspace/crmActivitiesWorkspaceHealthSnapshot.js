import { diagnoseCrmActivitiesWorkspaceIntegration } from "./crmActivitiesWorkspaceDiagnostics";
import { traceCrmActivitiesWorkspace } from "./crmActivitiesWorkspaceTracer";

export function getCrmActivitiesWorkspaceHealthSnapshot() {
  return Object.freeze({
    module: "CRM_ACTIVITIES_TASKS",
    readiness: 99,
    diagnostic: diagnoseCrmActivitiesWorkspaceIntegration(),
    trace: traceCrmActivitiesWorkspace(),
  });
}
