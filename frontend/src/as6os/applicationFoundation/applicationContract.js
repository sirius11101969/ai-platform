export const AS6_APPLICATION_FOUNDATION_STAGE = 'AS6_EPIC011_SLICE01_APPLICATION_FOUNDATION';

export function defineAS6Application(application) {
  if (!application || !application.id || !application.label) throw new Error('AS6_APPLICATION_CONTRACT_INVALID');
  return {
    version: '1.0.0',
    status: 'registered',
    order: 100,
    capabilities: [],
    dependencies: [],
    runtimeMode: 'application-foundation',
    availability: 'always',
    ...application,
  };
}

export function defineAS6ApplicationCapability(capability) {
  if (!capability || !capability.id || !capability.owner) throw new Error('AS6_APPLICATION_CAPABILITY_INVALID');
  return { availability: 'always', ...capability };
}

export function defineAS6ApplicationContext(context = {}) {
  return {
    baseline: 'AS6_WORKSPACE_EXPERIENCE_V1',
    operatingSystemBaseline: 'AS6_OPERATING_SYSTEM_V1',
    workspaceBaseline: 'AS6_WORKSPACE_EXPERIENCE_V1',
    mode: 'application-foundation',
    noBusinessLogic: true,
    noCrmFeatures: true,
    noPersistentStorageChanges: true,
    ...context,
  };
}
