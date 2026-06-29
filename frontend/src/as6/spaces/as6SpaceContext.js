export const AS6_SPACE_CONTEXT_VERSION = "P1.2";

export function createAS6SpaceContext(spaceId, values = {}) {
  return {
    spaceId,
    values,
    updatedAt: new Date().toISOString(),
    version: AS6_SPACE_CONTEXT_VERSION,
  };
}

export function mergeAS6SpaceContext(currentContext, patch = {}) {
  return {
    ...currentContext,
    values: {
      ...(currentContext?.values || {}),
      ...patch,
    },
    updatedAt: new Date().toISOString(),
  };
}
