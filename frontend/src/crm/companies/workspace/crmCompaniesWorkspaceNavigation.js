import { crmCompaniesWorkspacePanel } from "./crmCompaniesWorkspacePanel";

export const crmCompaniesWorkspaceNavigation = Object.freeze({
  id: "crm.companies.workspace.navigation",
  section: "CRM",
  label: "Companies",
  route: crmCompaniesWorkspacePanel.route,
  panelId: crmCompaniesWorkspacePanel.id,
  enabled: true,
});
