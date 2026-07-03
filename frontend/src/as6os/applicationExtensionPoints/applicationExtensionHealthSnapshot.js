import { getAS6ExtensionTrace } from './applicationExtensionTracer.js';

export function getAS6ExtensionHealthSnapshot(state = {}) {
  return {
    stage: 'AS6_EPIC011_SLICE05_APPLICATION_EXTENSION_POINTS',
    extensionPoints: {
      status: state.status || 'idle',
      pointCount: state.composition?.points?.length || 0,
      extensionCount: state.composition?.extensions?.length || 0,
      capabilityCount: state.composition?.capabilityGraph?.capabilities?.length || 0,
      lifecycleCount: state.lifecycle?.length || 0,
      traceCount: getAS6ExtensionTrace().length,
    },
  };
}
