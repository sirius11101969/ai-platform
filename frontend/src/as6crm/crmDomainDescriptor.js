export const as6CrmDomainDescriptor = {
  id: 'as6.crm.domain.model',
  label: 'AS6 CRM Domain Model',
  version: '1.0.0',
  epic: 'AS6_EPIC012_CRM_FOUNDATION',
  stage: 'AS6_EPIC012_SLICE03_CRM_DOMAIN_MODEL',
  epicType: 'APPLICATION',
  platformMutation: false,
  persistentStorageChanges: false,
  publicApiBreakingChanges: false,
  baselineDependencies: [
    'AS6_OPERATING_SYSTEM_V1',
    'AS6_WORKSPACE_EXPERIENCE_V1',
    'AS6_APPLICATION_FOUNDATION_V1',
    'AS6_CRM_FOUNDATION',
    'AS6_CRM_ENTITY_RUNTIME',
  ],
};

export function getAS6CrmDomainDescriptor() {
  return { ...as6CrmDomainDescriptor };
}
