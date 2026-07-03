import { getCrmContactHealthSnapshot } from "../crmContactHealthSnapshot";
import { crmContactsWorkspacePanel } from "./crmContactsWorkspacePanel";
import { crmContactsWorkspaceNavigation } from "./crmContactsWorkspaceNavigation";
import { resolveCrmContactsWorkspaceState } from "./crmContactsWorkspaceState";

export function createCrmContactsWorkspaceIntegration() {
  const snapshot = getCrmContactHealthSnapshot();
  return Object.freeze({
    id: "crm.contacts.workspace.integration",
    stage: "AS6_EPIC012_SLICE06_CRM_CONTACTS_WORKSPACE_INTEGRATION",
    panel: crmContactsWorkspacePanel,
    navigation: crmContactsWorkspaceNavigation,
    snapshot,
    state: resolveCrmContactsWorkspaceState(snapshot),
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    platformMutation: false,
  });
}
