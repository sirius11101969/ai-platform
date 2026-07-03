import { getAS6CommandPaletteModel } from '../commandPalette/index.js';
import { getAS6WorkspaceHealthSnapshot } from '../workspaceExperience/index.js';
import { getAS6AssistantSurfaces } from './assistantRegistry.js';

export const as6WorkspaceAssistantState = {
  status: 'idle',
  activeSurfaceId: 'workspace.assistant.primary',
  traces: [],
};

export function traceAS6WorkspaceAssistant(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6WorkspaceAssistantState.traces.push(record);
  return record;
}

export function getAS6AssistantContextBridge() {
  return {
    workspace: getAS6WorkspaceHealthSnapshot(),
    commandPalette: getAS6CommandPaletteModel(),
  };
}

export function activateAS6AssistantSurface(surfaceId = 'workspace.assistant.primary') {
  const surface = getAS6AssistantSurfaces().find((item) => item.id === surfaceId);
  if (!surface) throw new Error('AS6_ASSISTANT_SURFACE_RESOLUTION_FAILURE');
  as6WorkspaceAssistantState.activeSurfaceId = surfaceId;
  as6WorkspaceAssistantState.status = 'active';
  traceAS6WorkspaceAssistant('surface.activated', { surfaceId });
  return surface;
}

export function getAS6WorkspaceAssistantModel() {
  return {
    status: as6WorkspaceAssistantState.status,
    activeSurfaceId: as6WorkspaceAssistantState.activeSurfaceId,
    surfaces: getAS6AssistantSurfaces(),
    contextBridge: getAS6AssistantContextBridge(),
  };
}

export function getAS6WorkspaceAssistantHealthSnapshot() {
  const model = getAS6WorkspaceAssistantModel();
  return {
    stage: 'AS6_EPIC010_SLICE06_WORKSPACE_ASSISTANT_SURFACE',
    assistant: {
      status: as6WorkspaceAssistantState.status,
      activeSurfaceId: as6WorkspaceAssistantState.activeSurfaceId,
      surfaceCount: model.surfaces.length,
      traceCount: as6WorkspaceAssistantState.traces.length,
      contextBridge: Boolean(model.contextBridge),
    },
  };
}
