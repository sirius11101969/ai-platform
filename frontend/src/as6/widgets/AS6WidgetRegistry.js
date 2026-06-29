import { registerAS6Widget } from "./AS6WidgetRuntime";

export const AS6_WIDGET_REGISTRY_VERSION = "P7";

export const as6WidgetDefinitions = [
  {
    id: "crm.dashboard.widget",
    title: "CRM Dashboard Widget",
    spaceId: "crm",
    type: "dashboard",
    capability: "analytics",
    service: "crm",
    size: "large",
  },
  {
    id: "crm.customers.widget",
    title: "CRM Customers Widget",
    spaceId: "crm",
    type: "list",
    capability: "customers",
    service: "crm",
    size: "medium",
  },
  {
    id: "crm.deals.widget",
    title: "CRM Deals Widget",
    spaceId: "crm",
    type: "pipeline",
    capability: "deals",
    service: "crm",
    size: "medium",
  },
  {
    id: "ai.context.widget",
    title: "AI Context Widget",
    spaceId: "ai",
    type: "assistant",
    capability: "automation",
    service: "ai-workers",
    size: "medium",
  },
];

export function registerAS6DefaultWidgets() {
  return as6WidgetDefinitions.map((widget) => registerAS6Widget(widget));
}

export function getAS6WidgetDefinitions() {
  return as6WidgetDefinitions;
}

export function validateAS6WidgetRegistryPolicy() {
  const failures = [];
  const ids = new Set();

  for (const widget of as6WidgetDefinitions) {
    if (!widget.id) failures.push("widget_id_missing");
    if (!widget.title) failures.push(`${widget.id || "unknown"}_title_missing`);
    if (!widget.spaceId) failures.push(`${widget.id || "unknown"}_space_missing`);
    if (!widget.capability) failures.push(`${widget.id || "unknown"}_capability_missing`);
    if (ids.has(widget.id)) failures.push(`${widget.id}_duplicate`);
    ids.add(widget.id);
  }

  return {
    ok: failures.length === 0,
    failures,
    count: as6WidgetDefinitions.length,
    version: AS6_WIDGET_REGISTRY_VERSION,
  };
}
