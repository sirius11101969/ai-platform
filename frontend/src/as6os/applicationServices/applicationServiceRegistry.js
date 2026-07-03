import { defineAS6ApplicationService, defineAS6ApplicationServiceCapability } from './applicationServiceContract.js';

export const as6ApplicationServiceDescriptors = [
  defineAS6ApplicationService({
    id: 'as6.application.service.context',
    label: 'AS6 Application Context Service',
    contractVersion: '1.0.0',
    exportedCapabilities: ['service.context'],
  }),
  defineAS6ApplicationService({
    id: 'as6.application.service.lifecycle',
    label: 'AS6 Application Lifecycle Service',
    contractVersion: '1.0.0',
    exportedCapabilities: ['service.lifecycle'],
    requiredCapabilities: ['service.context'],
    dependencies: ['as6.application.service.context'],
  }),
];

export const as6ApplicationServiceCapabilities = [
  defineAS6ApplicationServiceCapability({ id: 'service.context', type: 'context', owner: 'as6.application.service.context' }),
  defineAS6ApplicationServiceCapability({ id: 'service.lifecycle', type: 'lifecycle', owner: 'as6.application.service.lifecycle' }),
];

export const as6ApplicationServiceRegistry = {
  services: new Map(as6ApplicationServiceDescriptors.map((service) => [service.id, service])),
  capabilities: new Map(as6ApplicationServiceCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6ApplicationService(service) {
  const nextService = defineAS6ApplicationService(service);
  if (as6ApplicationServiceRegistry.services.has(nextService.id)) throw new Error('AS6_SERVICE_REGISTRATION_DUPLICATE');
  as6ApplicationServiceRegistry.services.set(nextService.id, nextService);
  return nextService;
}

export function getAS6ApplicationServices() {
  return Array.from(as6ApplicationServiceRegistry.services.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6ApplicationServiceCapabilities() {
  return Array.from(as6ApplicationServiceRegistry.capabilities.values()).sort((a, b) => a.id.localeCompare(b.id));
}
