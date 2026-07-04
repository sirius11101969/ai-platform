export function traceCrmDealsLiveLayoutMount(event = "CRM_DEALS_LIVE_LAYOUT_MOUNT_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE06_CRM_DEALS_LIVE_LAYOUT_MOUNT",
    module: "CRM_DEALS_OPPORTUNITIES",
    route: "/crm/deals",
    layout: "existing-crm-production-layout",
    workspace: "existing-crm-workspace",
    mount: "live",
    duplicateRoute: "forbidden",
    duplicatePanel: "forbidden",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
