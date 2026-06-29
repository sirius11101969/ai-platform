import {
  getAS6PluginById,
  getAS6Plugins,
  getAS6PluginsByCapability,
  getAS6PluginsByService,
  registerAS6Plugin,
  unregisterAS6Plugin,
  validateAS6PluginRegistryPolicy,
} from "./as6PluginRegistry";

import { emitAS6Event } from "../runtime/as6EventBus";
import { getAS6ServiceById } from "../services/as6ServiceRegistry";

export function createAS6Plugin(plugin) {
  return registerAS6Plugin(plugin);
}

export function activateAS6Plugin(pluginId, context = {}) {
  const plugin = getAS6PluginById(pluginId);

  if (!plugin) {
    return {
      ok: false,
      error: "AS6_PLUGIN_NOT_FOUND",
    };
  }

  if (plugin.serviceId && !getAS6ServiceById(plugin.serviceId)) {
    return {
      ok: false,
      error: "AS6_PLUGIN_SERVICE_NOT_FOUND",
    };
  }

  if (plugin.activate) {
    plugin.activate(context);
  }

  emitAS6Event("AS6_PLUGIN_ACTIVATED", {
    pluginId,
    serviceId: plugin.serviceId,
  });

  return {
    ok: true,
    plugin,
  };
}

export function deactivateAS6Plugin(pluginId, context = {}) {
  const plugin = getAS6PluginById(pluginId);

  if (!plugin) {
    return {
      ok: false,
      error: "AS6_PLUGIN_NOT_FOUND",
    };
  }

  if (plugin.deactivate) {
    plugin.deactivate(context);
  }

  emitAS6Event("AS6_PLUGIN_DEACTIVATED", {
    pluginId,
    serviceId: plugin.serviceId,
  });

  return {
    ok: true,
    plugin,
  };
}

export function getAS6PluginSDKState() {
  return {
    plugins: getAS6Plugins(),
    validation: validateAS6PluginRegistryPolicy(),
  };
}

export function resolveAS6Plugin(input) {
  return getAS6PluginById(input);
}

export function findAS6PluginsByService(serviceId) {
  return getAS6PluginsByService(serviceId);
}

export function findAS6PluginsByCapability(capability) {
  return getAS6PluginsByCapability(capability);
}

export function removeAS6Plugin(pluginId) {
  return unregisterAS6Plugin(pluginId);
}

export function validateAS6PluginSDKPolicy() {
  const registryValidation = validateAS6PluginRegistryPolicy();
  const failures = [...registryValidation.failures];

  if (typeof emitAS6Event !== "function") failures.push("event_bus_emit_missing");
  if (typeof getAS6ServiceById !== "function") failures.push("service_registry_lookup_missing");

  return {
    ok: failures.length === 0,
    failures,
    pluginCount: getAS6Plugins().length,
  };
}
