import { installAS6Plugin, getAS6PluginById } from "./AS6PluginRuntime";
import { calculateAS6PluginPackageSHA256, validateAS6PluginPackageTrust, verifyAS6PluginPackageSignature } from "./AS6PluginTrust";
import { evaluateAS6MarketplaceInstallationPolicy } from "./AS6MarketplaceTrustPolicy";

export const AS6_PLUGIN_PACKAGE_MANAGER_VERSION = "P30";
export const AS6_PLUGIN_PACKAGE_EXTENSION = ".as6plugin";

const localPackageRepository = new Map();

export function createAS6PluginPackageManifest(plugin = {}) {
  return {
    format: "AS6_PLUGIN_PACKAGE",
    formatVersion: "1.0",
    packageVersion: AS6_PLUGIN_PACKAGE_MANAGER_VERSION,
    id: plugin.id,
    title: plugin.title,
    version: plugin.version,
    publisher: plugin.publisher,
    publisherId: plugin.publisherId || plugin.publisher,
    packageSha256: plugin.packageSha256 || null,
    signature: plugin.signature || null,
    signedPayload: plugin.signedPayload || null,
    createdAt: new Date().toISOString(),
  };
}

export async function exportAS6PluginPackage(pluginId) {
  const plugin = getAS6PluginById(pluginId);
  if (!plugin) return { ok: false, error: "AS6_PLUGIN_NOT_FOUND", pluginId };

  const manifest = createAS6PluginPackageManifest(plugin);
  const packagePayload = {
    manifest,
    plugin,
  };

  const hash = await calculateAS6PluginPackageSHA256(packagePayload);
  const packaged = {
    ...packagePayload,
    manifest: {
      ...manifest,
      packageSha256: hash.ok ? hash.sha256 : manifest.packageSha256,
    },
  };

  localPackageRepository.set(pluginId, packaged);

  return {
    ok: true,
    pluginId,
    extension: AS6_PLUGIN_PACKAGE_EXTENSION,
    package: packaged,
    packageSha256: packaged.manifest.packageSha256,
  };
}

export function parseAS6PluginPackage(input) {
  if (!input) return { ok: false, error: "AS6_PLUGIN_PACKAGE_EMPTY" };
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  if (parsed?.manifest?.format !== "AS6_PLUGIN_PACKAGE") return { ok: false, error: "AS6_PLUGIN_PACKAGE_FORMAT_INVALID" };
  if (!parsed.plugin?.id) return { ok: false, error: "AS6_PLUGIN_PACKAGE_PLUGIN_ID_MISSING" };
  return { ok: true, package: parsed };
}

export async function validateAS6PluginPackage(input) {
  const parsed = parseAS6PluginPackage(input);
  if (!parsed.ok) return parsed;

  const packaged = parsed.package;
  const plugin = {
    ...packaged.plugin,
    ...packaged.manifest,
  };

  const trust = validateAS6PluginPackageTrust(plugin);
  const signatureVerification = await verifyAS6PluginPackageSignature(plugin);
  const policy = evaluateAS6MarketplaceInstallationPolicy({
    ...plugin,
    trust: {
      ...trust,
      signatureVerification,
    },
  });

  return {
    ok: trust.ok && policy.ok,
    package: packaged,
    plugin,
    trust,
    signatureVerification,
    policy,
  };
}

export async function importAS6PluginPackage(input, options = {}) {
  const validation = await validateAS6PluginPackage(input);
  if (!validation.ok && !options.allowUntrusted) {
    return {
      ok: false,
      error: "AS6_PLUGIN_PACKAGE_IMPORT_BLOCKED",
      validation,
    };
  }

  const installResult = installAS6Plugin(validation.package.plugin);
  if (!installResult.ok) return installResult;

  localPackageRepository.set(validation.package.plugin.id, validation.package);

  return {
    ok: true,
    pluginId: validation.package.plugin.id,
    installResult,
    validation,
  };
}

export function saveAS6PluginPackage(packaged = {}) {
  const pluginId = packaged?.plugin?.id || packaged?.manifest?.id;
  if (!pluginId) return { ok: false, error: "AS6_PLUGIN_PACKAGE_ID_MISSING" };
  localPackageRepository.set(pluginId, packaged);
  return { ok: true, pluginId };
}

export function getAS6LocalPluginPackages() {
  return [...localPackageRepository.values()];
}

export function getAS6LocalPluginPackageById(pluginId) {
  return localPackageRepository.get(pluginId) || null;
}
