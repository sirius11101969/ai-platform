export const AS6_CRM_ENTITY_CONTRACT_VERSION = '1.0.0';

export function defineAS6CrmEntityType(entity) {
  if (!entity || !entity.id || !entity.label || !entity.contractVersion) {
    throw new Error('AS6_CRM_ENTITY_CONTRACT_MISSING');
  }

  return {
    kind: 'crm-entity-type',
    platformMutation: false,
    fields: [],
    capabilities: [],
    lifecycle: ['declare', 'resolve', 'activate', 'diagnose'],
    diagnostics: [],
    ...entity,
  };
}

export function defineAS6CrmEntityField(field) {
  if (!field || !field.id || !field.label || !field.type) {
    throw new Error('AS6_CRM_ENTITY_FIELD_CONTRACT_MISSING');
  }

  return {
    required: false,
    indexed: false,
    sensitive: false,
    ...field,
  };
}
