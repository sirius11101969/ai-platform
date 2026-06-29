import {
  activateAS6Plugin,
  deactivateAS6Plugin,
  getAS6PluginSDKState,
  validateAS6PluginSDKPolicy,
} from "./as6PluginSDK";

import {
  getAS6Plugins,
  getAS6PluginById,
} from "./as6PluginRegistry";

import { getAS6ServiceById } from "../services/as6ServiceRegistry";
import { getAS6ImpactMap } from "../dependencies/as6DependencyEngine";
import { emitAS6Event } from "../runtime/as6EventBus";

export const AS6_PLUGIN_LOADER_VERSION = "V111";

const pluginLoaderState = {
  version: AS6_PLUGIN_LOADER_VERSION,
  statuses: {},
  errors: {},
  loadedAt: null,
};

function setPluginStatus(pluginId, status, error = null) {
  pluginLoaderState.statuses[pluginId] = status;

  if (error) {
    pluginLoaderState.errors[pluginId] = error;
  }

  emitAS6Event(
    "AS6_PLUGIN_LOADER_STATUS",
    {
      pluginId,
      status,
      error,
    },
    { source: "as6PluginLoader" },
  );
}

export function validateAS6PluginLoadCandidate(plugin) {
  const failures = [];

  if (!plugin?.id) failures.push("plugin_missing_id");
  if (!plugin?.title) failures.push(`${plugin?.id || "unknown"}_missing_title`);

  if (plugin?.serviceId && !getAS6ServiceById(plugin.serviceId)) {
    failures.push(`${plugin.id}_service_not_registered`);
  }

  if (!Array.isArray(plugin?.capabilities)) {
    failures.push(`${plugin?.id || "unknown"}_capabilities_not_array`);
  }

  if (!Array.isArray(plugin?.permissions)) {
    failures.push(`${plugin?.id || "unknown"}_permissions_not_array`);
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}

export function resolveAS6PluginDependencies(pluginId) {
  const plugin = getAS6PluginById(pluginId);

  if (!plugin) {
    return {
      ok: false,
      plugin: null,
      serviceImpact: null,
      failures: ["plugin_not_found"],
    };
  }

  const failures = [];

  if (plugin.serviceId && !getAS6ServiceById(plugin.serviceId)) {
    failures.push(`${plugin.id}_service_not_registered`);
  }

  const serviceImpact = plugin.serviceId ? getAS6ImpactMap(plugin.serviceId) : null;

  return {
    ok: failures.length === 0,
    plugin,
    serviceImpact,
    failures,
  };
}

export function loadAS6Plugin(pluginId, context = {}) {
  const plugin = getAS6PluginById(pluginId);

  if (!plugin) {
    setPluginStatus(pluginId, "FAILED", "AS6_PLUGIN_NOT_FOUND");
    return { ok: false, error: "AS6_PLUGIN_NOT_FOUND" };
  }

  setPluginStatus(plugin.id, "VALIDATING");

  const candidateValidation = validateAS6PluginLoadCandidate(plugin);
  if (!candidateValidation.ok) {
    setPluginStatus(plugin.id, "FAILED", candidateValidation.failures.join(","));
    return { ok: false, error: "AS6_PLUGIN_VALIDATION_FAILURE", failures: candidateValidation.failures };
  }

  setPluginStatus(plugin.id, "RESOLVING_DEPENDENCIES");

  const dependencyResolution = resolveAS6PluginDependencies(plugin.id);
  if (!dependencyResolution.ok) {
    setPluginStatus(plugin.id, "FAILED", dependencyResolution.failures.join(","));
    return { ok: false, error: "AS6_PLUGIN_DEPENDENCY_FAILURE", failures: dependencyResolution.failures };
  }

  setPluginStatus(plugin.id, "LOADING");

  const activation = activateAS6Plugin(plugin.id, {
    ...context,
    dependencyResolution,
  });

  if (!activation.ok) {
    setPluginStatus(plugin.id, "FAILED", activation.error);
    return { ok: false, error: activation.error };
  }

  setPluginStatus(plugin.id, "ACTIVE");

  return {
    ok: true,
    plugin,
    dependencyResolution,
  };
}

export function unloadAS6Plugin(pluginId, context = {}) {
  const plugin = getAS6PluginById(pluginId);

  if (!plugin) {
    setPluginStatus(pluginId, "FAILED", "AS6_PLUGIN_NOT_FOUND");
    return { ok: false, error: "AS6_PLUGIN_NOT_FOUND" };
  }

  const deactivation = deactivateAS6Plugin(plugin.id, context);

  if (!deactivation.ok) {
    setPluginStatus(plugin.id, "FAILED", deactivation.error);
    return { ok: false, error: deactivation.error };
  }

  setPluginStatus(plugin.id, "UNLOADED");

  return {
    ok: true,
    plugin,
  };
}

export function loadAllAS6Plugins(context = {}) {
  const results = getAS6Plugins().map((plugin) => loadAS6Plugin(plugin.id, context));
  pluginLoaderState.loadedAt = new Date().toISOString();

  return {
    ok: results.every((result) => result.ok),
    results,
    state: getAS6PluginLoaderState(),
  };
}

export function reloadAS6Plugin(pluginId, context = {}) {
  unloadAS6Plugin(pluginId, context);
  return loadAS6Plugin(pluginId, context);
}

export function getAS6PluginLoaderState() {
  return {
    ...pluginLoaderState,
    sdk: getAS6PluginSDKState(),
  };
}

export function validateAS6PluginLoaderPolicy() {
  const sdkValidation = validateAS6PluginSDKPolicy();
  const failures = [...sdkValidation.failures];

  if (pluginLoaderState.version !== AS6_PLUGIN_LOADER_VERSION) failures.push("version_mismatch");
  if (typeof loadAS6Plugin !== "function") failures.push("load_missing");
  if (typeof unloadAS6Plugin !== "function") failures.push("unload_missing");
  if (typeof loadAllAS6Plugins !== "function") failures.push("load_all_missing");
  if (typeof resolveAS6PluginDependencies !== "function") failures.push("dependency_resolver_missing");

  return {
    ok: failures.length === 0,
    failures,
    pluginCount: getAS6Plugins().length,
    version: AS6_PLUGIN_LOADER_VERSION,
  };
}
