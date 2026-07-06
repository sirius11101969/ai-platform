export const AS6_BUSINESS_WORKSPACE_VERSION = "B1";

const workspaceState = {
  activeWorkspaceId: "default",
  activeModuleId: "dashboard",
  openedTabs: [],
  navigationHistory: [],
  favorites: [],
  recentItems: [],
  notifications: [],
  commands: new Map(),
  modules: new Map(),
  context: {
    user: null,
    organization: null,
    client: null,
    deal: null,
    document: null,
    project: null,
  },
};

function now() {
  return new Date().toISOString();
}

export function getAS6BusinessWorkspaceState() {
  return {
    version: AS6_BUSINESS_WORKSPACE_VERSION,
    activeWorkspaceId: workspaceState.activeWorkspaceId,
    activeModuleId: workspaceState.activeModuleId,
    openedTabs: [...workspaceState.openedTabs],
    navigationHistory: [...workspaceState.navigationHistory],
    favorites: [...workspaceState.favorites],
    recentItems: [...workspaceState.recentItems],
    notifications: [...workspaceState.notifications],
    commands: [...workspaceState.commands.values()],
    modules: [...workspaceState.modules.values()],
    context: { ...workspaceState.context },
  };
}

export function setAS6BusinessWorkspaceContext(context = {}) {
  workspaceState.context = {
    ...workspaceState.context,
    ...context,
  };
  return getAS6BusinessWorkspaceState();
}

export function registerAS6BusinessModule(module = {}) {
  if (!module.id) return { ok: false, error: "AS6_BUSINESS_MODULE_ID_MISSING" };
  workspaceState.modules.set(module.id, {
    status: "registered",
    registeredAt: now(),
    ...module,
  });
  return { ok: true, moduleId: module.id };
}

export function openAS6BusinessModule(moduleId, params = {}) {
  if (!moduleId) return { ok: false, error: "AS6_BUSINESS_MODULE_ID_MISSING" };
  workspaceState.activeModuleId = moduleId;
  workspaceState.navigationHistory.unshift({ type: "module", moduleId, params, openedAt: now() });
  workspaceState.recentItems.unshift({ type: "module", id: moduleId, title: params.title || moduleId, openedAt: now() });
  return { ok: true, moduleId, state: getAS6BusinessWorkspaceState() };
}

export function openAS6BusinessRecord(record = {}) {
  if (!record.id) return { ok: false, error: "AS6_BUSINESS_RECORD_ID_MISSING" };
  const tab = {
    id: record.id,
    type: record.type || "record",
    title: record.title || record.id,
    moduleId: record.moduleId || workspaceState.activeModuleId,
    openedAt: now(),
    ...record,
  };
  workspaceState.openedTabs = [tab, ...workspaceState.openedTabs.filter((item) => item.id !== tab.id)].slice(0, 20);
  workspaceState.recentItems = [tab, ...workspaceState.recentItems.filter((item) => item.id !== tab.id)].slice(0, 30);
  return { ok: true, tab, state: getAS6BusinessWorkspaceState() };
}

export function registerAS6BusinessCommand(command = {}) {
  if (!command.id) return { ok: false, error: "AS6_BUSINESS_COMMAND_ID_MISSING" };
  workspaceState.commands.set(command.id, {
    status: "registered",
    registeredAt: now(),
    ...command,
  });
  return { ok: true, commandId: command.id };
}

export function runAS6BusinessCommand(commandId, payload = {}) {
  const command = workspaceState.commands.get(commandId);
  if (!command) return { ok: false, error: "AS6_BUSINESS_COMMAND_NOT_FOUND", commandId };
  const result = typeof command.handler === "function" ? command.handler(payload) : { ok: true, skipped: true };
  workspaceState.navigationHistory.unshift({ type: "command", commandId, payload, result, ranAt: now() });
  return { ok: true, commandId, result };
}

export function notifyAS6BusinessWorkspace(notification = {}) {
  const item = {
    id: notification.id || "notification-" + Date.now(),
    level: notification.level || "info",
    title: notification.title || "AS6 notification",
    message: notification.message || "",
    createdAt: now(),
    ...notification,
  };
  workspaceState.notifications.unshift(item);
  return { ok: true, notification: item };
}

export function favoriteAS6BusinessItem(item = {}) {
  if (!item.id) return { ok: false, error: "AS6_BUSINESS_FAVORITE_ID_MISSING" };
  workspaceState.favorites = [{ addedAt: now(), ...item }, ...workspaceState.favorites.filter((entry) => entry.id !== item.id)].slice(0, 50);
  return { ok: true, itemId: item.id };
}

export function searchAS6BusinessWorkspace(query = "") {
  const q = query.trim().toLowerCase();
  const pool = [
    ...workspaceState.recentItems,
    ...workspaceState.favorites,
    ...workspaceState.modules.values(),
    ...workspaceState.commands.values(),
  ];
  const results = pool.filter((item) => [item.id, item.title, item.label, item.type].filter(Boolean).join(" ").toLowerCase().includes(q));
  return { ok: true, query, results };
}

export function bootstrapAS6BusinessWorkspace() {
  registerAS6BusinessModule({ id: "dashboard", title: "Dashboard", path: "/dashboard", icon: "▦" });
  registerAS6BusinessModule({ id: "crm", title: "CRM", path: "/as6-crm", icon: "▧" });
  registerAS6BusinessModule({ id: "marketplace", title: "Marketplace", path: "/marketplace", icon: "extensions" });
  registerAS6BusinessCommand({ id: "open-dashboard", title: "Open Dashboard", handler: () => openAS6BusinessModule("dashboard") });
  registerAS6BusinessCommand({ id: "open-crm", title: "Open CRM", handler: () => openAS6BusinessModule("crm") });
  registerAS6BusinessCommand({ id: "open-marketplace", title: "Open Marketplace", handler: () => openAS6BusinessModule("marketplace") });
  return getAS6BusinessWorkspaceState();
}
