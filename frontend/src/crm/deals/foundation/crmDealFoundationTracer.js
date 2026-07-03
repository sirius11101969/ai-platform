export function traceCrmDealFoundation(event = "CRM_DEAL_FOUNDATION_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE02_CRM_DEALS_FOUNDATION",
    module: "CRM_DEALS_OPPORTUNITIES",
    registry: "crm.deals",
    pipeline: "declarative-preview-only",
    companyLink: "declarative-only",
    contactLink: "declarative-only",
    workspace: "existing-crm-workspace",
    layout: "existing-crm-layout",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
