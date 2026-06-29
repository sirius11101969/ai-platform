import { validateAS6PluginSDKCompatibility } from "../sdk/plugin";

export const AS6_PLUGIN_DISCOVERY_VERSION = "P13";

export function createAS6PluginDiscoveryIndex(plugins = []) {
  const seen = new Set();
  const discovered = [];
  const failures = [];

  for (const plugin of plugins) {
    if (!plugin?.id) {
      failures.push("plugin_id_missing");
      continue;
    }

    if (seen.has(plugin.id)) {
      failures.push("duplicate_plugin_id:" + plugin.id);
      continue;
    }

    seen.add(plugin.id);

    const compatibility = validateAS6PluginSDKCompatibility(plugin);

    discovered.push({
      id: plugin.id,
      title: plugin.title,
      version: plugin.version,
      publisher: plugin.publisher,
      status: compatibility.ok ? "discoverable" : "invalid",
      compatibility,
      plugin,
    });

    if (!compatibility.ok) {
      failures.push("plugin_incompatible:" + plugin.id);
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    count: discovered.length,
    discovered,
    version: AS6_PLUGIN_DISCOVERY_VERSION,
  };
}

export function getAS6DiscoverablePlugins(discoveryIndex) {
  return (discoveryIndex?.discovered || []).filter((item) => item.status === "discoverable");
}

export function getAS6InvalidPlugins(discoveryIndex) {
  return (discoveryIndex?.discovered || []).filter((item) => item.status === "invalid");
}
