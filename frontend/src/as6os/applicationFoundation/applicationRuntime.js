import { getAS6Applications, getAS6Application } from './applicationRegistry.js';
import { createAS6ApplicationLifecycle, transitionAS6ApplicationLifecycle } from './applicationLifecycle.js';
import { createAS6ApplicationContext } from './applicationContext.js';
import { traceAS6Application } from './applicationTracer.js';
import { getAS6ApplicationHealthSnapshot } from './applicationHealthSnapshot.js';

export const as6ApplicationRuntimeState = {
  status: 'idle',
  activeApplicationId: null,
  lifecycles: new Map(),
  contexts: new Map(),
};

export function bootstrapAS6ApplicationFoundation(applicationId = 'as6.application.foundation') {
  const application = getAS6Application(applicationId);
  if (!application) throw new Error('AS6_APPLICATION_NOT_FOUND');
  let lifecycle = as6ApplicationRuntimeState.lifecycles.get(applicationId) || createAS6ApplicationLifecycle(applicationId);
  lifecycle = transitionAS6ApplicationLifecycle(lifecycle, 'bootstrapped');
  lifecycle = transitionAS6ApplicationLifecycle(lifecycle, 'running');
  const context = createAS6ApplicationContext(application);
  as6ApplicationRuntimeState.status = 'running';
  as6ApplicationRuntimeState.activeApplicationId = applicationId;
  as6ApplicationRuntimeState.lifecycles.set(applicationId, lifecycle);
  as6ApplicationRuntimeState.contexts.set(applicationId, context);
  traceAS6Application('application.bootstrapped', { applicationId });
  return getAS6ApplicationHealthSnapshot(as6ApplicationRuntimeState);
}

export function shutdownAS6ApplicationFoundation(applicationId = as6ApplicationRuntimeState.activeApplicationId) {
  if (!applicationId) return getAS6ApplicationHealthSnapshot(as6ApplicationRuntimeState);
  const lifecycle = as6ApplicationRuntimeState.lifecycles.get(applicationId);
  if (lifecycle) transitionAS6ApplicationLifecycle(lifecycle, 'stopped');
  as6ApplicationRuntimeState.status = 'stopped';
  traceAS6Application('application.stopped', { applicationId });
  return getAS6ApplicationHealthSnapshot(as6ApplicationRuntimeState);
}

export function getAS6ApplicationFoundationModel() {
  return {
    status: as6ApplicationRuntimeState.status,
    activeApplicationId: as6ApplicationRuntimeState.activeApplicationId,
    applications: getAS6Applications(),
    health: getAS6ApplicationHealthSnapshot(as6ApplicationRuntimeState),
  };
}
