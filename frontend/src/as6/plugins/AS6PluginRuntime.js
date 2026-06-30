import { emitAS6BusEvent, registerAS6BusHandler } from "../bus";
import { registerAS6Widget } from "../widgets";
import { registerAS6AIAction } from "../ai/actions";
import { registerAS6SpaceManifest } from "../spaces";

export const AS6_PLUGIN_RUNTIME_VERSION = "P10";
export const AS6_PLUGIN_INSTALL_PERSISTENCE_VERSION = "P24";
export const AS6_PLUGIN_INSTALL_STORAGE_KEY = "as6.plugin.install.state.v1";

const pluginRegistry = new Map();

function canUseAS6PluginStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function persistAS6PluginInstallState() {
  if (!canUseAS6PluginStorage()) return { ok: false, skipped: true, reason: "local_storage_unavailable" };
  const state = getAS6PluginRuntimeState();
  window.localStorage.setItem(AS6_PLUGIN_INSTALL_STORAGE_KEY, JSON.stringify(state));
  return { ok: true, pluginCount: state.pluginCount };
}

export function restoreAS6PluginInstallState() {
  if (!canUseAS6PluginStorage()) return { ok: false, skipped: true, reason: "local_storage_unavailable" };
  const raw = window.localStorage.getItem(AS6_PLUGIN_INSTALL_STORAGE_KEY);
  if (!raw) return { ok: true, restored: 0 };
  const state = JSON.parse(raw);
  for (const plugin of state.plugins || []) pluginRegistry.set(plugin.id, plugin);
  return { ok: true, restored: pluginRegistry.size };
}

export function validateAS6PluginManifest(plugin = {}) {
  const failures = [];

  if (!plugin.id) failures.push("plugin_id_missing");
  if (!plugin.title) failures.push("plugin_title_missing");
  if (!plugin.version) failures.push("plugin_version_missing");
  if (!plugin.publisher) failures.push("plugin_publisher_missing");

  for (const field of ["livingSpaces", "widgets", "aiActions", "busHandlers", "permissions", "capabilities"]) {
    if (plugin[field] && !Array.isArray(plugin[field])) failures.push(`${field}_not_array`);
  }

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_PLUGIN_RUNTIME_VERSION,
  };
}

export function installAS6Plugin(plugin = {}) {
  const validation = validateAS6PluginManifest(plugin);
  if (!validation.ok) {
    return { ok: false, error: "AS6_PLUGIN_MANIFEST_INVALID", validation };
  }

  pluginRegistry.set(plugin.id, {
    status: "installed",
    installedAt: new Date().toISOString(),
    livingSpaces: [],
    widgets: [],
    aiActions: [],
    busHandlers: [],
    permissions: [],
    capabilities: [],
    ...plugin,
  });

  persistAS6PluginInstallState();
  emitAS6BusEvent("plugin.installed", { pluginId: plugin.id });

  return { ok: true, pluginId: plugin.id };
}

export function enableAS6Plugin(pluginId) {
  const plugin = pluginRegistry.get(pluginId);
  if (!plugin) return { ok: false, error: "AS6_PLUGIN_NOT_FOUND", pluginId };

  for (const space of plugin.livingSpaces || []) {
    registerAS6SpaceManifest(space);
  }

  for (const widget of plugin.widgets || []) {
    registerAS6Widget({ ...widget, pluginId });
  }

  for (const action of plugin.aiActions || []) {
    registerAS6AIAction({ ...action, pluginId });
  }

  for (const handler of plugin.busHandlers || []) {
    registerAS6BusHandler(handler.type, handler.name, handler.handler, {
      owner: pluginId,
      risk: handler.risk || "low",
    });
  }

  const enabledPlugin = {
    ...plugin,
    status: "enabled",
    enabledAt: new Date().toISOString(),
  };

  pluginRegistry.set(pluginId, enabledPlugin);
  persistAS6PluginInstallState();
  emitAS6BusEvent("plugin.enabled", { pluginId });

  return { ok: true, plugin: enabledPlugin };
}

export function disableAS6Plugin(pluginId) {
  const plugin = pluginRegistry.get(pluginId);
  if (!plugin) return { ok: false, error: "AS6_PLUGIN_NOT_FOUND", pluginId };

  pluginRegistry.set(pluginId, {
    ...plugin,
    status: "disabled",
    disabledAt: new Date().toISOString(),
  });

  persistAS6PluginInstallState();
  emitAS6BusEvent("plugin.disabled", { pluginId });

  return { ok: true, pluginId };
}

export function removeAS6Plugin(pluginId) {
  if (!pluginRegistry.has(pluginId)) return { ok: false, error: "AS6_PLUGIN_NOT_FOUND", pluginId };

  pluginRegistry.delete(pluginId);
  persistAS6PluginInstallState();
  emitAS6BusEvent("plugin.removed", { pluginId });

  return { ok: true, pluginId };
}

export function getAS6Plugins() {
  return [...pluginRegistry.values()];
}

export function getAS6PluginById(pluginId) {
  return pluginRegistry.get(pluginId) || null;
}

export function getAS6PluginRuntimeState() {
  return {
    version: AS6_PLUGIN_RUNTIME_VERSION,
    pluginCount: pluginRegistry.size,
    plugins: getAS6Plugins(),
  };
}
