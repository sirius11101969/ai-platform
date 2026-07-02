import { traceAS6WorkspaceExperience } from '../workspaceExperience/index.js';
import { getAS6WorkspaceRegions, getAS6WorkspaceSlots } from './workspaceLayoutRegistry.js';

export const as6WorkspaceLayoutState = {
  activeLayoutId: 'as6.workspace.layout.default',
  responsiveMode: 'desktop',
  activeRegions: new Set(['header', 'sidebar', 'main', 'rightRail']),
  traces: [],
};

export function traceAS6WorkspaceLayout(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6WorkspaceLayoutState.traces.push(record);
  traceAS6WorkspaceExperience('layout.' + event, payload);
  return record;
}

export function resolveAS6WorkspaceLayout(width = 1440) {
  const responsiveMode = width < 720 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop';
  as6WorkspaceLayoutState.responsiveMode = responsiveMode;

  if (responsiveMode === 'mobile') {
    as6WorkspaceLayoutState.activeRegions = new Set(['header', 'main']);
  } else if (responsiveMode === 'tablet') {
    as6WorkspaceLayoutState.activeRegions = new Set(['header', 'sidebar', 'main']);
  } else {
    as6WorkspaceLayoutState.activeRegions = new Set(['header', 'sidebar', 'main', 'rightRail']);
  }

  traceAS6WorkspaceLayout('resolved', { responsiveMode, width });
  return getAS6WorkspaceLayoutHealthSnapshot();
}

export function getAS6WorkspaceLayoutModel() {
  return {
    layoutId: as6WorkspaceLayoutState.activeLayoutId,
    responsiveMode: as6WorkspaceLayoutState.responsiveMode,
    regions: getAS6WorkspaceRegions().map((region) => ({
      ...region,
      active: as6WorkspaceLayoutState.activeRegions.has(region.id),
      slots: getAS6WorkspaceSlots(region.id),
    })),
  };
}

export function getAS6WorkspaceLayoutHealthSnapshot() {
  const model = getAS6WorkspaceLayoutModel();
  return {
    stage: 'AS6_EPIC010_SLICE02_WORKSPACE_LAYOUT',
    layout: {
      activeLayoutId: as6WorkspaceLayoutState.activeLayoutId,
      responsiveMode: as6WorkspaceLayoutState.responsiveMode,
      regionCount: model.regions.length,
      activeRegionCount: model.regions.filter((region) => region.active).length,
      slotCount: model.regions.reduce((count, region) => count + region.slots.length, 0),
      traceCount: as6WorkspaceLayoutState.traces.length,
    },
  };
}
