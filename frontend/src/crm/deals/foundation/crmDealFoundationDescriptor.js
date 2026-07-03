import { crmDealRegistry } from "./crmDealRegistry";
import { crmDealNavigation } from "./crmDealNavigation";
import { crmDealPanels } from "./crmDealPanels";
import { getCrmDealHealthSnapshot } from "./crmDealHealthSnapshot";

export const crmDealFoundationDescriptor = Object.freeze({
  id: "crm.deals.foundation",
  title: "CRM Deals / Opportunities Foundation",
  registry: crmDealRegistry,
  navigation: crmDealNavigation,
  panels: crmDealPanels,
  health: getCrmDealHealthSnapshot,
  readiness: 99,
});
