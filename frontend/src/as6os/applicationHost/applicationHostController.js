import { loadAS6ApplicationHost } from './applicationHostLoader.js';
import { traceAS6ApplicationHost } from './applicationHostTracer.js';
import { getAS6ApplicationHostHealthSnapshot } from './applicationHostHealthSnapshot.js';

export const as6ApplicationHostState = {
  status: 'idle',
  manifest: null,
};

export function activateAS6ApplicationHost() {
  const loaded = loadAS6ApplicationHost();
  as6ApplicationHostState.status = 'active';
  as6ApplicationHostState.manifest = loaded.manifest;
  traceAS6ApplicationHost('applicationHost.activated', {
    applicationCount: loaded.manifest.applications.length,
  });
  return getAS6ApplicationHostHealthSnapshot(as6ApplicationHostState);
}

export function getAS6ApplicationHostModel() {
  return {
    status: as6ApplicationHostState.status,
    manifest: as6ApplicationHostState.manifest,
    health: getAS6ApplicationHostHealthSnapshot(as6ApplicationHostState),
  };
}
