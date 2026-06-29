import { validateAS6PluginManifest } from "../../plugins";

export const AS6_PLUGIN_SDK_VERSION = "P11";
export const AS6_PLUGIN_SDK_CORE_COMPATIBILITY = "AS6_PLATFORM_V2";

export function defineAS6Plugin(plugin) {
  return {
    sdkVersion: AS6_PLUGIN_SDK_VERSION,
    compatibility: AS6_PLUGIN_SDK_CORE_COMPATIBILITY,
    livingSpaces: [],
    widgets: [],
    aiActions: [],
    busHandlers: [],
    permissions: [],
    capabilities: [],
    ...plugin,
  };
}

export function validateAS6PluginSDKCompatibility(plugin) {
  const manifestValidation = validateAS6PluginManifest(plugin);
  const failures = [...manifestValidation.failures];

  if (plugin.sdkVersion && plugin.sdkVersion !== AS6_PLUGIN_SDK_VERSION) failures.push("sdk_version_mismatch");
  if (plugin.compatibility && plugin.compatibility !== AS6_PLUGIN_SDK_CORE_COMPATIBILITY) failures.push("core_compatibility_mismatch");

  return { ok: failures.length === 0, failures, sdkVersion: AS6_PLUGIN_SDK_VERSION };
}

export function createAS6PluginTemplate(id, title, publisher = "AS6 Developer") {
  return defineAS6Plugin({
    id,
    title,
    version: "0.1.0",
    publisher,
    description: "AS6 Platform V2 extension plugin.",
    permissions: [],
    capabilities: [],
    livingSpaces: [],
    widgets: [],
    aiActions: [],
    busHandlers: [],
  });
}
