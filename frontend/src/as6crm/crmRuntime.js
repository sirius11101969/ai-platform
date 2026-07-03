import { createAS6CrmContext } from './crmContext.js';
import { createAS6CrmManifest } from './crmManifest.js';

export function createAS6CrmRuntime() {
  const context = createAS6CrmContext();
  const manifest = createAS6CrmManifest();

  return {
    status: 'running',
    context,
    manifest,
  };
}
