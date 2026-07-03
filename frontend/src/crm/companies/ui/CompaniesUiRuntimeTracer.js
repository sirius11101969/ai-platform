export function traceCrmCompaniesUi(event = "CRM_COMPANIES_UI_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC013_SLICE03_CRM_COMPANIES_UI_FOUNDATION",
    module: "CRM_COMPANIES_ACCOUNTS",
    ui: "foundation-only",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
    backendDependency: "disabled",
  });
}
