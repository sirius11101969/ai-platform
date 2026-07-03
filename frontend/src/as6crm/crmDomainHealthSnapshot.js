import { getAS6CrmDomainTrace } from './crmDomainTracer.js';

export function getAS6CrmDomainHealthSnapshot(runtime = {}) {
  const manifest = runtime.manifest || {};

  return {
    stage: 'AS6_EPIC012_SLICE03_CRM_DOMAIN_MODEL',
    crmDomainModel: {
      status: runtime.status || 'idle',
      domainCount: manifest.registry?.domainCount || 0,
      aggregateCount: manifest.registry?.aggregateCount || 0,
      relationshipCount: manifest.registry?.relationshipCount || 0,
      resolutionCount: manifest.resolution?.resolutionCount || 0,
      platformMutation: false,
      persistentStorageChanges: false,
      traceCount: getAS6CrmDomainTrace().length,
    },
  };
}
