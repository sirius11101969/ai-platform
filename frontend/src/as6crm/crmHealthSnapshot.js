import { getAS6CrmTrace } from './crmTracer.js';

export function getAS6CrmHealthSnapshot(runtime = {}) {
  const manifest = runtime.manifest || {};

  return {
    stage: 'AS6_EPIC012_SLICE01_CRM_FOUNDATION',
    crm: {
      status: runtime.status || 'idle',
      moduleCount: manifest.registry?.moduleCount || 0,
      entityCount: manifest.registry?.entityCount || 0,
      capabilityCount: manifest.capabilities?.capabilities?.length || 0,
      platformMutation: false,
      traceCount: getAS6CrmTrace().length,
    },
  };
}
