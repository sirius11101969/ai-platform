import { installAS6Plugin, enableAS6Plugin, getAS6PluginUpdateStatus, updateAS6Plugin } from "./AS6PluginRuntime";
import { annotateAS6PluginTrust } from "./AS6PluginTrust";

export const AS6_PLUGIN_MARKETPLACE_VERSION = "P10";
export const AS6_PLUGIN_MARKETPLACE_TRUST_VERSION = "P27";

const marketplaceRegistry = new Map();

export function publishAS6MarketplacePlugin(plugin = {}) {
  if (!plugin.id) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_ID_MISSING" };

  marketplaceRegistry.set(plugin.id, annotateAS6PluginTrust({
    status: "published",
    publishedAt: new Date().toISOString(),
    rating: 0,
    installs: 0,
    ...plugin,
  }));

  return { ok: true, pluginId: plugin.id };
}

export function installAS6MarketplacePlugin(pluginId) {
  const plugin = marketplaceRegistry.get(pluginId);
  if (!plugin) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_NOT_FOUND", pluginId };

  const installResult = installAS6Plugin(plugin);
  if (!installResult.ok) return installResult;

  marketplaceRegistry.set(pluginId, {
    ...plugin,
    installs: (plugin.installs || 0) + 1,
  });

  return enableAS6Plugin(pluginId);
}

export function getAS6MarketplacePlugins() {
  return [...marketplaceRegistry.values()];
}

export function getAS6MarketplacePluginById(pluginId) {
  return marketplaceRegistry.get(pluginId) || null;
}

export function getAS6MarketplacePluginUpdateStatus(pluginId) {
  const plugin = marketplaceRegistry.get(pluginId);
  if (!plugin) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_NOT_FOUND", pluginId };
  return getAS6PluginUpdateStatus(pluginId, plugin);
}

export function updateAS6MarketplacePlugin(pluginId) {
  const plugin = marketplaceRegistry.get(pluginId);
  if (!plugin) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_NOT_FOUND", pluginId };
  return updateAS6Plugin(plugin);
}

export function getAS6MarketplacePluginTrustStatus(pluginId) {
  const plugin = marketplaceRegistry.get(pluginId);
  if (!plugin) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_NOT_FOUND", pluginId };
  return plugin.trust || annotateAS6PluginTrust(plugin).trust;
}
