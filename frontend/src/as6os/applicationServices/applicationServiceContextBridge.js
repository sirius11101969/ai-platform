export function createAS6ServiceContextBridge(context = {}) {
  return {
    baseline: 'AS6_WORKSPACE_EXPERIENCE_V1',
    operatingSystemBaseline: 'AS6_OPERATING_SYSTEM_V1',
    workspaceBaseline: 'AS6_WORKSPACE_EXPERIENCE_V1',
    applicationLayer: 'AS6_EPIC011_APPLICATION_FOUNDATION',
    serviceLayer: 'AS6_EPIC011_SLICE06_APPLICATION_SERVICES',
    ...context,
  };
}
