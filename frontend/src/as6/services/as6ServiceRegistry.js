export const AS6_SERVICE_REGISTRY_VERSION = "V108";

export const as6ServiceRegistry = [
  {
    id: "crm",
    title: "CRM",
    route: "/as6-sales",
    livingSpace: "as6-sales",
    category: "sales",
    workspace: true,
    commandPalette: true,
    permissions: ["crm.read"],
    capabilities: ["customers", "deals", "analytics"],
    status: "active",
  },
  {
    id: "as6-one",
    title: "AS6 One",
    route: "/as6-one",
    livingSpace: "as6-one",
    category: "workspace",
    workspace: true,
    commandPalette: true,
    permissions: ["workspace.read"],
    capabilities: ["workspace", "context", "intelligence"],
    status: "active",
  },
  {
    id: "ai-workers",
    title: "AI Workers",
    route: "/ai-workers",
    livingSpace: null,
    category: "ai",
    workspace: true,
    commandPalette: true,
    permissions: ["ai.workers.read"],
    capabilities: ["automation", "agents", "tasks"],
    status: "active",
  },
  {
    id: "command-center",
    title: "Command Center",
    route: "/command-center",
    livingSpace: null,
    category: "operations",
    workspace: true,
    commandPalette: true,
    permissions: ["ops.read"],
    capabilities: ["monitoring", "coordination", "execution"],
    status: "active",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    route: "/dashboard",
    livingSpace: null,
    category: "analytics",
    workspace: true,
    commandPalette: true,
    permissions: ["dashboard.read"],
    capabilities: ["metrics", "overview", "reporting"],
    status: "active",
  },
  {
    id: "pipeline-copilot",
    title: "Pipeline Copilot",
    route: "/pipeline-copilot",
    livingSpace: null,
    category: "sales",
    workspace: true,
    commandPalette: true,
    permissions: ["pipeline.read"],
    capabilities: ["pipeline", "recommendations", "followups"],
    status: "active",
  },
  {
    id: "voice",
    title: "Voice",
    route: "/ai-realtime-voice",
    livingSpace: null,
    category: "ai",
    workspace: true,
    commandPalette: true,
    permissions: ["voice.read"],
    capabilities: ["realtime_voice", "calls", "assistant"],
    status: "active",
  },
  {
    id: "revenue",
    title: "Revenue",
    route: "/dashboard/revenue",
    livingSpace: null,
    category: "analytics",
    workspace: true,
    commandPalette: true,
    permissions: ["revenue.read"],
    capabilities: ["revenue", "forecasting", "insights"],
    status: "active",
  },
];

export function getAS6Services() {
  return as6ServiceRegistry;
}

export function getAS6ServiceById(serviceId) {
  return as6ServiceRegistry.find((service) => service.id === serviceId) || null;
}

export function getAS6ServiceByRoute(route) {
  return as6ServiceRegistry.find((service) => service.route === route) || null;
}

export function getAS6CommandPaletteServices() {
  return as6ServiceRegistry.filter((service) => service.commandPalette);
}

export function getAS6WorkspaceServices() {
  return as6ServiceRegistry.filter((service) => service.workspace);
}

export function getAS6ServicesByCapability(capability) {
  return as6ServiceRegistry.filter((service) => service.capabilities.includes(capability));
}

export function validateAS6ServiceRegistryPolicy() {
  const failures = [];
  const ids = new Set();
  const routes = new Set();

  for (const service of as6ServiceRegistry) {
    if (!service.id) failures.push("service_missing_id");
    if (!service.title) failures.push(`${service.id || "unknown"}_missing_title`);
    if (!service.route) failures.push(`${service.id || "unknown"}_missing_route`);
    if (!Array.isArray(service.permissions)) failures.push(`${service.id || "unknown"}_permissions_not_array`);
    if (!Array.isArray(service.capabilities)) failures.push(`${service.id || "unknown"}_capabilities_not_array`);
    if (ids.has(service.id)) failures.push(`${service.id}_duplicate_id`);
    if (routes.has(service.route)) failures.push(`${service.route}_duplicate_route`);
    ids.add(service.id);
    routes.add(service.route);
  }

  return {
    ok: failures.length === 0,
    failures,
    count: as6ServiceRegistry.length,
    version: AS6_SERVICE_REGISTRY_VERSION,
  };
}
