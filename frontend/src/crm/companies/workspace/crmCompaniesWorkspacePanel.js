import { CompaniesUiFoundation } from "../ui";
import { getCrmCompanyHealthSnapshot } from "../foundation";

export const crmCompaniesWorkspacePanel = Object.freeze({
  id: "crm.companies.workspace.panel",
  title: "CRM Companies",
  route: "/crm/companies",
  component: CompaniesUiFoundation,
  foundationOnly: true,
  diagnostics: getCrmCompanyHealthSnapshot,
  states: Object.freeze(["loading", "empty", "ready", "error"]),
});
