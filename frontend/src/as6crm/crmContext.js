import { getAS6CrmDescriptor } from './crmDescriptor.js';

export function createAS6CrmContext(context = {}) {
  return {
    descriptor: getAS6CrmDescriptor(),
    platformMutation: false,
    operatingSystemBaseline: 'AS6_OPERATING_SYSTEM_V1',
    workspaceBaseline: 'AS6_WORKSPACE_EXPERIENCE_V1',
    applicationFoundationBaseline: 'AS6_APPLICATION_FOUNDATION_V1',
    ...context,
  };
}
