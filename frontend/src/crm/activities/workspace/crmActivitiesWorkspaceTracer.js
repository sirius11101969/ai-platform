export function traceCrmActivitiesWorkspace(event = "CRM_ACTIVITIES_TASKS_WORKSPACE_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC015_SLICE04_CRM_ACTIVITIES_TASKS_WORKSPACE_INTEGRATION",
    module: "CRM_ACTIVITIES_TASKS",
    workspace: "existing-crm-workspace",
    layout: "existing-crm-layout",
    panel: "crm.activities.tasks.workspace.panel",
    navigation: "crm.activities.tasks.workspace.navigation",
    router: "no-own-router",
    store: "no-own-store",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
