import { DealsUiFoundation } from "../ui";
import { getCrmDealHealthSnapshot } from "../foundation";

export const crmDealsWorkspacePanel = Object.freeze({
  id: "crm.deals.workspace.panel",
  title: "CRM Deals / Opportunities",
  route: "/crm/deals",
  component: DealsUiFoundation,
  foundationOnly: true,
  diagnostics: getCrmDealHealthSnapshot,
  states: Object.freeze(["loading", "empty", "ready", "error"]),
});
