import { createAS6ServiceLifecycleManager } from './applicationServiceLifecycleManager.js';

export function createAS6ApplicationServiceRuntime() {
  const lifecycleManager = createAS6ServiceLifecycleManager();

  return {
    status: 'running',
    lifecycleManager,
    manifest: lifecycleManager.manifest,
    context: lifecycleManager.context,
  };
}
