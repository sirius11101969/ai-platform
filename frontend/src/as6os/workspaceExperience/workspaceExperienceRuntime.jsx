import React, { createContext, useContext, useMemo } from 'react';
import { getAS6RuntimeHealthSnapshot, bootstrapAS6OperatingExperience } from '../experience/index.js';
import { getAS6PlatformService, traceAS6PlatformService } from '../services/index.js';

export const AS6_WORKSPACE_EXPERIENCE_STAGE = 'AS6_EPIC010_SLICE01_WORKSPACE_EXPERIENCE_FOUNDATION';

export const as6WorkspaceExperienceState = {
  status: 'idle',
  bootstrapped: false,
  activeWorkspaceId: 'as6.workspace.main',
  traces: [],
};

export function traceAS6WorkspaceExperience(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6WorkspaceExperienceState.traces.push(record);
  traceAS6PlatformService('workspace.' + event, payload);
  return record;
}

export function createAS6WorkspaceContext(overrides = {}) {
  return {
    stage: AS6_WORKSPACE_EXPERIENCE_STAGE,
    workspaceId: overrides.workspaceId || as6WorkspaceExperienceState.activeWorkspaceId,
    baseline: 'AS6_OPERATING_SYSTEM_V1',
    mode: 'foundation',
    assistantLabel: 'AS6 Assistant',
    primaryAction: 'Спросить AS6',
    nextBestAction: 'Продолжить настройку рабочего пространства AS6',
    constraints: {
      noBusinessLogic: true,
      noCrmFeatures: true,
      noPersistentStorageChanges: true,
      operatingSystemBaselineImmutable: true,
      executiveIntelligenceBaselineImmutable: true,
    },
    ...overrides,
  };
}

export function bootstrapAS6WorkspaceExperience(options = {}) {
  if (as6WorkspaceExperienceState.bootstrapped) {
    traceAS6WorkspaceExperience('bootstrap.idempotent', { status: as6WorkspaceExperienceState.status });
    return getAS6WorkspaceHealthSnapshot();
  }

  as6WorkspaceExperienceState.status = 'bootstrapping';
  traceAS6WorkspaceExperience('bootstrap.started', { workspaceId: options.workspaceId || as6WorkspaceExperienceState.activeWorkspaceId });
  bootstrapAS6OperatingExperience({ moduleId: 'workspace' });
  as6WorkspaceExperienceState.bootstrapped = true;
  as6WorkspaceExperienceState.status = 'running';
  traceAS6WorkspaceExperience('bootstrap.completed', { workspaceId: as6WorkspaceExperienceState.activeWorkspaceId });
  return getAS6WorkspaceHealthSnapshot();
}

export function shutdownAS6WorkspaceExperience() {
  if (!as6WorkspaceExperienceState.bootstrapped) {
    traceAS6WorkspaceExperience('shutdown.idempotent', { status: as6WorkspaceExperienceState.status });
    return getAS6WorkspaceHealthSnapshot();
  }
  traceAS6WorkspaceExperience('shutdown.started', { workspaceId: as6WorkspaceExperienceState.activeWorkspaceId });
  as6WorkspaceExperienceState.status = 'stopped';
  as6WorkspaceExperienceState.bootstrapped = false;
  traceAS6WorkspaceExperience('shutdown.completed', { workspaceId: as6WorkspaceExperienceState.activeWorkspaceId });
  return getAS6WorkspaceHealthSnapshot();
}

export function getAS6WorkspaceServiceBindings() {
  return {
    diagnostics: getAS6PlatformService('as6.diagnostics'),
    events: getAS6PlatformService('as6.events'),
    modules: getAS6PlatformService('as6.modules'),
  };
}

export function getAS6WorkspaceHealthSnapshot() {
  const bindings = getAS6WorkspaceServiceBindings();
  return {
    stage: AS6_WORKSPACE_EXPERIENCE_STAGE,
    workspace: {
      status: as6WorkspaceExperienceState.status,
      bootstrapped: as6WorkspaceExperienceState.bootstrapped,
      activeWorkspaceId: as6WorkspaceExperienceState.activeWorkspaceId,
      traceCount: as6WorkspaceExperienceState.traces.length,
    },
    operatingSystem: getAS6RuntimeHealthSnapshot(),
    serviceBindings: {
      diagnostics: Boolean(bindings.diagnostics),
      events: Boolean(bindings.events),
      modules: Boolean(bindings.modules),
    },
  };
}

export const AS6WorkspaceExperienceContext = createContext(createAS6WorkspaceContext());

export function AS6WorkspaceExperienceProvider({ children, value = {} }) {
  const contextValue = useMemo(() => createAS6WorkspaceContext(value), [value]);
  return <AS6WorkspaceExperienceContext.Provider value={contextValue}>{children}</AS6WorkspaceExperienceContext.Provider>;
}

export function useAS6WorkspaceExperience() {
  return useContext(AS6WorkspaceExperienceContext);
}
