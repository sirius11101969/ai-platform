import { crmActivitiesCrmLayoutBridge } from "./crmActivitiesCrmLayoutBridge";
import { getCrmActivitiesLayoutHealthSnapshot } from "./crmActivitiesLayoutHealthSnapshot";

export const crmActivitiesLayoutDescriptor = Object.freeze({
  id: "crm.activities.tasks.layout.descriptor",
  title: "CRM Activities / Tasks Layout Bridge",
  module: "CRM_ACTIVITIES_TASKS",
  bridge: crmActivitiesCrmLayoutBridge,
  health: getCrmActivitiesLayoutHealthSnapshot,
});
