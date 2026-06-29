import { installAS6Plugin, enableAS6Plugin } from "./AS6PluginRuntime";

export const AS6_PLUGIN_MARKETPLACE_VERSION = "P10";

const marketplaceRegistry = new Map();

export function publishAS6MarketplacePlugin(plugin = {}) {
  if (!plugin.id) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_ID_MISSING" };

  marketplaceRegistry.set(plugin.id, {
    status: "published",
    publishedAt: new Date().toISOString(),
    rating: 0,
    installs: 0,
    ...plugin,
  });

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
