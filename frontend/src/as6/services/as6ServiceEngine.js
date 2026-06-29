import {
  as6ServiceRegistry,
  getAS6CommandPaletteServices,
  getAS6ServiceById,
  getAS6ServiceByRoute,
  getAS6Services,
  getAS6ServicesByCapability,
  getAS6WorkspaceServices,
  validateAS6ServiceRegistryPolicy,
} from "./as6ServiceRegistry";

export function getAS6ServiceEngineState() {
  return {
    services: getAS6Services(),
    workspaceServices: getAS6WorkspaceServices(),
    commandPaletteServices: getAS6CommandPaletteServices(),
    validation: validateAS6ServiceRegistryPolicy(),
  };
}

export function getAS6ServiceMenuItems() {
  return getAS6CommandPaletteServices().map((service) => ({
    id: service.id,
    label: service.title,
    route: service.route,
    category: service.category,
    capabilities: service.capabilities,
  }));
}

export function resolveAS6Service(input) {
  if (!input) return null;
  return getAS6ServiceById(input) || getAS6ServiceByRoute(input);
}

export function hasAS6ServiceCapability(serviceId, capability) {
  const service = getAS6ServiceById(serviceId);
  return Boolean(service?.capabilities?.includes(capability));
}

export function findAS6ServicesByCapability(capability) {
  return getAS6ServicesByCapability(capability);
}

export function validateAS6ServiceEnginePolicy() {
  const registryValidation = validateAS6ServiceRegistryPolicy();
  const failures = [...registryValidation.failures];

  if (!Array.isArray(as6ServiceRegistry)) failures.push("registry_not_array");
  if (!getAS6ServiceById("crm")) failures.push("crm_service_missing");
  if (!getAS6ServiceById("as6-one")) failures.push("as6_one_service_missing");

  return {
    ok: failures.length === 0,
    failures,
    serviceCount: as6ServiceRegistry.length,
  };
}
