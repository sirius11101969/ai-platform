export function traceCrmCompanyFoundation(event = "CRM_COMPANY_FOUNDATION_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC013_SLICE02_CRM_COMPANIES_FOUNDATION",
    module: "CRM_COMPANIES_ACCOUNTS",
    registry: "crm.companies",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
    contactsLink: "declarative-only",
  });
}
