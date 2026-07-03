import { createAS6CrmDomainManifest } from './crmDomainManifest.js';

export function createAS6CrmDomainRuntime() {
  const manifest = createAS6CrmDomainManifest();

  return {
    status: 'running',
    platformMutation: false,
    persistentStorageChanges: false,
    manifest,
  };
}
