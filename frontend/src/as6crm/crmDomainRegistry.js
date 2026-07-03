import { defineAS6CrmDomain } from './crmDomainContract.js';
import { getAS6CrmAggregates } from './crmAggregateModel.js';
import { getAS6CrmRelationships } from './crmRelationshipModel.js';

export const as6CrmDomainModel = defineAS6CrmDomain({
  id: 'as6.crm.domain.model',
  label: 'AS6 CRM Domain Model',
  contractVersion: '1.0.0',
  aggregates: getAS6CrmAggregates().map((aggregate) => aggregate.id),
  relationships: getAS6CrmRelationships().map((relationship) => relationship.id),
  capabilities: ['crm.domain.model', 'crm.domain.relationships', 'crm.domain.aggregates'],
  diagnostics: ['crm.domain.health'],
});

export const as6CrmDomainRegistry = {
  domains: new Map([[as6CrmDomainModel.id, as6CrmDomainModel]]),
  aggregates: new Map(getAS6CrmAggregates().map((aggregate) => [aggregate.id, aggregate])),
  relationships: new Map(getAS6CrmRelationships().map((relationship) => [relationship.id, relationship])),
};

export function getAS6CrmDomains() {
  return Array.from(as6CrmDomainRegistry.domains.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6CrmDomainRegistrySnapshot() {
  return {
    domainCount: as6CrmDomainRegistry.domains.size,
    aggregateCount: as6CrmDomainRegistry.aggregates.size,
    relationshipCount: as6CrmDomainRegistry.relationships.size,
    domains: Array.from(as6CrmDomainRegistry.domains.keys()),
    aggregates: Array.from(as6CrmDomainRegistry.aggregates.keys()),
    relationships: Array.from(as6CrmDomainRegistry.relationships.keys()),
  };
}
