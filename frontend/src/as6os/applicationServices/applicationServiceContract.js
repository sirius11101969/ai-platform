export const AS6_APPLICATION_SERVICES_STAGE = 'AS6_EPIC011_SLICE06_APPLICATION_SERVICES';

export function defineAS6ApplicationService(service) {
  if (!service || !service.id || !service.label || !service.contractVersion) {
    throw new Error('AS6_SERVICE_CONTRACT_MISMATCH');
  }

  return {
    descriptorType: 'application-service',
    exportedCapabilities: [],
    requiredCapabilities: [],
    dependencies: [],
    lifecycle: ['register', 'initialize', 'activate', 'shutdown', 'dispose'],
    contextRequirements: [],
    availability: 'always',
    ...service,
  };
}

export function defineAS6ApplicationServiceCapability(capability) {
  if (!capability || !capability.id || !capability.owner || !capability.type) {
    throw new Error('AS6_SERVICE_CAPABILITY_CONFLICT');
  }

  return { availability: 'always', ...capability };
}
