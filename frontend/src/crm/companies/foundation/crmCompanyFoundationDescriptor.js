import { crmCompanyRegistry } from "./crmCompanyRegistry";
import { crmCompanyNavigation } from "./crmCompanyNavigation";
import { crmCompanyPanels } from "./crmCompanyPanels";
import { getCrmCompanyHealthSnapshot } from "./crmCompanyHealthSnapshot";

export const crmCompanyFoundationDescriptor = Object.freeze({
  id: "crm.companies.foundation",
  title: "CRM Companies Foundation",
  registry: crmCompanyRegistry,
  navigation: crmCompanyNavigation,
  panels: crmCompanyPanels,
  health: getCrmCompanyHealthSnapshot,
  readiness: 99,
});
