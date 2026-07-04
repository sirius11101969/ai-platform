import { crmActivitiesWorkspacePanel } from "./crmActivitiesWorkspacePanel";
import { crmActivitiesWorkspaceNavigation } from "./crmActivitiesWorkspaceNavigation";
import { resolveCrmActivitiesWorkspaceState } from "./crmActivitiesWorkspaceState";

export function createCrmActivitiesWorkspaceIntegration() {
  return Object.freeze({
    id: "crm.activities.tasks.workspace.integration",
    stage: "AS6_EPIC015_SLICE04_CRM_ACTIVITIES_TASKS_WORKSPACE_INTEGRATION",
    module: "CRM_ACTIVITIES_TASKS",
    panel: crmActivitiesWorkspacePanel,
    navigation: crmActivitiesWorkspaceNavigation,
    state: resolveCrmActivitiesWorkspaceState(),
    useExistingCrmWorkspace: true,
    useExistingCrmLayout: true,
    noParallelShell: true,
    noParallelLayout: true,
    ownRouter: false,
    ownStore: false,
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    platformMutation: false,
  });
}
