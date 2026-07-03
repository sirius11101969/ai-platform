export const as6CrmDescriptor = {
  id: 'as6.crm.foundation',
  name: 'AS6 CRM Foundation',
  version: '1.0.0',
  epic: 'AS6_EPIC012_CRM_FOUNDATION',
  epicType: 'APPLICATION',
  platformMutation: false,
  baselineDependencies: [
    'AS6_OPERATING_SYSTEM_V1',
    'AS6_WORKSPACE_EXPERIENCE_V1',
    'AS6_APPLICATION_FOUNDATION_V1',
  ],
  capabilities: [
    'crm.contract',
    'crm.registry',
    'crm.entities',
    'crm.navigation',
    'crm.panels',
    'crm.commands',
    'crm.diagnostics',
  ],
};

export function getAS6CrmDescriptor() {
  return { ...as6CrmDescriptor };
}
