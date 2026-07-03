import { getAS6IntegrationSubsystems } from './applicationIntegrationRegistry.js';
import { resolveAS6IntegrationDependencyGraph, resolveAS6BootstrapOrder, validateAS6IntegrationContracts } from './applicationIntegrationResolver.js';

export function createAS6UnifiedApplicationRuntimeManifest() {
  validateAS6IntegrationContracts();

  const subsystems = getAS6IntegrationSubsystems();
  const dependencyGraph = resolveAS6IntegrationDependencyGraph();
  const bootstrapOrder = resolveAS6BootstrapOrder();

  if (subsystems.length !== bootstrapOrder.length) throw new Error('AS6_RUNTIME_MANIFEST_DRIFT');

  return {
    stage: 'AS6_EPIC011_SLICE07_APPLICATION_INTEGRATION',
    subsystems,
    dependencyGraph,
    bootstrapOrder,
    capabilities: subsystems.flatMap((subsystem) => subsystem.capabilities || []),
  };
}
