export const as6CrmEntityRuntimeDescriptor = {
  id: 'as6.crm.entity.runtime',
  label: 'AS6 CRM Entity Runtime',
  version: '1.0.0',
  epic: 'AS6_EPIC012_CRM_FOUNDATION',
  stage: 'AS6_EPIC012_SLICE02_CRM_ENTITY_RUNTIME',
  entityRuntime: true,
  platformMutation: false,
  persistentStorageChanges: false,
  baselineDependencies: [
    'AS6_OPERATING_SYSTEM_V1',
    'AS6_WORKSPACE_EXPERIENCE_V1',
    'AS6_APPLICATION_FOUNDATION_V1',
    'AS6_CRM_FOUNDATION',
  ],
};

export function getAS6CrmEntityRuntimeDescriptor() {
  return { ...as6CrmEntityRuntimeDescriptor };
}
