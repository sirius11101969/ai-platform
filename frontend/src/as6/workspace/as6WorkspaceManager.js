import {
  getAS6ActiveLivingSpace,
  getAS6LivingSpaceEngineState,
} from "../living-spaces/as6LivingSpaceEngine";

const STORAGE_KEY = "as6-workspace-manager:v98";
const MAX_RECENT = 8;
const MAX_HISTORY = 20;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readState() {
  if (!canUseStorage()) {
    return createEmptyWorkspaceState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...createEmptyWorkspaceState(), ...JSON.parse(raw) } : createEmptyWorkspaceState();
  } catch {
    return createEmptyWorkspaceState();
  }
}

function writeState(state) {
  if (!canUseStorage()) {
    return state;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function uniqueByRoute(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item || !item.route || seen.has(item.route)) {
      return false;
    }

    seen.add(item.route);
    return true;
  });
}

export function createEmptyWorkspaceState() {
  return {
    activeRoute: null,
    recentRoutes: [],
    pinnedRoutes: [],
    history: [],
    version: "V98",
  };
}

export function getAS6WorkspaceState() {
  return readState();
}

export function setAS6ActiveWorkspace(pathname) {
  const activeSpace = getAS6ActiveLivingSpace(pathname);
  const state = readState();

  if (!activeSpace) {
    return writeState({
      ...state,
      activeRoute: pathname || state.activeRoute,
    });
  }

  const recentRoutes = uniqueByRoute([
    activeSpace,
    ...state.recentRoutes
      .map((route) => getAS6ActiveLivingSpace(route))
      .filter(Boolean),
  ])
    .slice(0, MAX_RECENT)
    .map((space) => space.route);

  const history = [
    {
      route: activeSpace.route,
      id: activeSpace.id,
      name: activeSpace.name,
      timestamp: new Date().toISOString(),
    },
    ...Array.isArray(state.history) ? state.history : [],
  ].slice(0, MAX_HISTORY);

  return writeState({
    ...state,
    activeRoute: activeSpace.route,
    recentRoutes,
    history,
  });
}

export function getAS6ActiveWorkspace() {
  const state = readState();
  return state.activeRoute ? getAS6ActiveLivingSpace(state.activeRoute) : null;
}

export function getAS6RecentWorkspaces() {
  const state = readState();

  return state.recentRoutes
    .map((route) => getAS6ActiveLivingSpace(route))
    .filter(Boolean);
}

export function getAS6PinnedWorkspaces() {
  const state = readState();

  return state.pinnedRoutes
    .map((route) => getAS6ActiveLivingSpace(route))
    .filter(Boolean);
}

export function toggleAS6PinnedWorkspace(route) {
  const state = readState();
  const pinnedRoutes = new Set(Array.isArray(state.pinnedRoutes) ? state.pinnedRoutes : []);

  if (pinnedRoutes.has(route)) {
    pinnedRoutes.delete(route);
  } else if (getAS6ActiveLivingSpace(route)) {
    pinnedRoutes.add(route);
  }

  return writeState({
    ...state,
    pinnedRoutes: Array.from(pinnedRoutes),
  });
}

export function getAS6WorkspaceHistory() {
  const state = readState();
  return Array.isArray(state.history) ? state.history : [];
}

export function restoreAS6Workspace() {
  const state = readState();
  const active = state.activeRoute ? getAS6ActiveLivingSpace(state.activeRoute) : null;

  if (active) {
    return active;
  }

  const firstActiveSpace = getAS6LivingSpaceEngineState().spaces[0] || null;
  return firstActiveSpace;
}

export function validateAS6WorkspaceManagerPolicy() {
  const state = readState();
  const failures = [];

  if (!state.version) failures.push("missing_version");
  if (!Array.isArray(state.recentRoutes)) failures.push("recent_routes_not_array");
  if (!Array.isArray(state.pinnedRoutes)) failures.push("pinned_routes_not_array");
  if (!Array.isArray(state.history)) failures.push("history_not_array");

  return {
    ok: failures.length === 0,
    failures,
  };
}
