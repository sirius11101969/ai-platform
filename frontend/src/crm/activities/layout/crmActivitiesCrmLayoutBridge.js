import { crmActivitiesWorkspacePanel, crmActivitiesWorkspaceNavigation, createCrmActivitiesWorkspaceIntegration } from "../workspace";
import { crmActivitiesLayoutModel } from "./crmActivitiesLayoutModel";

export const crmActivitiesCrmLayoutBridge = Object.freeze({
  id: "crm.activities.tasks.crm-layout.bridge",
  stage: "AS6_EPIC015_SLICE05_CRM_ACTIVITIES_TASKS_CRM_LAYOUT_BRIDGE",
  module: "CRM_ACTIVITIES_TASKS",
  layoutModel: crmActivitiesLayoutModel,
  workspaceIntegration: createCrmActivitiesWorkspaceIntegration(),
  panel: crmActivitiesWorkspacePanel,
  navigation: crmActivitiesWorkspaceNavigation,
  breadcrumbs: crmActivitiesLayoutModel.breadcrumbs,
  activeSection: crmActivitiesLayoutModel.activeSection,
  useExistingCrmLayout: true,
  useExistingCrmWorkspace: true,
  useExistingHeader: true,
  useExistingSidebar: true,
  noParallelLayout: true,
  noParallelShell: true,
  ownRouter: false,
  ownStore: false,
  storageEnabled: false,
  apiEnabled: false,
  workflowEnabled: false,
  platformMutation: false,
});
