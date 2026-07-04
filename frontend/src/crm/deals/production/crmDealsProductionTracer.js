export function traceCrmDealsProduction(event = "CRM_DEALS_PRODUCTION_POLISH_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE07_CRM_DEALS_PRODUCTION_POLISH",
    module: "CRM_DEALS_OPPORTUNITIES",
    accessibility: "aria/keyboard/focus",
    motion: "prefers-reduced-motion",
    performance: "no-runtime-fetch/no-runtime-storage/no-heavy-dependencies",
    layout: "existing-crm-layout",
    workspace: "existing-crm-workspace",
    router: "no-own-router",
    store: "no-own-store",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
