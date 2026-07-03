import { createAS6ApplicationServiceRuntime } from './applicationServiceRuntime.js';
import { traceAS6ApplicationService } from './applicationServiceTracer.js';
import { getAS6ApplicationServiceHealthSnapshot } from './applicationServiceHealthSnapshot.js';

export const as6ApplicationServiceState = {
  status: 'idle',
  runtime: null,
};

export function bootstrapAS6ApplicationServices() {
  const runtime = createAS6ApplicationServiceRuntime();
  as6ApplicationServiceState.status = 'running';
  as6ApplicationServiceState.runtime = runtime;

  traceAS6ApplicationService('applicationServices.bootstrapped', {
    serviceCount: runtime.manifest.services.length,
  });

  return getAS6ApplicationServiceHealthSnapshot(runtime);
}

export function getAS6ApplicationServicesModel() {
  const runtime = as6ApplicationServiceState.runtime;
  return {
    status: as6ApplicationServiceState.status,
    runtime,
    health: getAS6ApplicationServiceHealthSnapshot(runtime || {}),
  };
}
