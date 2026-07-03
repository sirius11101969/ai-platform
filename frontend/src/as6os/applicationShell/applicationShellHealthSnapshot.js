import { getAS6ApplicationShellTrace } from './applicationShellTracer.js';

export function getAS6ApplicationShellHealthSnapshot(state = {}) {
  return {
    stage: 'AS6_EPIC011_SLICE03_APPLICATION_SHELL',
    applicationShell: {
      status: state.status || 'idle',
      regionCount: state.composition?.regions?.length || 0,
      slotCount: state.composition?.slots?.length || 0,
      mountCount: state.mounts?.length || 0,
      traceCount: getAS6ApplicationShellTrace().length,
    },
  };
}
