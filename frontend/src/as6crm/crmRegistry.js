import { defineAS6CrmModule } from './crmContract.js';
import { getAS6CrmEntities } from './crmEntityModel.js';
import { getAS6CrmCapabilityManifest } from './crmCapabilityManifest.js';

export const as6CrmFoundationModule = defineAS6CrmModule({
  id: 'as6.crm.foundation',
  label: 'AS6 CRM Foundation',
  contractVersion: '1.0.0',
  entities: getAS6CrmEntities().map((entity) => entity.id),
  capabilities: getAS6CrmCapabilityManifest().capabilities,
  navigation: ['crm.foundation'],
  panels: ['crm.foundation.overview'],
  commands: ['crm.open'],
  diagnostics: ['crm.health', 'crm.registry'],
});

export const as6CrmRegistry = {
  modules: new Map([[as6CrmFoundationModule.id, as6CrmFoundationModule]]),
  entities: new Map(getAS6CrmEntities().map((entity) => [entity.id, entity])),
};

export function getAS6CrmModules() {
  return Array.from(as6CrmRegistry.modules.values());
}

export function getAS6CrmRegistrySnapshot() {
  return {
    moduleCount: as6CrmRegistry.modules.size,
    entityCount: as6CrmRegistry.entities.size,
    modules: getAS6CrmModules().map((module) => module.id),
    entities: Array.from(as6CrmRegistry.entities.keys()),
  };
}
