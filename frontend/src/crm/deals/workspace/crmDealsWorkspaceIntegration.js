import { getCrmDealHealthSnapshot } from "../foundation";
import { getCrmDealsUiHealthSnapshot } from "../ui";
import { crmDealsWorkspacePanel } from "./crmDealsWorkspacePanel";
import { crmDealsWorkspaceNavigation } from "./crmDealsWorkspaceNavigation";
import { resolveCrmDealsWorkspaceState } from "./crmDealsWorkspaceState";
import { traceCrmDealsWorkspace } from "./crmDealsWorkspaceTracer";

export function createCrmDealsWorkspaceIntegration() {
  const foundationSnapshot = getCrmDealHealthSnapshot();
  const uiSnapshot = getCrmDealsUiHealthSnapshot();

  return Object.freeze({
    id: "crm.deals.workspace.integration",
    stage: "AS6_EPIC014_SLICE04_CRM_DEALS_WORKSPACE_INTEGRATION",
    module: "CRM_DEALS_OPPORTUNITIES",
    panel: crmDealsWorkspacePanel,
    navigation: crmDealsWorkspaceNavigation,
    foundationSnapshot,
    uiSnapshot,
    state: resolveCrmDealsWorkspaceState(foundationSnapshot),
    trace: traceCrmDealsWorkspace(),
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
