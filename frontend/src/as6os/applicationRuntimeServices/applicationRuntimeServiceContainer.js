import { createAS6RuntimeServiceManifest } from './applicationRuntimeServiceResolver.js';
import { initializeAS6RuntimeService, disposeAS6RuntimeService } from './applicationRuntimeLifecycle.js';
import { createAS6RuntimeContextBridge } from './applicationRuntimeContextBridge.js';

export function createAS6RuntimeServiceContainer() {
  const manifest = createAS6RuntimeServiceManifest();
  const context = createAS6RuntimeContextBridge();
  const initialized = manifest.services.map((service) => initializeAS6RuntimeService(service));

  return {
    status: 'running',
    manifest,
    context,
    initialized,
    dispose: () => manifest.services.map((service) => disposeAS6RuntimeService(service)),
  };
}
