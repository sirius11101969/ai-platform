import { registerAS6AIAction } from "./AS6AIActionEngine";

export const AS6_CRM_AI_ACTIONS_VERSION = "P5";

export const crmAIActions = [
  {
    id: "crm.openCustomer",
    title: "Open CRM customer",
    capability: "customers",
    service: "crm",
    livingSpace: "as6-sales",
    risk: "low",
    execute: async ({ payload = {}, aiContext }) => ({
      type: "OPEN_CUSTOMER",
      customerId: payload.customerId || aiContext.customer || null,
      source: "ai-action-engine",
    }),
  },
  {
    id: "crm.openDeal",
    title: "Open CRM deal",
    capability: "deals",
    service: "crm",
    livingSpace: "as6-sales",
    risk: "low",
    execute: async ({ payload = {}, aiContext }) => ({
      type: "OPEN_DEAL",
      dealId: payload.dealId || aiContext.deal || null,
      source: "ai-action-engine",
    }),
  },
  {
    id: "crm.analyzePipeline",
    title: "Analyze CRM pipeline",
    capability: "pipeline",
    service: "pipeline-copilot",
    livingSpace: "as6-sales",
    risk: "medium",
    execute: async ({ aiContext }) => ({
      type: "ANALYZE_PIPELINE",
      pipeline: aiContext.pipeline || "default",
      summary: "Pipeline analysis requested from AS6 AI Action Engine.",
      source: "ai-action-engine",
    }),
  },
];

export function registerAS6CrmAIActions() {
  return crmAIActions.map((action) => registerAS6AIAction(action));
}
