import { createAS6ExtensionRuntime } from './applicationExtensionRuntime.js';
import { traceAS6Extension } from './applicationExtensionTracer.js';
import { getAS6ExtensionHealthSnapshot } from './applicationExtensionHealthSnapshot.js';

export const as6ExtensionRuntimeState = {
  status: 'idle',
  runtime: null,
};

export function bootstrapAS6ExtensionPoints() {
  const runtime = createAS6ExtensionRuntime();
  as6ExtensionRuntimeState.status = 'running';
  as6ExtensionRuntimeState.runtime = runtime;

  traceAS6Extension('extensionPoints.bootstrapped', {
    pointCount: runtime.composition.points.length,
    extensionCount: runtime.composition.extensions.length,
  });

  return getAS6ExtensionHealthSnapshot(runtime);
}

export function getAS6ExtensionPointsModel() {
  const runtime = as6ExtensionRuntimeState.runtime;
  return {
    status: as6ExtensionRuntimeState.status,
    runtime,
    health: getAS6ExtensionHealthSnapshot(runtime || {}),
  };
}
