import { defineAS6ApplicationDescriptor, defineAS6ApplicationHostCapability } from './applicationHostContract.js';

export const as6ApplicationDescriptors = [
  defineAS6ApplicationDescriptor({
    id: 'as6.application.foundation',
    label: 'AS6 Application Foundation',
    capabilities: ['application.host', 'application.lifecycle', 'application.health'],
  }),
];

export const as6ApplicationHostCapabilities = [
  defineAS6ApplicationHostCapability({ id: 'application.host', type: 'runtime', owner: 'as6.application.foundation' }),
  defineAS6ApplicationHostCapability({ id: 'application.lifecycle', type: 'lifecycle', owner: 'as6.application.foundation' }),
  defineAS6ApplicationHostCapability({ id: 'application.health', type: 'diagnostics', owner: 'as6.application.foundation' }),
];

export const as6ApplicationHostRegistry = {
  descriptors: new Map(as6ApplicationDescriptors.map((descriptor) => [descriptor.id, descriptor])),
  capabilities: new Map(as6ApplicationHostCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6ApplicationDescriptor(descriptor) {
  const nextDescriptor = defineAS6ApplicationDescriptor(descriptor);
  if (as6ApplicationHostRegistry.descriptors.has(nextDescriptor.id)) throw new Error('AS6_APPLICATION_REGISTRY_COLLISION');
  as6ApplicationHostRegistry.descriptors.set(nextDescriptor.id, nextDescriptor);
  return nextDescriptor;
}

export function registerAS6ApplicationHostCapability(capability) {
  const nextCapability = defineAS6ApplicationHostCapability(capability);
  if (as6ApplicationHostRegistry.capabilities.has(nextCapability.id)) throw new Error('AS6_APPLICATION_CAPABILITY_CONFLICT');
  as6ApplicationHostRegistry.capabilities.set(nextCapability.id, nextCapability);
  return nextCapability;
}

export function getAS6ApplicationDescriptors() {
  return Array.from(as6ApplicationHostRegistry.descriptors.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6ApplicationHostCapabilities() {
  return Array.from(as6ApplicationHostRegistry.capabilities.values()).sort((a, b) => a.id.localeCompare(b.id));
}
