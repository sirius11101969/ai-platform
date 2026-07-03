import { defineAS6RuntimeService, defineAS6RuntimeServiceCapability } from './applicationRuntimeServiceContract.js';

export const as6RuntimeServices = [
  defineAS6RuntimeService({
    id: 'as6.runtime.context',
    label: 'AS6 Runtime Context Service',
    contractVersion: '1.0.0',
    exportedCapabilities: ['runtime.context'],
  }),
  defineAS6RuntimeService({
    id: 'as6.runtime.events',
    label: 'AS6 Runtime Event Bus Service',
    contractVersion: '1.0.0',
    exportedCapabilities: ['runtime.events'],
    requiredCapabilities: ['runtime.context'],
    dependencies: ['as6.runtime.context'],
  }),
];

export const as6RuntimeServiceCapabilities = [
  defineAS6RuntimeServiceCapability({ id: 'runtime.context', type: 'context', owner: 'as6.runtime.context' }),
  defineAS6RuntimeServiceCapability({ id: 'runtime.events', type: 'events', owner: 'as6.runtime.events' }),
];

export const as6RuntimeServiceRegistry = {
  services: new Map(as6RuntimeServices.map((service) => [service.id, service])),
  capabilities: new Map(as6RuntimeServiceCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6RuntimeService(service) {
  const nextService = defineAS6RuntimeService(service);
  if (as6RuntimeServiceRegistry.services.has(nextService.id)) throw new Error('AS6_RUNTIME_SERVICE_REGISTRY_COLLISION');
  as6RuntimeServiceRegistry.services.set(nextService.id, nextService);
  return nextService;
}

export function getAS6RuntimeServices() {
  return Array.from(as6RuntimeServiceRegistry.services.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6RuntimeServiceCapabilities() {
  return Array.from(as6RuntimeServiceRegistry.capabilities.values()).sort((a, b) => a.id.localeCompare(b.id));
}
