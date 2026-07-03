import { crmCompanyDescriptor } from "../domain";
import { crmCompanyManifest } from "./crmCompanyManifest";
import { crmCompanyCapabilities } from "./crmCompanyCapabilities";

export const crmCompanyRegistry = Object.freeze({
  key: "crm.companies",
  entity: "crm.company",
  title: "CRM Companies / Accounts",
  descriptor: crmCompanyDescriptor,
  manifest: crmCompanyManifest,
  capabilities: crmCompanyCapabilities,
});
