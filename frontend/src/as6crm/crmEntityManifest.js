import { getAS6CrmEntityRuntimeDescriptor } from './crmEntityDescriptor.js';
import { getAS6CrmEntityCapabilities } from './crmEntityCapabilities.js';
import { getAS6CrmEntityRegistrySnapshot } from './crmEntityRegistry.js';
import { resolveAS6CrmEntityRuntime } from './crmEntityResolver.js';

export function createAS6CrmEntityManifest() {
  return {
    descriptor: getAS6CrmEntityRuntimeDescriptor(),
    capabilities: getAS6CrmEntityCapabilities(),
    registry: getAS6CrmEntityRegistrySnapshot(),
    resolution: resolveAS6CrmEntityRuntime(),
  };
}
