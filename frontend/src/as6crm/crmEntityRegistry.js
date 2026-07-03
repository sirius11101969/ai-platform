import { defineAS6CrmEntityType, defineAS6CrmEntityField } from './crmEntityContract.js';

export const as6CrmEntityRuntimeFields = [
  defineAS6CrmEntityField({ id: 'id', label: 'ID', type: 'string', required: true, indexed: true }),
  defineAS6CrmEntityField({ id: 'label', label: 'Label', type: 'string', required: true }),
  defineAS6CrmEntityField({ id: 'status', label: 'Status', type: 'string', indexed: true }),
];

export const as6CrmEntityRuntimeTypes = [
  defineAS6CrmEntityType({
    id: 'crm.entity.generic',
    label: 'Generic CRM Entity',
    contractVersion: '1.0.0',
    fields: as6CrmEntityRuntimeFields.map((field) => field.id),
    capabilities: ['crm.entity.runtime'],
    diagnostics: ['crm.entity.health'],
  }),
];

export const as6CrmEntityRegistry = {
  entityTypes: new Map(as6CrmEntityRuntimeTypes.map((entity) => [entity.id, entity])),
  fields: new Map(as6CrmEntityRuntimeFields.map((field) => [field.id, field])),
};

export function getAS6CrmEntityTypes() {
  return Array.from(as6CrmEntityRegistry.entityTypes.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6CrmEntityFields() {
  return Array.from(as6CrmEntityRegistry.fields.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6CrmEntityRegistrySnapshot() {
  return {
    entityTypeCount: as6CrmEntityRegistry.entityTypes.size,
    fieldCount: as6CrmEntityRegistry.fields.size,
    entityTypes: getAS6CrmEntityTypes().map((entity) => entity.id),
    fields: getAS6CrmEntityFields().map((field) => field.id),
  };
}
