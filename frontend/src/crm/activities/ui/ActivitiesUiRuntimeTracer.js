export function traceActivitiesUi(event = "CRM_ACTIVITIES_TASKS_UI_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC015_SLICE03_CRM_ACTIVITIES_TASKS_UI_FOUNDATION",
    module: "CRM_ACTIVITIES_TASKS",
    ui: "foundation-only",
    states: "loading/empty/ready/error",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
    router: "no-own-router",
    store: "no-own-store",
  });
}
