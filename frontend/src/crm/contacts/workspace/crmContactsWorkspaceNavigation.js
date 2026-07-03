import { crmContactsWorkspacePanel } from "./crmContactsWorkspacePanel";

export const crmContactsWorkspaceNavigation = Object.freeze({
  id: "crm.contacts.workspace.navigation",
  section: "CRM",
  label: "Contacts",
  route: crmContactsWorkspacePanel.route,
  panelId: crmContactsWorkspacePanel.id,
  enabled: true,
});
