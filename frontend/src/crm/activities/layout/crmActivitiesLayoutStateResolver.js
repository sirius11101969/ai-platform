import { crmActivitiesCrmLayoutBridge } from "./crmActivitiesCrmLayoutBridge";
import { getCrmActivitiesWorkspaceHealthSnapshot } from "../workspace";

export function resolveCrmActivitiesLayoutState() {
  const workspaceHealth = getCrmActivitiesWorkspaceHealthSnapshot();

  return Object.freeze({
    id: "crm.activities.tasks.layout.state",
    ready: workspaceHealth.diagnostic.status === "PASS",
    bridge: crmActivitiesCrmLayoutBridge.id,
    breadcrumbs: crmActivitiesCrmLayoutBridge.breadcrumbs,
    activeSection: crmActivitiesCrmLayoutBridge.activeSection,
    workspaceHealth,
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    ownRouter: false,
    ownStore: false,
    platformMutation: false,
  });
}
