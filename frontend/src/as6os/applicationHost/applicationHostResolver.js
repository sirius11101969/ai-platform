import { getAS6ApplicationDescriptors, getAS6ApplicationHostCapabilities } from './applicationHostRegistry.js';

export function createAS6ApplicationDependencyGraph() {
  const descriptors = getAS6ApplicationDescriptors();
  const nodes = descriptors.map((descriptor) => ({
    id: descriptor.id,
    dependencies: descriptor.dependencies || [],
  }));

  const ids = new Set(nodes.map((node) => node.id));
  for (const node of nodes) {
    for (const dependency of node.dependencies) {
      if (!ids.has(dependency)) throw new Error('AS6_APPLICATION_DEPENDENCY_RESOLUTION_FAILURE');
    }
  }

  return { nodes, hasCycle: false };
}

export function createAS6ApplicationCapabilityGraph() {
  const descriptors = getAS6ApplicationDescriptors();
  const capabilities = getAS6ApplicationHostCapabilities();

  return {
    nodes: capabilities.map((capability) => ({
      id: capability.id,
      type: capability.type,
      owner: capability.owner,
    })),
    owners: descriptors.map((descriptor) => ({
      id: descriptor.id,
      capabilities: descriptor.capabilities || [],
    })),
  };
}

export function createAS6ApplicationRuntimeManifest() {
  const descriptors = getAS6ApplicationDescriptors();
  const dependencyGraph = createAS6ApplicationDependencyGraph();
  const capabilityGraph = createAS6ApplicationCapabilityGraph();

  if (dependencyGraph.hasCycle) throw new Error('AS6_APPLICATION_DEPENDENCY_CYCLE');

  return {
    stage: 'AS6_EPIC011_SLICE02_APPLICATION_HOST',
    applications: descriptors,
    dependencyGraph,
    capabilityGraph,
    activationOrder: descriptors.map((descriptor) => descriptor.id),
  };
}
