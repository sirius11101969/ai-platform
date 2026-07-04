export function traceCrmActivitiesLiveLayoutMount(event = "CRM_ACTIVITIES_TASKS_LIVE_LAYOUT_MOUNT_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC015_SLICE06_CRM_ACTIVITIES_TASKS_LIVE_LAYOUT_MOUNT",
    module: "CRM_ACTIVITIES_TASKS",
    layout: "existing-crm-layout",
    workspace: "existing-crm-workspace",
    mount: "crm.activities.tasks.live-layout.mount",
    router: "existing-router",
    store: "no-own-store",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
