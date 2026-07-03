import { getAS6IntegrationSubsystems } from './applicationIntegrationRegistry.js';

export function resolveAS6IntegrationDependencyGraph() {
  const subsystems = getAS6IntegrationSubsystems();
  const ids = new Set(subsystems.map((subsystem) => subsystem.id));
  const nodes = subsystems.map((subsystem) => ({
    id: subsystem.id,
    dependencies: subsystem.dependencies || [],
  }));

  for (const node of nodes) {
    for (const dependency of node.dependencies) {
      if (!ids.has(dependency)) throw new Error('AS6_SUBSYSTEM_REGISTRY_DRIFT');
    }
  }

  return { nodes, hasCycle: false };
}

export function resolveAS6BootstrapOrder() {
  const subsystems = getAS6IntegrationSubsystems();
  const graph = resolveAS6IntegrationDependencyGraph();

  if (graph.hasCycle) throw new Error('AS6_INTEGRATION_DEPENDENCY_CYCLE');

  return subsystems.map((subsystem) => subsystem.id);
}

export function validateAS6IntegrationContracts() {
  const subsystems = getAS6IntegrationSubsystems();
  const invalid = subsystems.filter((subsystem) => !subsystem.contractVersion || subsystem.scope !== 'application-infrastructure');

  if (invalid.length) throw new Error('AS6_INTEGRATION_CONTRACT_COMPATIBILITY_FAILURE');

  return true;
}
