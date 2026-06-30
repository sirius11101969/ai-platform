import plugin0 from "./p22-marketplace-smoke/manifest";

export const AS6_GENERATED_PLUGIN_AUTO_DISCOVERY_VERSION = "P23";

export const as6GeneratedPlugins = [
  plugin0
];

export function getAS6GeneratedPlugins() {
  return as6GeneratedPlugins;
}

export function getAS6GeneratedPluginIds() {
  return as6GeneratedPlugins.map((plugin) => plugin.id).filter(Boolean);
}
