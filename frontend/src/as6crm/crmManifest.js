import { getAS6CrmDescriptor } from './crmDescriptor.js';
import { getAS6CrmCapabilityManifest } from './crmCapabilityManifest.js';
import { getAS6CrmRegistrySnapshot } from './crmRegistry.js';
import { getAS6CrmNavigationRegistration } from './crmNavigationRegistration.js';
import { getAS6CrmPanelRegistration } from './crmPanelRegistration.js';
import { getAS6CrmCommandRegistration } from './crmCommandRegistration.js';

export function createAS6CrmManifest() {
  return {
    descriptor: getAS6CrmDescriptor(),
    capabilities: getAS6CrmCapabilityManifest(),
    registry: getAS6CrmRegistrySnapshot(),
    navigation: getAS6CrmNavigationRegistration(),
    panel: getAS6CrmPanelRegistration(),
    command: getAS6CrmCommandRegistration(),
  };
}
