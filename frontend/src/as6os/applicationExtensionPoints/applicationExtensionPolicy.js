export const as6ExtensionPolicy = {
  compatibleBaselines: ['AS6_OPERATING_SYSTEM_V1', 'AS6_WORKSPACE_EXPERIENCE_V1'],
  allowedLifecycle: ['register', 'resolve', 'compose', 'dispose'],
  conflictResolution: 'fail-fast',
  versionPolicy: 'contractVersion-required',
};

export function validateAS6ExtensionPolicy(extension) {
  if (!extension || !extension.contractVersion) throw new Error('AS6_EXTENSION_POLICY_VIOLATION');

  for (const baseline of extension.baselineCompatibility || []) {
    if (!as6ExtensionPolicy.compatibleBaselines.includes(baseline)) {
      throw new Error('AS6_EXTENSION_VERSION_INCOMPATIBILITY');
    }
  }

  for (const stage of extension.lifecycle || []) {
    if (!as6ExtensionPolicy.allowedLifecycle.includes(stage)) {
      throw new Error('AS6_EXTENSION_LIFECYCLE_CONFLICT');
    }
  }

  return true;
}
