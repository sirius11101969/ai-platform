export const AS6_CRM_CONTRACT_VERSION = '1.0.0';

export function defineAS6CrmModule(module) {
  if (!module || !module.id || !module.label || !module.contractVersion) {
    throw new Error('AS6_CRM_CONTRACT_MISSING');
  }

  return {
    type: 'crm-module',
    platformMutation: false,
    entities: [],
    capabilities: [],
    navigation: [],
    panels: [],
    commands: [],
    diagnostics: [],
    ...module,
  };
}

export function defineAS6CrmEntity(entity) {
  if (!entity || !entity.id || !entity.label || !Array.isArray(entity.fields)) {
    throw new Error('AS6_CRM_ENTITY_MODEL_DRIFT');
  }

  return {
    type: 'crm-entity',
    version: '1.0.0',
    capabilities: [],
    ...entity,
  };
}
