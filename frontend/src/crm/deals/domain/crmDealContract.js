import { CRM_DEAL_IDENTITY } from "./crmDealIdentity";
import { CRM_DEAL_STATUS } from "./crmDealStatus";
import { CRM_DEAL_PIPELINE } from "./crmDealPipeline";
import { CRM_DEAL_STAGE } from "./crmDealStage";
import { CRM_DEAL_LIFECYCLE } from "./crmDealLifecycle";
import { CRM_DEAL_COMPANY_LINK } from "./crmDealCompanyLink";
import { CRM_DEAL_CONTACT_LINK } from "./crmDealContactLink";

export const CRM_DEAL_CONTRACT = Object.freeze({
  stage: "AS6_EPIC014_SLICE01_CRM_DEALS_DOMAIN_MODEL",
  module: "CRM_DEALS_OPPORTUNITIES",
  identity: CRM_DEAL_IDENTITY,
  statuses: CRM_DEAL_STATUS,
  pipeline: CRM_DEAL_PIPELINE,
  stages: CRM_DEAL_STAGE,
  lifecycle: CRM_DEAL_LIFECYCLE,
  links: Object.freeze({
    company: CRM_DEAL_COMPANY_LINK,
    contact: CRM_DEAL_CONTACT_LINK,
  }),
  fields: Object.freeze([
    "id",
    "title",
    "amount",
    "currency",
    "status",
    "stage",
    "companyId",
    "contactId",
    "expectedCloseDate",
  ]),
  invariants: Object.freeze({
    CRM_DEALS_DOMAIN_MODEL_ONLY: true,
    REUSE_CONTACTS_FOUNDATION: true,
    REUSE_COMPANIES_FOUNDATION: true,
    CONTACT_LINK_DECLARATIVE_ONLY: true,
    COMPANY_LINK_DECLARATIVE_ONLY: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
    PLATFORM_MUTATION: false,
  }),
});
