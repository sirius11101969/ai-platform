import { createAS6ExtensionComposition } from './applicationExtensionResolver.js';

export function createAS6ExtensionRuntime() {
  const composition = createAS6ExtensionComposition();
  return {
    status: 'running',
    composition,
    lifecycle: composition.extensions.map((extension) => ({
      extensionId: extension.id,
      status: 'composed',
    })),
  };
}
