import { getAS6ApplicationIntegrationTrace } from './applicationIntegrationTracer.js';

export function getAS6ApplicationIntegrationHealthSnapshot(state = {}) {
  return {
    stage: 'AS6_EPIC011_SLICE07_APPLICATION_INTEGRATION',
    applicationIntegration: {
      status: state.status || 'idle',
      subsystemCount: state.manifest?.subsystems?.length || 0,
      bootstrapOrderCount: state.manifest?.bootstrapOrder?.length || 0,
      dependencyNodeCount: state.manifest?.dependencyGraph?.nodes?.length || 0,
      capabilityCount: state.manifest?.capabilities?.length || 0,
      compositionCount: state.composition?.length || 0,
      traceCount: getAS6ApplicationIntegrationTrace().length,
    },
  };
}
