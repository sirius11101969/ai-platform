export function traceCrmCompaniesLayout(event = "CRM_COMPANIES_LAYOUT_BRIDGE_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC013_SLICE05_CRM_COMPANIES_CRM_LAYOUT_BRIDGE",
    module: "CRM_COMPANIES_ACCOUNTS",
    layout: "existing-crm-layout",
    workspace: "existing-crm-workspace",
    shell: "no-parallel-shell",
    router: "no-own-router",
    store: "no-own-store",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
