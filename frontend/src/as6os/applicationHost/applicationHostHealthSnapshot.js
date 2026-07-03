import { getAS6ApplicationHostTrace } from './applicationHostTracer.js';

export function getAS6ApplicationHostHealthSnapshot(state = {}) {
  return {
    stage: 'AS6_EPIC011_SLICE02_APPLICATION_HOST',
    applicationHost: {
      status: state.status || 'idle',
      loadedApplicationCount: state.manifest?.applications?.length || 0,
      capabilityCount: state.manifest?.capabilityGraph?.nodes?.length || 0,
      dependencyNodeCount: state.manifest?.dependencyGraph?.nodes?.length || 0,
      activationOrderCount: state.manifest?.activationOrder?.length || 0,
      traceCount: getAS6ApplicationHostTrace().length,
    },
  };
}
