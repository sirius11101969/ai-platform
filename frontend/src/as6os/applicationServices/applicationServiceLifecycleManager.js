import { createAS6ServiceRuntimeManifest } from './applicationServiceResolver.js';
import { createAS6ServiceContextBridge } from './applicationServiceContextBridge.js';

export function createAS6ServiceLifecycleManager() {
  const manifest = createAS6ServiceRuntimeManifest();
  const context = createAS6ServiceContextBridge();

  const initialized = manifest.initializationOrder.map((serviceId, index) => ({
    serviceId,
    status: 'initialized',
    order: index + 1,
  }));

  const activated = manifest.initializationOrder.map((serviceId, index) => ({
    serviceId,
    status: 'active',
    order: index + 1,
  }));

  const shutdown = manifest.shutdownOrder.map((serviceId, index) => ({
    serviceId,
    status: 'shutdown-ready',
    order: index + 1,
  }));

  return {
    status: 'ready',
    manifest,
    context,
    initialized,
    activated,
    shutdown,
  };
}
