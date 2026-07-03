import { getAS6RuntimeServices, getAS6RuntimeServiceCapabilities } from './applicationRuntimeServiceRegistry.js';
import { resolveAS6RuntimeServiceDependencies } from './applicationRuntimeDependencyResolver.js';

export function resolveAS6RuntimeServiceCapabilities() {
  const services = getAS6RuntimeServices();
  const capabilities = getAS6RuntimeServiceCapabilities();
  const capabilityIds = new Set(capabilities.map((capability) => capability.id));

  for (const service of services) {
    for (const capability of service.requiredCapabilities || []) {
      if (!capabilityIds.has(capability)) throw new Error('AS6_RUNTIME_SERVICE_CAPABILITY_CONFLICT');
    }
  }

  return {
    services: services.map((service) => ({
      id: service.id,
      exportedCapabilities: service.exportedCapabilities || [],
      requiredCapabilities: service.requiredCapabilities || [],
    })),
    capabilities,
  };
}

export function createAS6RuntimeServiceManifest() {
  const services = getAS6RuntimeServices();
  const dependencyGraph = resolveAS6RuntimeServiceDependencies();
  const capabilityGraph = resolveAS6RuntimeServiceCapabilities();

  if (dependencyGraph.hasCycle) throw new Error('AS6_RUNTIME_DEPENDENCY_RESOLUTION_FAILURE');

  return {
    stage: 'AS6_EPIC011_SLICE04_APPLICATION_RUNTIME_SERVICES',
    services,
    dependencyGraph,
    capabilityGraph,
    activationOrder: services.map((service) => service.id),
  };
}
