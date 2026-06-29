import { validateAS6SpaceManifest } from "./as6SpaceManifest.schema";
import { emitAS6Event } from "../runtime/as6EventBus";

export const AS6_SPACE_RUNTIME_VERSION = "P1.2";

export function createAS6SpaceRuntimeState(manifest) {
  return {
    id: manifest.id,
    status: "registered",
    manifest,
    validation: validateAS6SpaceManifest(manifest),
    version: AS6_SPACE_RUNTIME_VERSION,
  };
}

export function registerAS6Space(manifest) {
  const state = createAS6SpaceRuntimeState(manifest);

  emitAS6Event("AS6_SPACE_REGISTERED", {
    spaceId: manifest.id,
    status: state.status,
  });

  return state;
}

export function activateAS6Space(state, context = {}) {
  const nextState = {
    ...state,
    status: "active",
    context,
  };

  emitAS6Event("AS6_SPACE_ACTIVATED", {
    spaceId: state.id,
    context,
  });

  return nextState;
}

export function deactivateAS6Space(state) {
  const nextState = {
    ...state,
    status: "inactive",
  };

  emitAS6Event("AS6_SPACE_DEACTIVATED", {
    spaceId: state.id,
  });

  return nextState;
}
