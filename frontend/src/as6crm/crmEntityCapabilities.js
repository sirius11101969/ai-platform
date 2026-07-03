export const as6CrmEntityCapabilities = {
  runtime: 'crm.entity.runtime',
  capabilities: [
    'crm.entity.contract',
    'crm.entity.registry',
    'crm.entity.resolver',
    'crm.entity.context',
    'crm.entity.manifest',
    'crm.entity.diagnostics',
  ],
};

export function getAS6CrmEntityCapabilities() {
  return { ...as6CrmEntityCapabilities };
}
