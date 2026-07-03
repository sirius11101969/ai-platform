import { defineAS6Application, defineAS6ApplicationCapability } from './applicationContract.js';

export const as6Applications = [
  defineAS6Application({
    id: 'as6.application.foundation',
    label: 'AS6 Application Foundation',
    order: 10,
    capabilities: ['application.register', 'application.lifecycle', 'application.health'],
  }),
];

export const as6ApplicationCapabilities = [
  defineAS6ApplicationCapability({ id: 'application.register', owner: 'as6.application.foundation' }),
  defineAS6ApplicationCapability({ id: 'application.lifecycle', owner: 'as6.application.foundation' }),
  defineAS6ApplicationCapability({ id: 'application.health', owner: 'as6.application.foundation' }),
];

export const as6ApplicationRegistry = {
  applications: new Map(as6Applications.map((application) => [application.id, application])),
  capabilities: new Map(as6ApplicationCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6Application(application) {
  const nextApplication = defineAS6Application(application);
  if (as6ApplicationRegistry.applications.has(nextApplication.id)) throw new Error('AS6_APPLICATION_REGISTRY_COLLISION');
  as6ApplicationRegistry.applications.set(nextApplication.id, nextApplication);
  return nextApplication;
}

export function getAS6Applications() {
  return Array.from(as6ApplicationRegistry.applications.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6Application(applicationId) {
  return as6ApplicationRegistry.applications.get(applicationId) || null;
}
