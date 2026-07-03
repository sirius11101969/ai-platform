import { getAS6RuntimeServicesTrace } from './applicationRuntimeTracer.js';

export function getAS6RuntimeServicesHealthSnapshot(state = {}) {
  return {
    stage: 'AS6_EPIC011_SLICE04_APPLICATION_RUNTIME_SERVICES',
    runtimeServices: {
      status: state.status || 'idle',
      serviceCount: state.manifest?.services?.length || 0,
      dependencyNodeCount: state.manifest?.dependencyGraph?.nodes?.length || 0,
      capabilityCount: state.manifest?.capabilityGraph?.capabilities?.length || 0,
      initializedCount: state.initialized?.length || 0,
      contextBridge: Boolean(state.context),
      traceCount: getAS6RuntimeServicesTrace().length,
    },
  };
}
