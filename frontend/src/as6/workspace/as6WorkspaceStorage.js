const STORAGE_KEY = "as6-workspace-persistence:v99";
const CURRENT_VERSION = "V99";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix = "workspace") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createAS6WorkspaceSession(input = {}) {
  const timestamp = nowIso();

  return {
    id: input.id || createId(),
    title: input.title || "AS6 Workspace",
    activeLivingSpace: input.activeLivingSpace || "/as6-one",
    openedPanels: Array.isArray(input.openedPanels) ? input.openedPanels : [],
    filters: input.filters && typeof input.filters === "object" ? input.filters : {},
    commandHistory: Array.isArray(input.commandHistory) ? input.commandHistory : [],
    contextState: input.contextState && typeof input.contextState === "object" ? input.contextState : {},
    intelligenceState: input.intelligenceState && typeof input.intelligenceState === "object" ? input.intelligenceState : {},
    pinned: Boolean(input.pinned),
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp,
    version: CURRENT_VERSION,
  };
}

export function createAS6WorkspaceStore(input = {}) {
  return {
    version: CURRENT_VERSION,
    activeWorkspaceId: input.activeWorkspaceId || null,
    workspaces: Array.isArray(input.workspaces) ? input.workspaces : [],
    updatedAt: input.updatedAt || nowIso(),
  };
}

export function readAS6WorkspaceStore() {
  if (!canUseStorage()) {
    return createAS6WorkspaceStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? migrateAS6WorkspaceStore(JSON.parse(raw)) : createAS6WorkspaceStore();
  } catch {
    return createAS6WorkspaceStore();
  }
}

export function writeAS6WorkspaceStore(store) {
  const normalized = migrateAS6WorkspaceStore({
    ...store,
    updatedAt: nowIso(),
  });

  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function migrateAS6WorkspaceStore(store) {
  const base = createAS6WorkspaceStore(store && typeof store === "object" ? store : {});

  const workspaces = base.workspaces.map((workspace) =>
    createAS6WorkspaceSession({
      ...workspace,
      version: CURRENT_VERSION,
      createdAt: workspace.createdAt,
    }),
  );

  return {
    ...base,
    version: CURRENT_VERSION,
    workspaces,
    activeWorkspaceId:
      base.activeWorkspaceId && workspaces.some((workspace) => workspace.id === base.activeWorkspaceId)
        ? base.activeWorkspaceId
        : workspaces[0]?.id || null,
  };
}

export function saveAS6WorkspaceSession(session) {
  const store = readAS6WorkspaceStore();
  const normalizedSession = createAS6WorkspaceSession(session);
  const existingIndex = store.workspaces.findIndex((workspace) => workspace.id === normalizedSession.id);

  const workspaces =
    existingIndex >= 0
      ? store.workspaces.map((workspace, index) => (index === existingIndex ? normalizedSession : workspace))
      : [normalizedSession, ...store.workspaces];

  return writeAS6WorkspaceStore({
    ...store,
    activeWorkspaceId: normalizedSession.id,
    workspaces,
  });
}

export function getAS6WorkspaceSessions() {
  return readAS6WorkspaceStore().workspaces;
}

export function getAS6ActiveWorkspaceSession() {
  const store = readAS6WorkspaceStore();
  return store.workspaces.find((workspace) => workspace.id === store.activeWorkspaceId) || null;
}

export function setAS6ActiveWorkspaceSession(workspaceId) {
  const store = readAS6WorkspaceStore();

  if (!store.workspaces.some((workspace) => workspace.id === workspaceId)) {
    return store;
  }

  return writeAS6WorkspaceStore({
    ...store,
    activeWorkspaceId: workspaceId,
  });
}

export function renameAS6WorkspaceSession(workspaceId, title) {
  const store = readAS6WorkspaceStore();

  return writeAS6WorkspaceStore({
    ...store,
    workspaces: store.workspaces.map((workspace) =>
      workspace.id === workspaceId
        ? createAS6WorkspaceSession({ ...workspace, title: title || workspace.title })
        : workspace,
    ),
  });
}

export function cloneAS6WorkspaceSession(workspaceId) {
  const store = readAS6WorkspaceStore();
  const source = store.workspaces.find((workspace) => workspace.id === workspaceId);

  if (!source) {
    return store;
  }

  const clone = createAS6WorkspaceSession({
    ...source,
    id: createId("workspace-copy"),
    title: `${source.title} Copy`,
    createdAt: nowIso(),
  });

  return writeAS6WorkspaceStore({
    ...store,
    activeWorkspaceId: clone.id,
    workspaces: [clone, ...store.workspaces],
  });
}

export function deleteAS6WorkspaceSession(workspaceId) {
  const store = readAS6WorkspaceStore();
  const workspaces = store.workspaces.filter((workspace) => workspace.id !== workspaceId);

  return writeAS6WorkspaceStore({
    ...store,
    activeWorkspaceId: store.activeWorkspaceId === workspaceId ? workspaces[0]?.id || null : store.activeWorkspaceId,
    workspaces,
  });
}

export function toggleAS6WorkspaceSessionPin(workspaceId) {
  const store = readAS6WorkspaceStore();

  return writeAS6WorkspaceStore({
    ...store,
    workspaces: store.workspaces.map((workspace) =>
      workspace.id === workspaceId
        ? createAS6WorkspaceSession({ ...workspace, pinned: !workspace.pinned })
        : workspace,
    ),
  });
}

export function exportAS6WorkspaceStore() {
  return JSON.stringify(readAS6WorkspaceStore(), null, 2);
}

export function importAS6WorkspaceStore(jsonText) {
  const parsed = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
  return writeAS6WorkspaceStore(migrateAS6WorkspaceStore(parsed));
}

export function validateAS6WorkspacePersistencePolicy() {
  const store = readAS6WorkspaceStore();
  const failures = [];

  if (store.version !== CURRENT_VERSION) failures.push("version_mismatch");
  if (!Array.isArray(store.workspaces)) failures.push("workspaces_not_array");

  for (const workspace of store.workspaces) {
    if (!workspace.id) failures.push("workspace_missing_id");
    if (!workspace.title) failures.push(`${workspace.id || "unknown"}_missing_title`);
    if (!workspace.activeLivingSpace) failures.push(`${workspace.id || "unknown"}_missing_active_living_space`);
    if (!workspace.createdAt) failures.push(`${workspace.id || "unknown"}_missing_created_at`);
    if (!workspace.updatedAt) failures.push(`${workspace.id || "unknown"}_missing_updated_at`);
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}
