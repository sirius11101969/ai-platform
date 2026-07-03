import { bootstrapAS6ApplicationIntegrationRuntime } from './applicationIntegrationBootstrap.js';
import { traceAS6ApplicationIntegration } from './applicationIntegrationTracer.js';
import { getAS6ApplicationIntegrationHealthSnapshot } from './applicationIntegrationHealthSnapshot.js';

export const as6ApplicationIntegrationState = {
  status: 'idle',
  runtime: null,
};

export function coordinateAS6ApplicationIntegration() {
  const runtime = bootstrapAS6ApplicationIntegrationRuntime();

  as6ApplicationIntegrationState.status = 'running';
  as6ApplicationIntegrationState.runtime = runtime;

  traceAS6ApplicationIntegration('applicationIntegration.coordinated', {
    subsystemCount: runtime.manifest.subsystems.length,
    bootstrapOrderCount: runtime.manifest.bootstrapOrder.length,
  });

  return getAS6ApplicationIntegrationHealthSnapshot(runtime);
}

export function getAS6ApplicationIntegrationModel() {
  const runtime = as6ApplicationIntegrationState.runtime;

  return {
    status: as6ApplicationIntegrationState.status,
    runtime,
    health: getAS6ApplicationIntegrationHealthSnapshot(runtime || {}),
  };
}
