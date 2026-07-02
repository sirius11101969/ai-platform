export const AS6_WORKSPACE_LAYOUT_STAGE = 'AS6_EPIC010_SLICE02_WORKSPACE_LAYOUT';

export const AS6_WORKSPACE_REGION_IDS = {
  header: 'header',
  sidebar: 'sidebar',
  main: 'main',
  rightRail: 'rightRail',
  footer: 'footer',
};

export function defineAS6WorkspaceRegion(region) {
  if (!region || !region.id || !region.label) {
    throw new Error('AS6_LAYOUT_REGION_INVALID');
  }

  return {
    order: 100,
    slots: [],
    constraints: [],
    availability: 'always',
    ...region,
  };
}

export function defineAS6WorkspaceSlot(slot) {
  if (!slot || !slot.id || !slot.regionId) {
    throw new Error('AS6_LAYOUT_SLOT_INVALID');
  }

  return {
    order: 100,
    constraints: [],
    availability: 'always',
    ...slot,
  };
}
