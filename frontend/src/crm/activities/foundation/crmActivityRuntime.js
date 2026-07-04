import { CRM_ACTIVITY_CONTRACT } from "../domain";
import { crmActivityRegistry } from "./crmActivityRegistry";

export function createCrmActivityRuntime() {
  return Object.freeze({
    id: "crm.activities.tasks.runtime",
    mode: "declarative-foundation-only",
    registry: crmActivityRegistry.key,
    contract: CRM_ACTIVITY_CONTRACT,
    timelineMode: "declarative-preview-only",
    taskMode: "declarative-preview-only",
    storageEnabled: false,
    apiEnabled: false,
    workflowEnabled: false,
    ownRouter: false,
    ownStore: false,
    platformMutation: false,
  });
}
