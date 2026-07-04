export function traceCrmDealsLayout(event = "CRM_DEALS_LAYOUT_BRIDGE_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE05_CRM_DEALS_CRM_LAYOUT_BRIDGE",
    module: "CRM_DEALS_OPPORTUNITIES",
    layout: "existing-crm-layout",
    workspace: "existing-crm-workspace",
    header: "existing-crm-header",
    sidebar: "existing-crm-sidebar",
    breadcrumbs: "CRM/Deals",
    activeSection: "deals",
    shell: "no-parallel-shell",
    router: "no-own-router",
    store: "no-own-store",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
