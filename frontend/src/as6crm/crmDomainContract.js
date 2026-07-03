export const AS6_CRM_DOMAIN_CONTRACT_VERSION = '1.0.0';

export function defineAS6CrmDomain(domain) {
  if (!domain || !domain.id || !domain.label || !domain.contractVersion) {
    throw new Error('AS6_CRM_DOMAIN_CONTRACT_MISSING');
  }

  return {
    kind: 'crm-domain',
    platformMutation: false,
    aggregates: [],
    relationships: [],
    capabilities: [],
    diagnostics: [],
    ...domain,
  };
}

export function defineAS6CrmAggregate(aggregate) {
  if (!aggregate || !aggregate.id || !aggregate.label || !aggregate.rootEntity) {
    throw new Error('AS6_CRM_AGGREGATE_CONTRACT_MISSING');
  }

  return {
    kind: 'crm-aggregate',
    members: [],
    invariants: [],
    capabilities: [],
    ...aggregate,
  };
}
