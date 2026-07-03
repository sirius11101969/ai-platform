import { createAS6ApplicationComposition } from './applicationShellResolver.js';
import { createAS6ApplicationMountPlan } from './applicationMountManager.js';
import { traceAS6ApplicationShell } from './applicationShellTracer.js';
import { getAS6ApplicationShellHealthSnapshot } from './applicationShellHealthSnapshot.js';

export const as6ApplicationShellState = {
  status: 'idle',
  composition: null,
  mounts: [],
};

export function bootstrapAS6ApplicationShell() {
  const composition = createAS6ApplicationComposition();
  const mounts = createAS6ApplicationMountPlan(composition);

  as6ApplicationShellState.status = 'running';
  as6ApplicationShellState.composition = composition;
  as6ApplicationShellState.mounts = mounts;

  traceAS6ApplicationShell('applicationShell.bootstrapped', {
    regionCount: composition.regions.length,
    slotCount: composition.slots.length,
    mountCount: mounts.length,
  });

  return getAS6ApplicationShellHealthSnapshot(as6ApplicationShellState);
}

export function getAS6ApplicationShellModel() {
  return {
    status: as6ApplicationShellState.status,
    composition: as6ApplicationShellState.composition,
    mounts: as6ApplicationShellState.mounts,
    health: getAS6ApplicationShellHealthSnapshot(as6ApplicationShellState),
  };
}
