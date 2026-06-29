import { validateAS6SpaceManifest } from "./as6SpaceManifest.schema";

export const AS6_SPACE_REGISTRY_VERSION = "P1.2";

export const as6SpaceRegistry = [];

export function registerAS6SpaceManifest(manifest) {
  const validation = validateAS6SpaceManifest(manifest);

  if (!validation.ok) {
    return {
      ok: false,
      validation,
      manifest,
    };
  }

  if (!as6SpaceRegistry.some((space) => space.id === manifest.id)) {
    as6SpaceRegistry.push(manifest);
  }

  return {
    ok: true,
    validation,
    manifest,
  };
}

export function getAS6Spaces() {
  return as6SpaceRegistry;
}

export function getAS6SpaceById(spaceId) {
  return as6SpaceRegistry.find((space) => space.id === spaceId) || null;
}
