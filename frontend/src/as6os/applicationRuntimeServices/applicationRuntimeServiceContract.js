export const AS6_APPLICATION_RUNTIME_SERVICES_STAGE = 'AS6_EPIC011_SLICE04_APPLICATION_RUNTIME_SERVICES';

export function defineAS6RuntimeService(service) {
  if (!service || !service.id || !service.label || !service.contractVersion) {
    throw new Error('AS6_RUNTIME_SERVICE_CONTRACT_MISMATCH');
  }

  return {
    scope: 'application-runtime',
    exportedCapabilities: [],
    requiredCapabilities: [],
    dependencies: [],
    lifecycleHooks: ['initialize', 'dispose'],
    contextRequirements: [],
    diagnostics: [],
    availability: 'always',
    ...service,
  };
}

export function defineAS6RuntimeServiceCapability(capability) {
  if (!capability || !capability.id || !capability.owner || !capability.type) {
    throw new Error('AS6_RUNTIME_SERVICE_CAPABILITY_INVALID');
  }

  return {
    availability: 'always',
    ...capability,
  };
}
