import { createCrmActivitiesWorkspaceIntegration } from "./crmActivitiesWorkspaceIntegration";
import { getCrmActivitiesWorkspaceHealthSnapshot } from "./crmActivitiesWorkspaceHealthSnapshot";

export const crmActivitiesWorkspaceDescriptor = Object.freeze({
  id: "crm.activities.tasks.workspace.descriptor",
  title: "CRM Activities / Tasks Workspace Integration",
  module: "CRM_ACTIVITIES_TASKS",
  integration: createCrmActivitiesWorkspaceIntegration,
  health: getCrmActivitiesWorkspaceHealthSnapshot,
});
