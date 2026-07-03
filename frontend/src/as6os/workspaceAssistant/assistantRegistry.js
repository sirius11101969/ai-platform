import { defineAS6AssistantSurface, defineAS6AssistantCapability } from './assistantContract.js';

export const as6AssistantSurfaces = [
  defineAS6AssistantSurface({ id: 'workspace.assistant.primary', label: 'AS6 Assistant', order: 10, capabilities: ['assistant.prompt', 'assistant.context.view'] }),
];

export const as6AssistantCapabilities = [
  defineAS6AssistantCapability({ id: 'assistant.prompt', owner: 'workspace.assistant' }),
  defineAS6AssistantCapability({ id: 'assistant.context.view', owner: 'workspace.assistant' }),
];

export const as6WorkspaceAssistantRegistry = {
  surfaces: new Map(as6AssistantSurfaces.map((surface) => [surface.id, surface])),
  capabilities: new Map(as6AssistantCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6AssistantSurface(surface) {
  const nextSurface = defineAS6AssistantSurface(surface);
  as6WorkspaceAssistantRegistry.surfaces.set(nextSurface.id, nextSurface);
  return nextSurface;
}

export function getAS6AssistantSurfaces() {
  return Array.from(as6WorkspaceAssistantRegistry.surfaces.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}
