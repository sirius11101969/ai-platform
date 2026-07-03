export const AS6_APPLICATION_SHELL_STAGE = 'AS6_EPIC011_SLICE03_APPLICATION_SHELL';

export function defineAS6ApplicationShell(shell) {
  if (!shell || !shell.id || !shell.label) throw new Error('AS6_APPLICATION_SHELL_CONTRACT_INVALID');
  return {
    order: 100,
    regions: [],
    slots: [],
    compositionMode: 'declarative',
    availability: 'always',
    ...shell,
  };
}

export function defineAS6ApplicationRegion(region) {
  if (!region || !region.id || !region.label) throw new Error('AS6_APPLICATION_REGION_CONTRACT_INVALID');
  return {
    order: 100,
    allowedContentTypes: ['application'],
    requiredCapabilities: [],
    slots: [],
    constraints: {},
    ...region,
  };
}

export function defineAS6ApplicationSlot(slot) {
  if (!slot || !slot.id || !slot.regionId) throw new Error('AS6_APPLICATION_SLOT_CONTRACT_VIOLATION');
  return {
    order: 100,
    contentType: 'application',
    requiredCapabilities: [],
    ...slot,
  };
}
