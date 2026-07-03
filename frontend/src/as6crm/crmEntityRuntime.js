import { createAS6CrmEntityContext } from './crmEntityContext.js';
import { createAS6CrmEntityManifest } from './crmEntityManifest.js';

export function createAS6CrmEntityRuntime() {
  const context = createAS6CrmEntityContext();
  const manifest = createAS6CrmEntityManifest();

  return {
    status: 'running',
    context,
    manifest,
  };
}
