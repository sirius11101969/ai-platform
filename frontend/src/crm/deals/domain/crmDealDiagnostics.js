import { CRM_DEAL_CONTRACT } from "./crmDealContract";
import { CRM_DEAL_PIPELINE } from "./crmDealPipeline";
import { traceCrmDealDomain } from "./crmDealRuntimeTracer";

export function diagnoseCrmDealDomainModel() {
  const checks = [
    ["CRM_DEALS_DOMAIN_MODEL_ONLY", CRM_DEAL_CONTRACT.invariants.CRM_DEALS_DOMAIN_MODEL_ONLY === true],
    ["IDENTITY_MODEL", CRM_DEAL_CONTRACT.identity.entity === "crm.deal"],
    ["STATUS_MODEL", Boolean(CRM_DEAL_CONTRACT.statuses.open && CRM_DEAL_CONTRACT.statuses.won)],
    ["PIPELINE_MODEL", CRM_DEAL_PIPELINE.stages.length >= 5],
    ["STAGE_MODEL", Boolean(CRM_DEAL_CONTRACT.stages.lead && CRM_DEAL_CONTRACT.stages.closed)],
    ["LIFECYCLE_MODEL", CRM_DEAL_CONTRACT.lifecycle.initial === "draft"],
    ["COMPANY_LINK_DECLARATIVE_ONLY", CRM_DEAL_CONTRACT.links.company.mode === "declarative-only" && CRM_DEAL_CONTRACT.links.company.hardCoupling === false],
    ["CONTACT_LINK_DECLARATIVE_ONLY", CRM_DEAL_CONTRACT.links.contact.mode === "declarative-only" && CRM_DEAL_CONTRACT.links.contact.hardCoupling === false],
    ["REUSE_CONTACTS_FOUNDATION", CRM_DEAL_CONTRACT.invariants.REUSE_CONTACTS_FOUNDATION === true],
    ["REUSE_COMPANIES_FOUNDATION", CRM_DEAL_CONTRACT.invariants.REUSE_COMPANIES_FOUNDATION === true],
    ["NO_STORAGE", CRM_DEAL_CONTRACT.invariants.NO_STORAGE === true],
    ["NO_API_CALLS", CRM_DEAL_CONTRACT.invariants.NO_API_CALLS === true],
    ["NO_BUSINESS_WORKFLOW", CRM_DEAL_CONTRACT.invariants.NO_BUSINESS_WORKFLOW === true],
    ["PLATFORM_MUTATION_FALSE", CRM_DEAL_CONTRACT.invariants.PLATFORM_MUTATION === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmDealDomain(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
