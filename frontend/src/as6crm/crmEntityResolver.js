import { getAS6CrmEntityTypes, getAS6CrmEntityFields } from './crmEntityRegistry.js';

export function resolveAS6CrmEntityRuntime() {
  const entityTypes = getAS6CrmEntityTypes();
  const fields = getAS6CrmEntityFields();
  const fieldIds = new Set(fields.map((field) => field.id));

  for (const entityType of entityTypes) {
    for (const fieldId of entityType.fields || []) {
      if (!fieldIds.has(fieldId)) {
        throw new Error('AS6_CRM_ENTITY_FIELD_RESOLUTION_FAILURE');
      }
    }
  }

  return {
    entityTypes,
    fields,
    resolution: entityTypes.map((entityType) => ({
      entityTypeId: entityType.id,
      fields: entityType.fields,
      status: 'resolved',
    })),
  };
}
