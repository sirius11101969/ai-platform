import { validateAS6PluginManifest } from "./AS6PluginRuntime";
import { validateAS6TenantPolicy } from "../tenant";

export const AS6_PLUGIN_POLICY_VERSION = "P10";

export function validateAS6PluginPolicy(plugin = {}, tenantResource = {}) {
  const manifestValidation = validateAS6PluginManifest(plugin);
  const tenantValidation = validateAS6TenantPolicy(tenantResource);
  const failures = [
    ...manifestValidation.failures,
    ...tenantValidation.failures,
  ];

  if ((plugin.permissions || []).includes("*")) {
    failures.push("wildcard_permission_denied");
  }

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_PLUGIN_POLICY_VERSION,
  };
}
