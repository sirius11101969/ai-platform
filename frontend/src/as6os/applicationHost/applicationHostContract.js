export const AS6_APPLICATION_HOST_STAGE = 'AS6_EPIC011_SLICE02_APPLICATION_HOST';

export function defineAS6ApplicationDescriptor(descriptor) {
  if (!descriptor || !descriptor.id || !descriptor.label) throw new Error('AS6_APPLICATION_DESCRIPTOR_INVALID');
  return {
    version: '1.0.0',
    order: 100,
    capabilities: [],
    dependencies: [],
    routes: [],
    panels: [],
    commands: [],
    services: [],
    permissions: [],
    availability: 'always',
    ...descriptor,
  };
}

export function defineAS6ApplicationHostCapability(capability) {
  if (!capability || !capability.id || !capability.type || !capability.owner) {
    throw new Error('AS6_APPLICATION_CAPABILITY_INVALID');
  }

  return {
    availability: 'always',
    dependencies: [],
    ...capability,
  };
}
