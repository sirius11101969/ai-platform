export const AS6_APPLICATION_EXTENSION_POINTS_STAGE = 'AS6_EPIC011_SLICE05_APPLICATION_EXTENSION_POINTS';

export function defineAS6ExtensionPoint(point) {
  if (!point || !point.id || !point.label || !point.contractVersion) {
    throw new Error('AS6_EXTENSION_POINT_CONTRACT_MISMATCH');
  }

  return {
    scope: 'application',
    allowedCapabilities: [],
    lifecycle: ['register', 'resolve', 'compose', 'dispose'],
    compatibility: ['AS6_OPERATING_SYSTEM_V1', 'AS6_WORKSPACE_EXPERIENCE_V1'],
    availability: 'always',
    ...point,
  };
}

export function defineAS6Extension(extension) {
  if (!extension || !extension.id || !extension.pointId || !extension.contractVersion) {
    throw new Error('AS6_EXTENSION_POINT_CONTRACT_MISMATCH');
  }

  return {
    capabilities: [],
    requiredCapabilities: [],
    lifecycle: ['register', 'resolve', 'compose', 'dispose'],
    baselineCompatibility: ['AS6_OPERATING_SYSTEM_V1', 'AS6_WORKSPACE_EXPERIENCE_V1'],
    availability: 'always',
    ...extension,
  };
}

export function defineAS6ExtensionCapability(capability) {
  if (!capability || !capability.id || !capability.owner || !capability.type) {
    throw new Error('AS6_EXTENSION_CAPABILITY_CONFLICT');
  }

  return { availability: 'always', ...capability };
}
