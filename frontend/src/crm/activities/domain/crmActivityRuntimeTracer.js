export function traceCrmActivityDomain(event = "CRM_ACTIVITY_DOMAIN_TRACE") {
  return Object.freeze({
    event,
    stage: "AS6_EPIC015_SLICE01_CRM_ACTIVITIES_TASKS_DOMAIN_MODEL",
    module: "CRM_ACTIVITIES_TASKS",
    activityEntity: "crm.activity",
    taskEntity: "crm.task",
    companyLink: "declarative-only",
    contactLink: "declarative-only",
    dealLink: "declarative-only",
    deadline: "declarative-only",
    reminder: "declarative-only",
    storage: "disabled",
    apiCalls: "disabled",
    workflow: "disabled",
  });
}
