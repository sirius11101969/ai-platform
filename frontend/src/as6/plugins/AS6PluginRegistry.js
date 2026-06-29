import { createAS6PluginDiscoveryIndex, getAS6DiscoverablePlugins } from "./AS6PluginDiscovery";
import { crmInsightsPlugin } from "./examples.crm-insights.plugin";

export const AS6_PLUGIN_REGISTRY_VERSION = "P13";

const pluginSources = [crmInsightsPlugin];
let pluginRegistryState = createAS6PluginDiscoveryIndex(pluginSources);

export function refreshAS6PluginRegistry(extraPlugins = []) {
  pluginRegistryState = createAS6PluginDiscoveryIndex([...pluginSources, ...extraPlugins]);
  return pluginRegistryState;
}

export function getAS6PluginRegistryState() {
  return pluginRegistryState;
}

export function getAS6RegisteredPluginIds() {
  return getAS6DiscoverablePlugins(pluginRegistryState).map((item) => item.id);
}

export function findAS6PluginInRegistry(pluginId) {
  return getAS6DiscoverablePlugins(pluginRegistryState).find((item) => item.id === pluginId) || null;
}

export function validateAS6PluginRegistryPolicy() {
  const failures = [...(pluginRegistryState.failures || [])];

  if (!Array.isArray(pluginRegistryState.discovered)) failures.push("registry_discovered_not_array");
  if (!pluginRegistryState.version) failures.push("registry_version_missing");

  return {
    ok: failures.length === 0,
    failures,
    count: pluginRegistryState.count,
    version: AS6_PLUGIN_REGISTRY_VERSION,
  };
}
