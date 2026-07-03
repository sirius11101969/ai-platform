import { CRM_COMPANY_IDENTITY } from "./crmCompanyIdentity";
import { CRM_COMPANY_STATUSES } from "./crmCompanyStatus";
import { CRM_COMPANY_CATEGORIES } from "./crmCompanyCategory";
import { CRM_COMPANY_LIFECYCLE } from "./crmCompanyLifecycle";
import { CRM_COMPANY_CONTACT_LINK } from "./crmCompanyContactLink";

export const CRM_COMPANY_CONTRACT = Object.freeze({
  stage: "AS6_EPIC013_SLICE01_CRM_COMPANIES_DOMAIN_MODEL",
  module: "CRM_COMPANIES_ACCOUNTS",
  identity: CRM_COMPANY_IDENTITY,
  statuses: CRM_COMPANY_STATUSES,
  categories: CRM_COMPANY_CATEGORIES,
  lifecycle: CRM_COMPANY_LIFECYCLE,
  contactLink: CRM_COMPANY_CONTACT_LINK,
  invariants: Object.freeze({
    CRM_COMPANIES_DOMAIN_MODEL_ONLY: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
    CONTACTS_LINK_DECLARATIVE_ONLY: true,
    PLATFORM_MUTATION: false,
  }),
});
