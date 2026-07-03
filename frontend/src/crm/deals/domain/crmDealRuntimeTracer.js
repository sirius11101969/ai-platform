export function traceCrmDealDomain(event = "CRM_DEAL_DOMAIN_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE01_CRM_DEALS_DOMAIN_MODEL",
    module: "CRM_DEALS_OPPORTUNITIES",
    entity: "crm.deal",
    pipeline: "declarative-only",
    companyLink: "declarative-only",
    contactLink: "declarative-only",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
