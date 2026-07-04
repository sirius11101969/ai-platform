import { CRM_ACTIVITY_CONTRACT } from "./crmActivityContract";
import { diagnoseCrmActivityDomainModel } from "./crmActivityDiagnostics";
import { traceCrmActivityDomain } from "./crmActivityRuntimeTracer";

export const crmActivityDomainDescriptor = Object.freeze({
  id: "crm.activities.tasks.domain",
  title: "CRM Activities / Tasks Domain",
  module: "CRM_ACTIVITIES_TASKS",
  stage: CRM_ACTIVITY_CONTRACT.stage,
  contract: CRM_ACTIVITY_CONTRACT,
  diagnostics: diagnoseCrmActivityDomainModel,
  trace: traceCrmActivityDomain,
});
