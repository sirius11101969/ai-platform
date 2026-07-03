import { createAS6RuntimeServiceContainer } from './applicationRuntimeServiceContainer.js';
import { publishAS6RuntimeEvent } from './applicationRuntimeEventBus.js';
import { traceAS6RuntimeServices } from './applicationRuntimeTracer.js';
import { getAS6RuntimeServicesHealthSnapshot } from './applicationRuntimeHealthSnapshot.js';

export const as6RuntimeServicesState = {
  status: 'idle',
  container: null,
};

export function bootstrapAS6RuntimeServices() {
  const container = createAS6RuntimeServiceContainer();
  as6RuntimeServicesState.status = 'running';
  as6RuntimeServicesState.container = container;
  traceAS6RuntimeServices('runtimeServices.bootstrapped', {
    serviceCount: container.manifest.services.length,
  });
  publishAS6RuntimeEvent('runtimeServices.bootstrapped', { serviceCount: container.manifest.services.length });
  return getAS6RuntimeServicesHealthSnapshot(container);
}

export function getAS6RuntimeServicesModel() {
  const container = as6RuntimeServicesState.container;
  return {
    status: as6RuntimeServicesState.status,
    container,
    health: getAS6RuntimeServicesHealthSnapshot(container || {}),
  };
}
