export function traceCrmCompanyDomain(event = "CRM_COMPANY_DOMAIN_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC013_SLICE01_CRM_COMPANIES_DOMAIN_MODEL",
    module: "CRM_COMPANIES_ACCOUNTS",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
    contactsLink: "declarative-only",
  });
}
