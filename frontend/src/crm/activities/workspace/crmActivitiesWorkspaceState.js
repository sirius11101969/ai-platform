import { getActivitiesUiHealthSnapshot } from "../ui";
import { getCrmActivityHealthSnapshot } from "../foundation";

export function resolveCrmActivitiesWorkspaceState() {
  const ui = getActivitiesUiHealthSnapshot();
  const foundation = getCrmActivityHealthSnapshot();

  return Object.freeze({
    id: "crm.activities.tasks.workspace.state",
    ready: ui.diagnostic.status === "PASS" && foundation.diagnostic.status === "PASS",
    ui,
    foundation,
    states: Object.freeze(["loading", "empty", "ready", "error"]),
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    ownRouter: false,
    ownStore: false,
    platformMutation: false,
  });
}
