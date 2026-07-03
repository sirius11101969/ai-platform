import { CRM_COMPANY_CONTRACT } from "../domain";
import { crmCompanyCapabilities } from "./crmCompanyCapabilities";

export const crmCompanyManifest = Object.freeze({
  module: "CRM_COMPANIES_ACCOUNTS",
  stage: "AS6_EPIC013_SLICE02_CRM_COMPANIES_FOUNDATION",
  contract: CRM_COMPANY_CONTRACT,
  capabilities: crmCompanyCapabilities,
  invariants: Object.freeze({
    CRM_COMPANIES_FOUNDATION_ONLY: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
    CONTACTS_LINK_DECLARATIVE_ONLY: true,
    PLATFORM_MUTATION: false,
  }),
});
