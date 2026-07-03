import { createAS6UnifiedApplicationRuntimeManifest } from './applicationRuntimeManifest.js';

export function createAS6ApplicationIntegrationComposition() {
  const manifest = createAS6UnifiedApplicationRuntimeManifest();

  return {
    manifest,
    composition: manifest.bootstrapOrder.map((subsystemId, index) => ({
      subsystemId,
      order: index + 1,
      status: 'ready',
    })),
  };
}
