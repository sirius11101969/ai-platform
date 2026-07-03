import { createAS6ApplicationIntegrationComposition } from './applicationIntegrationComposition.js';

export function bootstrapAS6ApplicationIntegrationRuntime() {
  const { manifest, composition } = createAS6ApplicationIntegrationComposition();

  if (!manifest || !composition.length) throw new Error('AS6_APPLICATION_BOOTSTRAP_SEQUENCE_FAILURE');

  return {
    status: 'running',
    manifest,
    composition,
  };
}
