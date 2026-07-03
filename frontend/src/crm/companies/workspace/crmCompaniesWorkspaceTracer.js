export function traceCrmCompaniesWorkspace(event = "CRM_COMPANIES_WORKSPACE_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC013_SLICE04_CRM_COMPANIES_WORKSPACE_INTEGRATION",
    module: "CRM_COMPANIES_ACCOUNTS",
    workspace: "existing-crm-workspace",
    shell: "no-parallel-shell",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
