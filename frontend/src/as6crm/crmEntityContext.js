import { getAS6CrmEntityRuntimeDescriptor } from './crmEntityDescriptor.js';

export function createAS6CrmEntityContext(context = {}) {
  return {
    descriptor: getAS6CrmEntityRuntimeDescriptor(),
    platformMutation: false,
    persistentStorageChanges: false,
    crmFoundation: 'AS6_EPIC012_SLICE01_CRM_FOUNDATION',
    ...context,
  };
}
