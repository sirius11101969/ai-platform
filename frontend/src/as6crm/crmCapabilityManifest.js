export const as6CrmCapabilityManifest = {
  application: 'as6.crm.foundation',
  capabilities: [
    'crm.entities',
    'crm.navigation',
    'crm.panels',
    'crm.commands',
    'crm.context',
    'crm.runtime',
    'crm.diagnostics',
  ],
  platformCapabilities: [
    'application.registry',
    'application.shell',
    'application.runtime.services',
    'application.extension.points',
  ],
};

export function getAS6CrmCapabilityManifest() {
  return { ...as6CrmCapabilityManifest };
}
