import { as6RuntimeContext } from '../index.js';
import { getAS6NavigationItems } from '../navigation/index.js';
import { activateAS6HostedModule, getAS6HostedModules } from '../modules/index.js';
import {
  initializeAS6PlatformService,
  traceAS6PlatformService,
  as6PlatformServicesState,
} from '../services/index.js';

export const AS6_OPERATING_EXPERIENCE_STAGE = 'AS6_EPIC009_SLICE06_OPERATING_EXPERIENCE';

export const as6OperatingSession = {
  id: 'as6.operating.session',
  status: 'idle',
  bootstrapped: false,
  activeModuleId: 'workspace',
  traces: [],
};

export function traceAS6OperatingExperience(event, payload = {}) {
  const record = {
    event,
    payload,
    ts: new Date().toISOString(),
  };
  as6OperatingSession.traces.push(record);
  traceAS6PlatformService(`operating.${event}`, payload);
  return record;
}

export function bootstrapAS6OperatingExperience(options = {}) {
  if (as6OperatingSession.bootstrapped) {
    traceAS6OperatingExperience('bootstrap.idempotent', { status: as6OperatingSession.status });
    return getAS6RuntimeHealthSnapshot();
  }

  const moduleId = options.moduleId || 'workspace';

  as6OperatingSession.status = 'bootstrapping';
  traceAS6OperatingExperience('bootstrap.started', { moduleId });

  initializeAS6PlatformService('as6.diagnostics');
  initializeAS6PlatformService('as6.events');
  initializeAS6PlatformService('as6.modules');

  activateAS6HostedModule(moduleId);

  as6OperatingSession.activeModuleId = moduleId;
  as6OperatingSession.status = 'running';
  as6OperatingSession.bootstrapped = true;

  traceAS6OperatingExperience('bootstrap.completed', { moduleId });

  return getAS6RuntimeHealthSnapshot();
}

export function shutdownAS6OperatingExperience() {
  if (!as6OperatingSession.bootstrapped) {
    traceAS6OperatingExperience('shutdown.idempotent', { status: as6OperatingSession.status });
    return getAS6RuntimeHealthSnapshot();
  }

  traceAS6OperatingExperience('shutdown.started', { activeModuleId: as6OperatingSession.activeModuleId });

  as6OperatingSession.status = 'stopped';
  as6OperatingSession.bootstrapped = false;

  traceAS6OperatingExperience('shutdown.completed', { activeModuleId: as6OperatingSession.activeModuleId });

  return getAS6RuntimeHealthSnapshot();
}

export function getAS6RuntimeHealthSnapshot() {
  return {
    stage: AS6_OPERATING_EXPERIENCE_STAGE,
    runtime: as6RuntimeContext,
    session: {
      id: as6OperatingSession.id,
      status: as6OperatingSession.status,
      bootstrapped: as6OperatingSession.bootstrapped,
      activeModuleId: as6OperatingSession.activeModuleId,
      traceCount: as6OperatingSession.traces.length,
    },
    navigation: {
      items: getAS6NavigationItems().length,
    },
    modules: {
      items: getAS6HostedModules().length,
    },
    services: {
      initialized: as6PlatformServicesState.initialized.size,
      disposed: as6PlatformServicesState.disposed.size,
      traceCount: as6PlatformServicesState.events.length,
    },
  };
}
