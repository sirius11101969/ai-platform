export function traceCrmDealsUi(event = "CRM_DEALS_UI_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE03_CRM_DEALS_UI_FOUNDATION",
    module: "CRM_DEALS_OPPORTUNITIES",
    ui: "foundation-only",
    designSystem: "crm-shared-foundation",
    states: "loading/empty/ready/error",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
