import { getAS6ApplicationRegions, getAS6ApplicationSlots, getAS6ApplicationShells } from './applicationShellRegistry.js';

export function resolveAS6ApplicationRegions() {
  const regions = getAS6ApplicationRegions().map((region) => ({
    ...region,
    slots: getAS6ApplicationSlots(region.id),
  }));

  for (const region of regions) {
    for (const slot of region.slots) {
      if (slot.regionId !== region.id) throw new Error('AS6_APPLICATION_REGION_RESOLUTION_FAILURE');
    }
  }

  return regions;
}

export function createAS6ApplicationComposition() {
  const shells = getAS6ApplicationShells();
  const regions = resolveAS6ApplicationRegions();

  return {
    stage: 'AS6_EPIC011_SLICE03_APPLICATION_SHELL',
    shell: shells[0],
    regions,
    slots: regions.flatMap((region) => region.slots),
  };
}
