import { CRM_ACTIVITY_CONTRACT } from "./crmActivityContract";
import { traceCrmActivityDomain } from "./crmActivityRuntimeTracer";

export function diagnoseCrmActivityDomainModel() {
  const checks = [
    ["CRM_ACTIVITIES_TASKS_DOMAIN_MODEL_ONLY", CRM_ACTIVITY_CONTRACT.invariants.CRM_ACTIVITIES_TASKS_DOMAIN_MODEL_ONLY === true],
    ["ACTIVITY_IDENTITY_MODEL", CRM_ACTIVITY_CONTRACT.identity.entity === "crm.activity"],
    ["TASK_IDENTITY_MODEL", CRM_ACTIVITY_CONTRACT.taskIdentity.entity === "crm.task"],
    ["TYPE_MODEL", CRM_ACTIVITY_CONTRACT.types.includes("task") && CRM_ACTIVITY_CONTRACT.types.includes("meeting")],
    ["STATUS_MODEL", CRM_ACTIVITY_CONTRACT.statuses.includes("planned") && CRM_ACTIVITY_CONTRACT.statuses.includes("completed")],
    ["PRIORITY_MODEL", CRM_ACTIVITY_CONTRACT.priorities.includes("normal") && CRM_ACTIVITY_CONTRACT.priorities.includes("urgent")],
    ["LIFECYCLE_MODEL", CRM_ACTIVITY_CONTRACT.lifecycle.initial === "planned"],
    ["DEADLINE_MODEL", CRM_ACTIVITY_CONTRACT.deadlineReminder.deadline.mode === "declarative-only"],
    ["REMINDER_MODEL", CRM_ACTIVITY_CONTRACT.deadlineReminder.reminder.mode === "declarative-only"],
    ["COMPANY_LINK_DECLARATIVE_ONLY", CRM_ACTIVITY_CONTRACT.links.company.mode === "declarative-only" && CRM_ACTIVITY_CONTRACT.links.company.hardCoupling === false],
    ["CONTACT_LINK_DECLARATIVE_ONLY", CRM_ACTIVITY_CONTRACT.links.contact.mode === "declarative-only" && CRM_ACTIVITY_CONTRACT.links.contact.hardCoupling === false],
    ["DEAL_LINK_DECLARATIVE_ONLY", CRM_ACTIVITY_CONTRACT.links.deal.mode === "declarative-only" && CRM_ACTIVITY_CONTRACT.links.deal.hardCoupling === false],
    ["REUSE_CONTACTS_FOUNDATION", CRM_ACTIVITY_CONTRACT.invariants.REUSE_CONTACTS_FOUNDATION === true],
    ["REUSE_COMPANIES_FOUNDATION", CRM_ACTIVITY_CONTRACT.invariants.REUSE_COMPANIES_FOUNDATION === true],
    ["REUSE_DEALS_FOUNDATION", CRM_ACTIVITY_CONTRACT.invariants.REUSE_DEALS_FOUNDATION === true],
    ["NO_STORAGE", CRM_ACTIVITY_CONTRACT.invariants.NO_STORAGE === true],
    ["NO_API_CALLS", CRM_ACTIVITY_CONTRACT.invariants.NO_API_CALLS === true],
    ["NO_BUSINESS_WORKFLOW", CRM_ACTIVITY_CONTRACT.invariants.NO_BUSINESS_WORKFLOW === true],
    ["PLATFORM_MUTATION_FALSE", CRM_ACTIVITY_CONTRACT.invariants.PLATFORM_MUTATION === false],
    ["RUNTIME_TRACER_PRESENT", traceCrmActivityDomain().event === "CRM_ACTIVITY_DOMAIN_TRACE"],
  ];

  return Object.freeze({
    status: checks.every(([, pass]) => pass) ? "PASS" : "FAIL",
    trace: traceCrmActivityDomain(),
    checks: Object.freeze(checks.map(([name, pass]) => Object.freeze({ name, status: pass ? "PASS" : "FAIL" }))),
  });
}
