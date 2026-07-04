export function traceCrmDealsWorkspace(event = "CRM_DEALS_WORKSPACE_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC014_SLICE04_CRM_DEALS_WORKSPACE_INTEGRATION",
    module: "CRM_DEALS_OPPORTUNITIES",
    workspace: "existing-crm-workspace",
    layout: "existing-crm-layout",
    panel: "crm.deals.workspace.panel",
    navigation: "crm.deals.workspace.navigation",
    states: "loading/empty/ready/error",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
    ownRouter: false,
    ownStore: false,
  });
}
