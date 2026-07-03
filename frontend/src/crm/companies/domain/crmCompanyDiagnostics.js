import { CRM_COMPANY_CONTRACT } from "./crmCompanyContract";
import { traceCrmCompanyDomain } from "./crmCompanyRuntimeTracer";

export function diagnoseCrmCompanyDomainModel() {
  const checks = [
    ["CRM_COMPANIES_DOMAIN_MODEL_ONLY", CRM_COMPANY_CONTRACT.invariants.CRM_COMPANIES_DOMAIN_MODEL_ONLY === true],
    ["NO_STORAGE", CRM_COMPANY_CONTRACT.invariants.NO_STORAGE === true],
    ["NO_API_CALLS", CRM_COMPANY_CONTRACT.invariants.NO_API_CALLS === true],
    ["NO_BUSINESS_WORKFLOW", CRM_COMPANY_CONTRACT.invariants.NO_BUSINESS_WORKFLOW === true],
    ["CONTACTS_LINK_DECLARATIVE_ONLY", CRM_COMPANY_CONTRACT.invariants.CONTACTS_LINK_DECLARATIVE_ONLY === true],
    ["PLATFORM_MUTATION_FALSE", CRM_COMPANY_CONTRACT.invariants.PLATFORM_MUTATION === false],
    ["IDENTITY_REQUIRED_FIELDS", CRM_COMPANY_CONTRACT.identity.requiredFields.length >= 4],
    ["STATUS_MODEL_PRESENT", Object.keys(CRM_COMPANY_CONTRACT.statuses).length >= 4],
    ["CATEGORY_MODEL_PRESENT", Object.keys(CRM_COMPANY_CONTRACT.categories).length >= 4],
    ["LIFECYCLE_MODEL_PRESENT", CRM_COMPANY_CONTRACT.lifecycle.stages.includes("active")],
    ["CONTACT_LINK_NOT_HARD_COUPLED", CRM_COMPANY_CONTRACT.contactLink.hardCoupling === false],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmCompanyDomain(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
