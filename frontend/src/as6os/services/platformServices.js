export const AS6_PLATFORM_SERVICES_STAGE = 'AS6_EPIC009_SLICE05_PLATFORM_SERVICES';

export const as6PlatformServicesState = {
  initialized: new Set(),
  disposed: new Set(),
  events: [],
};

export const as6PlatformServicesRegistry = new Map();

export function traceAS6PlatformService(event, payload = {}) {
  const record = {
    event,
    payload,
    ts: new Date().toISOString(),
  };
  as6PlatformServicesState.events.push(record);
  return record;
}

export function defineAS6PlatformService(definition) {
  if (!definition || !definition.id || !definition.label) {
    throw new Error('AS6_PLATFORM_SERVICE_DEFINITION_INVALID');
  }

  return {
    lifecycle: {
      initialize: null,
      dispose: null,
    },
    status: 'registered',
    ...definition,
  };
}

export function registerAS6PlatformService(definition) {
  const service = defineAS6PlatformService(definition);
  as6PlatformServicesRegistry.set(service.id, service);
  traceAS6PlatformService('service.registered', { id: service.id });
  return service;
}

export function hasAS6PlatformService(serviceId) {
  return as6PlatformServicesRegistry.has(serviceId);
}

export function getAS6PlatformService(serviceId) {
  return as6PlatformServicesRegistry.get(serviceId) || null;
}

export function initializeAS6PlatformService(serviceId) {
  const service = getAS6PlatformService(serviceId);
  if (!service) throw new Error('AS6_PLATFORM_SERVICE_NOT_FOUND');

  if (!as6PlatformServicesState.initialized.has(serviceId)) {
    if (typeof service.lifecycle.initialize === 'function') {
      service.lifecycle.initialize(service);
    }
    as6PlatformServicesState.initialized.add(serviceId);
    as6PlatformServicesState.disposed.delete(serviceId);
    service.status = 'initialized';
    traceAS6PlatformService('service.initialized', { id: serviceId });
  }

  return service;
}

export function disposeAS6PlatformService(serviceId) {
  const service = getAS6PlatformService(serviceId);
  if (!service) return null;

  if (!as6PlatformServicesState.disposed.has(serviceId)) {
    if (typeof service.lifecycle.dispose === 'function') {
      service.lifecycle.dispose(service);
    }
    as6PlatformServicesState.initialized.delete(serviceId);
    as6PlatformServicesState.disposed.add(serviceId);
    service.status = 'disposed';
    traceAS6PlatformService('service.disposed', { id: serviceId });
  }

  return service;
}

export function removeAS6PlatformService(serviceId) {
  const service = disposeAS6PlatformService(serviceId);
  as6PlatformServicesRegistry.delete(serviceId);
  traceAS6PlatformService('service.removed', { id: serviceId });
  return service;
}

registerAS6PlatformService({
  id: 'as6.diagnostics',
  label: 'AS6 Diagnostics Service',
  status: 'foundation',
});

registerAS6PlatformService({
  id: 'as6.events',
  label: 'AS6 Event Service',
  status: 'foundation',
});

registerAS6PlatformService({
  id: 'as6.modules',
  label: 'AS6 Module Service',
  status: 'foundation',
});
