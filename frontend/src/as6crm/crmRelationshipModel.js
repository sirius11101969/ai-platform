import { defineAS6CrmRelationship } from './crmRelationshipContract.js';

export const as6CrmRelationships = [
  defineAS6CrmRelationship({
    id: 'crm.relationship.owner.reference',
    label: 'Owner Reference',
    from: 'crm.entity.generic',
    to: 'crm.entity.generic',
    type: 'reference',
  }),
  defineAS6CrmRelationship({
    id: 'crm.relationship.parent.child',
    label: 'Parent Child',
    from: 'crm.entity.generic',
    to: 'crm.entity.generic',
    type: 'parent-child',
  }),
];

export function getAS6CrmRelationships() {
  return [...as6CrmRelationships];
}
