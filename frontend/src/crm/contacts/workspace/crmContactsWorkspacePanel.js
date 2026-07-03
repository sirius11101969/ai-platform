import { CrmContactsUiFoundation } from "../ui";
import { getCrmContactHealthSnapshot } from "../crmContactHealthSnapshot";
import { crmContactNavigation } from "../crmContactNavigation";

export const crmContactsWorkspacePanel = Object.freeze({
  id: "crm.contacts.workspace.panel",
  title: "CRM Contacts",
  route: crmContactNavigation.route,
  component: CrmContactsUiFoundation,
  foundationOnly: true,
  diagnostics: getCrmContactHealthSnapshot,
  states: Object.freeze(["loading", "empty", "ready", "error"]),
});
