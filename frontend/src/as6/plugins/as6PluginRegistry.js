export const AS6_PLUGIN_REGISTRY_VERSION = "V109";

export const as6PluginRegistry = [];

export function registerAS6Plugin(plugin) {
  if (!plugin || !plugin.id || !plugin.title) {
    throw new Error("AS6_PLUGIN_INVALID_PLUGIN");
  }

  if (as6PluginRegistry.some((item) => item.id === plugin.id)) {
    return getAS6PluginById(plugin.id);
  }

  const normalizedPlugin = {
    id: plugin.id,
    title: plugin.title,
    version: plugin.version || "0.1.0",
    status: plugin.status || "registered",
    serviceId: plugin.serviceId || null,
    capabilities: Array.isArray(plugin.capabilities) ? plugin.capabilities : [],
    permissions: Array.isArray(plugin.permissions) ? plugin.permissions : [],
    routes: Array.isArray(plugin.routes) ? plugin.routes : [],
    commands: Array.isArray(plugin.commands) ? plugin.commands : [],
    events: Array.isArray(plugin.events) ? plugin.events : [],
    activate: typeof plugin.activate === "function" ? plugin.activate : null,
    deactivate: typeof plugin.deactivate === "function" ? plugin.deactivate : null,
  };

  as6PluginRegistry.push(normalizedPlugin);
  return normalizedPlugin;
}

export function unregisterAS6Plugin(pluginId) {
  const index = as6PluginRegistry.findIndex((plugin) => plugin.id === pluginId);

  if (index === -1) {
    return false;
  }

  as6PluginRegistry.splice(index, 1);
  return true;
}

export function getAS6Plugins() {
  return as6PluginRegistry;
}

export function getAS6PluginById(pluginId) {
  return as6PluginRegistry.find((plugin) => plugin.id === pluginId) || null;
}

export function getAS6PluginsByService(serviceId) {
  return as6PluginRegistry.filter((plugin) => plugin.serviceId === serviceId);
}

export function getAS6PluginsByCapability(capability) {
  return as6PluginRegistry.filter((plugin) => plugin.capabilities.includes(capability));
}

export function validateAS6PluginRegistryPolicy() {
  const failures = [];
  const ids = new Set();

  for (const plugin of as6PluginRegistry) {
    if (!plugin.id) failures.push("plugin_missing_id");
    if (!plugin.title) failures.push(`${plugin.id || "unknown"}_missing_title`);
    if (!Array.isArray(plugin.capabilities)) failures.push(`${plugin.id || "unknown"}_capabilities_not_array`);
    if (!Array.isArray(plugin.permissions)) failures.push(`${plugin.id || "unknown"}_permissions_not_array`);
    if (ids.has(plugin.id)) failures.push(`${plugin.id}_duplicate_plugin_id`);
    ids.add(plugin.id);
  }

  return {
    ok: failures.length === 0,
    failures,
    count: as6PluginRegistry.length,
    version: AS6_PLUGIN_REGISTRY_VERSION,
  };
}
