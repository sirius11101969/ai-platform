import { getAS6CrmEntityTrace } from './crmEntityTracer.js';

export function getAS6CrmEntityHealthSnapshot(runtime = {}) {
  const manifest = runtime.manifest || {};

  return {
    stage: 'AS6_EPIC012_SLICE02_CRM_ENTITY_RUNTIME',
    crmEntityRuntime: {
      status: runtime.status || 'idle',
      entityTypeCount: manifest.registry?.entityTypeCount || 0,
      fieldCount: manifest.registry?.fieldCount || 0,
      resolutionCount: manifest.resolution?.resolution?.length || 0,
      capabilityCount: manifest.capabilities?.capabilities?.length || 0,
      platformMutation: false,
      persistentStorageChanges: false,
      traceCount: getAS6CrmEntityTrace().length,
    },
  };
}
