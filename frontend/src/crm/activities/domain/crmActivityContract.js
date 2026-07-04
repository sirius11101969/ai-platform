import { CRM_ACTIVITY_IDENTITY } from "./crmActivityIdentity";
import { CRM_TASK_IDENTITY } from "./crmTaskIdentity";
import { CRM_ACTIVITY_TYPES } from "./crmActivityTypes";
import { CRM_ACTIVITY_STATUSES } from "./crmActivityStatuses";
import { CRM_ACTIVITY_PRIORITIES } from "./crmActivityPriorities";
import { CRM_ACTIVITY_LIFECYCLE } from "./crmActivityLifecycle";
import { CRM_ACTIVITY_DEADLINE_REMINDER_MODEL } from "./crmActivityDeadlineReminder";
import { CRM_ACTIVITY_COMPANY_LINK } from "./crmActivityCompanyLink";
import { CRM_ACTIVITY_CONTACT_LINK } from "./crmActivityContactLink";
import { CRM_ACTIVITY_DEAL_LINK } from "./crmActivityDealLink";

export const CRM_ACTIVITY_CONTRACT = Object.freeze({
  module: "CRM_ACTIVITIES_TASKS",
  stage: "AS6_EPIC015_SLICE01_CRM_ACTIVITIES_TASKS_DOMAIN_MODEL",
  identity: CRM_ACTIVITY_IDENTITY,
  taskIdentity: CRM_TASK_IDENTITY,
  types: CRM_ACTIVITY_TYPES,
  statuses: CRM_ACTIVITY_STATUSES,
  priorities: CRM_ACTIVITY_PRIORITIES,
  lifecycle: CRM_ACTIVITY_LIFECYCLE,
  deadlineReminder: CRM_ACTIVITY_DEADLINE_REMINDER_MODEL,
  links: Object.freeze({
    company: CRM_ACTIVITY_COMPANY_LINK,
    contact: CRM_ACTIVITY_CONTACT_LINK,
    deal: CRM_ACTIVITY_DEAL_LINK,
  }),
  invariants: Object.freeze({
    CRM_ACTIVITIES_TASKS_DOMAIN_MODEL_ONLY: true,
    REUSE_CONTACTS_FOUNDATION: true,
    REUSE_COMPANIES_FOUNDATION: true,
    REUSE_DEALS_FOUNDATION: true,
    COMPANY_LINK_DECLARATIVE_ONLY: true,
    CONTACT_LINK_DECLARATIVE_ONLY: true,
    DEAL_LINK_DECLARATIVE_ONLY: true,
    DEADLINE_DECLARATIVE_ONLY: true,
    REMINDER_DECLARATIVE_ONLY: true,
    NO_STORAGE: true,
    NO_API_CALLS: true,
    NO_BUSINESS_WORKFLOW: true,
    PLATFORM_MUTATION: false,
  }),
});
