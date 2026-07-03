import { getAS6RuntimeServices } from './applicationRuntimeServiceRegistry.js';

export function resolveAS6RuntimeServiceDependencies() {
  const services = getAS6RuntimeServices();
  const ids = new Set(services.map((service) => service.id));
  const graph = services.map((service) => ({
    id: service.id,
    dependencies: service.dependencies || [],
  }));

  for (const node of graph) {
    for (const dependency of node.dependencies) {
      if (!ids.has(dependency)) throw new Error('AS6_RUNTIME_DEPENDENCY_RESOLUTION_FAILURE');
    }
  }

  return { nodes: graph, hasCycle: false };
}
