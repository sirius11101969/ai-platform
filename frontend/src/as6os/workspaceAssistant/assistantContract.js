export const AS6_WORKSPACE_ASSISTANT_STAGE = 'AS6_EPIC010_SLICE06_WORKSPACE_ASSISTANT_SURFACE';

export function defineAS6AssistantSurface(surface) {
  if (!surface || !surface.id || !surface.label) throw new Error('AS6_ASSISTANT_SURFACE_INVALID');
  return { order: 100, availability: 'always', capabilities: [], mode: 'infrastructure', ...surface };
}

export function defineAS6AssistantCapability(capability) {
  if (!capability || !capability.id || !capability.owner) throw new Error('AS6_ASSISTANT_CAPABILITY_INVALID');
  return { availability: 'always', ...capability };
}
