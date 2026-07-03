import { CRM_DEAL_CONTRACT } from "../domain";
import { crmDealCapabilities } from "./crmDealCapabilities";

export const crmDealManifest = Object.freeze({
  module: "CRM_DEALS_OPPORTUNITIES",
  stage: "AS6_EPIC014_SLICE02_CRM_DEALS_FOUNDATION",
  contract: CRM_DEAL_CONTRACT,
  capabilities: crmDealCapabilities,
  invariants: Object.freeze({
    CRM_DEALS_FOUNDATION_ONLY: true,
    REUSE_CONTACTS_FOUNDATION: true,
    REUSE_COMPANIES_FOUNDATION: true,
    CONTACT_LINK_DECLARATIVE_ONLY: true,
    COMPANY_LINK_DECLARATIVE_ONLY: true,
    USE_EXISTING_CRM_WORKSPACE: true,
    USE_EXISTING_CRM_LAYOUT: true,
    NO_PARALLEL_SHELL: true,
    NO_OWN_ROUTER: true,
    NO_OWN_STORE: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
    PLATFORM_MUTATION: false,
  }),
});
