import { createAS6WidgetPlugin, createAS6AIActionPlugin, createAS6BusPlugin } from "./createAS6Plugin";

export const exampleWidgetPlugin = createAS6WidgetPlugin({
  id: "developer.example-widget",
  title: "Example Widget Plugin",
  publisher: "AS6 Developer",
  widget: { id: "developer.example.widget", title: "Example Widget", spaceId: "crm", type: "panel", capability: "analytics", service: "crm", size: "medium" },
});

export const exampleAIActionPlugin = createAS6AIActionPlugin({
  id: "developer.example-ai-action",
  title: "Example AI Action Plugin",
  publisher: "AS6 Developer",
  action: { id: "developer.example.action", title: "Example AI Action", capability: "analytics", service: "crm", livingSpace: "as6-sales", risk: "low", execute: async () => ({ ok: true }) },
});

export const exampleBusPlugin = createAS6BusPlugin({
  id: "developer.example-bus",
  title: "Example Bus Plugin",
  publisher: "AS6 Developer",
  handler: { type: "query", name: "developer.example.query", risk: "low", handler: async () => ({ ok: true }) },
});
