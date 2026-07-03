export function createAS6ApplicationMountPlan(composition) {
  if (!composition || !composition.shell || !Array.isArray(composition.regions)) {
    throw new Error('AS6_APPLICATION_COMPOSITION_DRIFT');
  }

  const seenSlots = new Set();
  const mounts = [];

  for (const region of composition.regions) {
    for (const slot of region.slots) {
      if (seenSlots.has(slot.id)) throw new Error('AS6_APPLICATION_MOUNT_CONFLICT');
      seenSlots.add(slot.id);
      mounts.push({
        slotId: slot.id,
        regionId: region.id,
        contentType: slot.contentType,
        status: 'ready',
      });
    }
  }

  return mounts;
}
