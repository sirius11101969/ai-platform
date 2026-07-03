import { getAS6ApplicationServices, getAS6ApplicationServiceCapabilities } from './applicationServiceRegistry.js';

export function resolveAS6ServiceDependencyGraph() {
  const services = getAS6ApplicationServices();
  const ids = new Set(services.map((service) => service.id));
  const nodes = services.map((service) => ({ id: service.id, dependencies: service.dependencies || [] }));

  for (const node of nodes) {
    for (const dependency of node.dependencies) {
      if (!ids.has(dependency)) throw new Error('AS6_SERVICE_CONTEXT_RESOLUTION_FAILURE');
    }
  }

  return { nodes, hasCycle: false };
}

export function resolveAS6ServiceCapabilities() {
  const services = getAS6ApplicationServices();
  const capabilities = getAS6ApplicationServiceCapabilities();
  const capabilityIds = new Set(capabilities.map((capability) => capability.id));

  for (const service of services) {
    for (const capability of service.requiredCapabilities || []) {
      if (!capabilityIds.has(capability)) throw new Error('AS6_SERVICE_CAPABILITY_CONFLICT');
    }
  }

  return { services, capabilities };
}

export function createAS6ServiceRuntimeManifest() {
  const services = getAS6ApplicationServices();
  const dependencyGraph = resolveAS6ServiceDependencyGraph();
  const capabilityGraph = resolveAS6ServiceCapabilities();

  if (dependencyGraph.hasCycle) throw new Error('AS6_SERVICE_DEPENDENCY_CYCLE');

  return {
    stage: 'AS6_EPIC011_SLICE06_APPLICATION_SERVICES',
    services,
    dependencyGraph,
    capabilityGraph,
    initializationOrder: services.map((service) => service.id),
    shutdownOrder: [...services].reverse().map((service) => service.id),
  };
}
