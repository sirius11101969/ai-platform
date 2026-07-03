import { getAS6Applications } from './applicationRegistry.js';
import { getAS6ApplicationTrace } from './applicationTracer.js';

export function getAS6ApplicationHealthSnapshot(runtimeState = {}) {
  const applications = getAS6Applications();
  return {
    stage: 'AS6_EPIC011_SLICE01_APPLICATION_FOUNDATION',
    applicationFoundation: {
      status: runtimeState.status || 'idle',
      applicationCount: applications.length,
      activeApplicationId: runtimeState.activeApplicationId || null,
      traceCount: getAS6ApplicationTrace().length,
      baseline: 'AS6_WORKSPACE_EXPERIENCE_V1',
    },
  };
}
