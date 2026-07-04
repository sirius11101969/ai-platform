export function traceCrmActivityFoundation(event = "CRM_ACTIVITY_FOUNDATION_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC015_SLICE02_CRM_ACTIVITIES_TASKS_FOUNDATION",
    module: "CRM_ACTIVITIES_TASKS",
    registry: "crm.activities.tasks",
    runtime: "declarative-foundation-only",
    timeline: "declarative-preview-only",
    tasks: "declarative-preview-only",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
    router: "no-own-router",
    store: "no-own-store",
  });
}
