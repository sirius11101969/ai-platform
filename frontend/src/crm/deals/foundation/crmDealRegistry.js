import { crmDealDescriptor } from "../domain";
import { crmDealManifest } from "./crmDealManifest";
import { crmDealCapabilities } from "./crmDealCapabilities";

export const crmDealRegistry = Object.freeze({
  key: "crm.deals",
  entity: "crm.deal",
  title: "CRM Deals / Opportunities",
  descriptor: crmDealDescriptor,
  manifest: crmDealManifest,
  capabilities: crmDealCapabilities,
});
