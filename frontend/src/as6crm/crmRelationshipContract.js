export const AS6_CRM_RELATIONSHIP_CONTRACT_VERSION = '1.0.0';

export const AS6_CRM_RELATIONSHIP_TYPES = [
  'one-to-one',
  'one-to-many',
  'many-to-many',
  'parent-child',
  'ownership',
  'reference',
];

export function defineAS6CrmRelationship(relationship) {
  if (!relationship || !relationship.id || !relationship.label || !relationship.from || !relationship.to || !relationship.type) {
    throw new Error('AS6_CRM_RELATIONSHIP_CONTRACT_MISSING');
  }

  if (!AS6_CRM_RELATIONSHIP_TYPES.includes(relationship.type)) {
    throw new Error('AS6_CRM_RELATIONSHIP_CONFLICT');
  }

  return {
    kind: 'crm-relationship',
    required: false,
    cascade: false,
    platformMutation: false,
    ...relationship,
  };
}
