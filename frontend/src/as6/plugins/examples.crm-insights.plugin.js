export const crmInsightsPlugin = {
  id: "as6.crm-insights",
  title: "CRM Insights",
  version: "1.0.0",
  publisher: "AS6",
  description: "Reference plugin for CRM insights, widgets, AI actions and bus handlers.",
  permissions: ["crm.read"],
  capabilities: ["customers", "deals", "analytics"],
  livingSpaces: [],
  widgets: [
    {
      id: "plugin.crm-insights.widget",
      title: "CRM Insights Widget",
      spaceId: "crm",
      type: "insights",
      capability: "analytics",
      service: "crm",
      size: "medium",
    },
  ],
  aiActions: [
    {
      id: "plugin.crm-insights.summarize",
      title: "Summarize CRM insights",
      capability: "analytics",
      service: "crm",
      livingSpace: "as6-sales",
      risk: "low",
      execute: async ({ aiContext }) => ({
        type: "CRM_INSIGHTS_SUMMARY",
        context: aiContext?.context || {},
        source: "crm-insights-plugin",
      }),
    },
  ],
  busHandlers: [
    {
      type: "query",
      name: "plugin.crm-insights.summary",
      risk: "low",
      handler: async ({ payload }) => ({
        ok: true,
        summary: "CRM insights plugin summary requested.",
        payload,
      }),
    },
  ],
};
