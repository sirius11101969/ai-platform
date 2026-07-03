import { crmContactsWorkspacePanel, crmContactsWorkspaceNavigation, createCrmContactsWorkspaceIntegration } from "../workspace";

export const crmContactsCrmLayoutBridge = Object.freeze({
  id: "crm.contacts.crm-layout.bridge",
  stage: "AS6_EPIC012_SLICE07_CRM_CONTACTS_CRM_LAYOUT_BRIDGE",
  layoutScope: "crm.unified.layout",
  panel: crmContactsWorkspacePanel,
  navigation: crmContactsWorkspaceNavigation,
  integration: createCrmContactsWorkspaceIntegration,
  breadcrumbs: Object.freeze(["CRM", "Contacts"]),
  activeSection: "contacts",
  states: Object.freeze(["loading", "empty", "ready", "error"]),
  isolatedContainer: false,
  storageEnabled: false,
  apiEnabled: false,
  workflowEnabled: false,
  platformMutation: false,
});
