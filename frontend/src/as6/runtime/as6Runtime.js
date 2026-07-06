import {
  getAS6LivingSpaceEngineState,
  getAS6ActiveLivingSpace,
} from "../living-spaces/as6LivingSpaceEngine";

import {
  getAS6WorkspaceState,
  setAS6ActiveWorkspace,
  restoreAS6Workspace,
} from "../workspace/as6WorkspaceManager";

import {
  getAS6ActiveWorkspaceSession,
  getAS6WorkspaceSessions,
  saveAS6WorkspaceSession,
  exportAS6WorkspaceStore,
  importAS6WorkspaceStore,
} from "../workspace/as6WorkspaceStorage";

const AS6_RUNTIME_VERSION = "V100";
const subscribers = new Set();

let runtimeState = {
  version: AS6_RUNTIME_VERSION,
  selectedRoute: null,
  selectedLivingSpace: null,
  selectedWorkspace: null,
  context: {},
  selection: null,
  lastEvent: null,
};

function emitRuntimeChange() {
  const snapshot = getAS6RuntimeSnapshot();

  subscribers.forEach((listener) => {
    try {
      listener(snapshot);
    } catch {
      // Runtime subscribers must not break AS6Shell.
    }
  });

  return snapshot;
}

export function getAS6RuntimeState() {
  const livingSpaceState = getAS6LivingSpaceEngineState();
  const workspaceState = getAS6WorkspaceState();
  const activeWorkspaceSession = getAS6ActiveWorkspaceSession();

  return {
    ...runtimeState,
    livingSpaces: livingSpaceState.spaces,
    workspaceState,
    workspaceSessions: getAS6WorkspaceSessions(),
    activeWorkspaceSession,
  };
}

export function dispatchAS6Runtime(action) {
  const safeAction = action && typeof action === "object" ? action : { type: "AS6_RUNTIME_NOOP" };

  switch (safeAction.type) {
    case "AS6_RUNTIME_SET_LIVING_SPACE": {
      const route = safeAction.route || safeAction.pathname || "/";
      const livingSpace = getAS6ActiveLivingSpace(route);

      if (livingSpace) {
        setAS6ActiveWorkspace(route);
      }

      runtimeState = {
        ...runtimeState,
        selectedRoute: route,
        selectedLivingSpace: livingSpace,
        lastEvent: safeAction.type,
      };

      return emitRuntimeChange();
    }

    case "AS6_RUNTIME_SET_WORKSPACE": {
      runtimeState = {
        ...runtimeState,
        selectedWorkspace: safeAction.workspace || null,
        lastEvent: safeAction.type,
      };

      if (safeAction.workspace) {
        saveAS6WorkspaceSession(safeAction.workspace);
      }

      return emitRuntimeChange();
    }

    case "AS6_RUNTIME_SET_CONTEXT": {
      runtimeState = {
        ...runtimeState,
        context: {
          ...runtimeState.context,
          ...(safeAction.context || {}),
        },
        lastEvent: safeAction.type,
      };

      return emitRuntimeChange();
    }

    case "AS6_RUNTIME_SET_SELECTION": {
      runtimeState = {
        ...runtimeState,
        selection: safeAction.selection || null,
        lastEvent: safeAction.type,
      };

      return emitRuntimeChange();
    }

    case "AS6_RUNTIME_RESTORE": {
      const restoredLivingSpace = restoreAS6Workspace();

      runtimeState = {
        ...runtimeState,
        selectedRoute: restoredLivingSpace?.route || runtimeState.selectedRoute,
        selectedLivingSpace: restoredLivingSpace || runtimeState.selectedLivingSpace,
        selectedWorkspace: getAS6ActiveWorkspaceSession(),
        lastEvent: safeAction.type,
      };

      return emitRuntimeChange();
    }

    default: {
      runtimeState = {
        ...runtimeState,
        lastEvent: safeAction.type || "AS6_RUNTIME_UNKNOWN",
      };

      return emitRuntimeChange();
    }
  }
}

export function setAS6RuntimeLivingSpace(pathname) {
  return dispatchAS6Runtime({
    type: "AS6_RUNTIME_SET_LIVING_SPACE",
    route: pathname,
  });
}

export function setAS6RuntimeWorkspace(workspace) {
  return dispatchAS6Runtime({
    type: "AS6_RUNTIME_SET_WORKSPACE",
    workspace,
  });
}

export function setAS6RuntimeContext(context) {
  return dispatchAS6Runtime({
    type: "AS6_RUNTIME_SET_CONTEXT",
    context,
  });
}

export function setAS6RuntimeSelection(selection) {
  return dispatchAS6Runtime({
    type: "AS6_RUNTIME_SET_SELECTION",
    selection,
  });
}

export function restoreAS6Runtime() {
  return dispatchAS6Runtime({
    type: "AS6_RUNTIME_RESTORE",
  });
}

export function subscribeAS6Runtime(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  subscribers.add(listener);
  listener(getAS6RuntimeSnapshot());

  return () => {
    subscribers.delete(listener);
  };
}

export function getAS6RuntimeSnapshot() {
  return {
    ...getAS6RuntimeState(),
    subscriberCount: subscribers.size,
    timestamp: new Date().toISOString(),
  };
}

export function exportAS6RuntimeSnapshot() {
  return JSON.stringify(
    {
      runtime: getAS6RuntimeSnapshot(),
      workspaceStore: JSON.parse(exportAS6WorkspaceStore()),
    },
    null,
    2,
  );
}

export function importAS6RuntimeSnapshot(jsonText) {
  const parsed = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;

  if (parsed?.workspaceStore) {
    importAS6WorkspaceStore(parsed.workspaceStore);
  }

  if (parsed?.runtime) {
    runtimeState = {
      ...runtimeState,
      selectedRoute: parsed.runtime.selectedRoute || null,
      selectedLivingSpace: parsed.runtime.selectedLivingSpace || null,
      selectedWorkspace: parsed.runtime.selectedWorkspace || null,
      context: parsed.runtime.context || {},
      selection: parsed.runtime.selection || null,
      lastEvent: "AS6_RUNTIME_IMPORT",
    };
  }

  return emitRuntimeChange();
}

export function validateAS6RuntimePolicy() {
  const snapshot = getAS6RuntimeSnapshot();
  const failures = [];

  if (snapshot.version !== AS6_RUNTIME_VERSION) failures.push("version_mismatch");
  if (!Array.isArray(snapshot.livingSpaces)) failures.push("living_spaces_not_array");
  if (!Array.isArray(snapshot.workspaceSessions)) failures.push("workspace_sessions_not_array");
  if (typeof dispatchAS6Runtime !== "function") failures.push("dispatch_missing");
  if (typeof subscribeAS6Runtime !== "function") failures.push("subscribe_missing");

  return {
    ok: failures.length === 0,
    failures,
  };
}
