export const CRM_DEAL_PIPELINE = Object.freeze({
  id: "crm.deals.pipeline.default",
  title: "Default Sales Pipeline",
  foundationOnly: true,
  stages: Object.freeze([
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "closed",
  ]),
});
