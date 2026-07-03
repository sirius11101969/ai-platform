import { createAS6ApplicationRuntimeManifest } from './applicationHostResolver.js';

export function loadAS6ApplicationHost() {
  const manifest = createAS6ApplicationRuntimeManifest();
  if (!manifest || !Array.isArray(manifest.applications)) throw new Error('AS6_APPLICATION_RUNTIME_MANIFEST_INVALID');

  return {
    status: 'loaded',
    manifest,
  };
}
