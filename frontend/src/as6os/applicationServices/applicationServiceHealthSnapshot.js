import { getAS6ApplicationServiceTrace } from './applicationServiceTracer.js';

export function getAS6ApplicationServiceHealthSnapshot(state = {}) {
  const lifecycleManager = state.lifecycleManager || {};

  return {
    stage: 'AS6_EPIC011_SLICE06_APPLICATION_SERVICES',
    applicationServices: {
      status: state.status || 'idle',
      serviceCount: state.manifest?.services?.length || 0,
      capabilityCount: state.manifest?.capabilityGraph?.capabilities?.length || 0,
      dependencyNodeCount: state.manifest?.dependencyGraph?.nodes?.length || 0,
      initializedCount: lifecycleManager.initialized?.length || 0,
      activatedCount: lifecycleManager.activated?.length || 0,
      shutdownOrderCount: lifecycleManager.shutdown?.length || 0,
      contextBridge: Boolean(state.context),
      traceCount: getAS6ApplicationServiceTrace().length,
    },
  };
}
