import { ActivitiesUiFoundation } from "../ui";

export const crmActivitiesWorkspacePanel = Object.freeze({
  id: "crm.activities.tasks.workspace.panel",
  title: "Activities / Tasks",
  component: ActivitiesUiFoundation,
  foundation: "crm.activities.tasks.foundation",
  workspace: "existing-crm-workspace",
  layout: "existing-crm-layout",
});
