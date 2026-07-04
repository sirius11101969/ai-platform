import { crmActivitiesProductionContract } from "./crmActivitiesProductionContract";
import { getCrmActivitiesProductionHealthSnapshot } from "./crmActivitiesProductionHealthSnapshot";

export const crmActivitiesProductionDescriptor = Object.freeze({
  id: "crm.activities.tasks.production.descriptor",
  title: "CRM Activities / Tasks Production Polish",
  module: "CRM_ACTIVITIES_TASKS",
  contract: crmActivitiesProductionContract,
  health: getCrmActivitiesProductionHealthSnapshot,
});
