export function traceCrmActivitiesLayout(event = "CRM_ACTIVITIES_TASKS_LAYOUT_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC015_SLICE05_CRM_ACTIVITIES_TASKS_CRM_LAYOUT_BRIDGE",
    module: "CRM_ACTIVITIES_TASKS",
    layout: "existing-crm-layout",
    header: "existing-crm-header",
    sidebar: "existing-crm-sidebar",
    workspace: "existing-crm-workspace",
    breadcrumbs: "CRM > Activities / Tasks",
    activeSection: "activities",
    router: "no-own-router",
    store: "no-own-store",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
