export const AS6_CAPABILITY_REGISTRY_VERSION = "V113";

export const as6CapabilityRegistry = [
  {
    id: "customers",
    title: "Customers",
    category: "crm",
    status: "active",
    priority: 100,
    services: ["crm"],
    plugins: [],
  },
  {
    id: "deals",
    title: "Deals",
    category: "crm",
    status: "active",
    priority: 100,
    services: ["crm"],
    plugins: [],
  },
  {
    id: "analytics",
    title: "Analytics",
    category: "analytics",
    status: "active",
    priority: 90,
    services: ["crm", "dashboard"],
    plugins: [],
  },
  {
    id: "workspace",
    title: "Workspace",
    category: "workspace",
    status: "active",
    priority: 100,
    services: ["as6-one"],
    plugins: [],
  },
  {
    id: "automation",
    title: "Automation",
    category: "ai",
    status: "active",
    priority: 90,
    services: ["ai-workers"],
    plugins: [],
  },
  {
    id: "realtime_voice",
    title: "Realtime Voice",
    category: "ai",
    status: "active",
    priority: 80,
    services: ["voice"],
    plugins: [],
  },
  {
    id: "pipeline",
    title: "Pipeline",
    category: "sales",
    status: "active",
    priority: 85,
    services: ["pipeline-copilot"],
    plugins: [],
  },
];

export function getAS6Capabilities() {
  return as6CapabilityRegistry;
}

export function getAS6CapabilityById(capabilityId) {
  return as6CapabilityRegistry.find((capability) => capability.id === capabilityId) || null;
}

export function getAS6CapabilitiesByService(serviceId) {
  return as6CapabilityRegistry.filter((capability) => capability.services.includes(serviceId));
}

export function getAS6ActiveCapabilities() {
  return as6CapabilityRegistry.filter((capability) => capability.status === "active");
}

export function getAS6CapabilityPriority(capabilityId) {
  return getAS6CapabilityById(capabilityId)?.priority || 0;
}

export function validateAS6CapabilityRegistryPolicy() {
  const failures = [];
  const ids = new Set();

  for (const capability of as6CapabilityRegistry) {
    if (!capability.id) failures.push("capability_missing_id");
    if (!capability.title) failures.push(`${capability.id || "unknown"}_missing_title`);
    if (!capability.status) failures.push(`${capability.id || "unknown"}_missing_status`);
    if (!Array.isArray(capability.services)) failures.push(`${capability.id || "unknown"}_services_not_array`);
    if (!Array.isArray(capability.plugins)) failures.push(`${capability.id || "unknown"}_plugins_not_array`);
    if (ids.has(capability.id)) failures.push(`${capability.id}_duplicate_capability_id`);
    ids.add(capability.id);
  }

  return {
    ok: failures.length === 0,
    failures,
    count: as6CapabilityRegistry.length,
    version: AS6_CAPABILITY_REGISTRY_VERSION,
  };
}
