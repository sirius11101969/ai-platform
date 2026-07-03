import { getAS6CrmDomainRegistrySnapshot, as6CrmDomainRegistry } from './crmDomainRegistry.js';

export function resolveAS6CrmDomainModel() {
  const snapshot = getAS6CrmDomainRegistrySnapshot();

  for (const domain of as6CrmDomainRegistry.domains.values()) {
    for (const aggregateId of domain.aggregates || []) {
      if (!as6CrmDomainRegistry.aggregates.has(aggregateId)) {
        throw new Error('AS6_CRM_DOMAIN_MANIFEST_DRIFT');
      }
    }

    for (const relationshipId of domain.relationships || []) {
      if (!as6CrmDomainRegistry.relationships.has(relationshipId)) {
        throw new Error('AS6_CRM_DOMAIN_MANIFEST_DRIFT');
      }
    }
  }

  return {
    snapshot,
    status: 'resolved',
    resolutionCount: snapshot.domainCount + snapshot.aggregateCount + snapshot.relationshipCount,
  };
}
