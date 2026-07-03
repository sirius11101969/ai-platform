import { defineAS6CrmAggregate } from './crmDomainContract.js';

export const as6CrmAggregates = [
  defineAS6CrmAggregate({
    id: 'crm.aggregate.generic',
    label: 'Generic CRM Aggregate',
    rootEntity: 'crm.entity.generic',
    members: ['crm.entity.generic'],
    invariants: ['entity.contract.required', 'entity.resolution.required'],
    capabilities: ['crm.domain.aggregate'],
  }),
];

export function getAS6CrmAggregates() {
  return [...as6CrmAggregates];
}
