import { defineAS6Plugin, validateAS6PluginSDKCompatibility } from "../sdk/plugin/AS6PluginSDK";
import { exportAS6PluginPackage, validateAS6PluginPackage, saveAS6PluginPackage } from "./AS6PluginPackageManager";
import { publishAS6PublicMarketplacePlugin } from "./AS6PublicMarketplace";
import { validateAS6PluginPackageTrust } from "./AS6PluginTrust";
import { compareAS6PluginVersions } from "./AS6PluginRuntime";

export const AS6_DEVELOPER_PORTAL_VERSION = "P32";

const developerWorkspace = new Map();
const developerReleaseLog = [];

export function createAS6DeveloperPluginDraft(input = {}) {
  const plugin = defineAS6Plugin({
    id: input.id,
    title: input.title || input.id,
    version: input.version || "0.1.0",
    publisher: input.publisher || "AS6 Developer",
    publisherId: input.publisherId || input.publisher || "AS6 Developer",
    description: input.description || "AS6 Developer Portal plugin draft.",
    category: input.category || "general",
    tags: input.tags || [],
    livingSpaces: input.livingSpaces || [],
    widgets: input.widgets || [],
    aiActions: input.aiActions || [],
    busHandlers: input.busHandlers || [],
    permissions: input.permissions || [],
    capabilities: input.capabilities || [],
  });

  developerWorkspace.set(plugin.id, {
    status: "draft",
    createdAt: new Date().toISOString(),
    plugin,
  });

  return { ok: true, pluginId: plugin.id, plugin };
}

export function getAS6DeveloperPluginDraft(pluginId) {
  return developerWorkspace.get(pluginId) || null;
}

export function getAS6DeveloperPluginDrafts() {
  return [...developerWorkspace.values()];
}

export function validateAS6DeveloperPluginDraft(pluginId) {
  const draft = developerWorkspace.get(pluginId);
  if (!draft) return { ok: false, error: "AS6_DEVELOPER_PLUGIN_DRAFT_NOT_FOUND", pluginId };

  const compatibility = validateAS6PluginSDKCompatibility(draft.plugin);
  const trust = validateAS6PluginPackageTrust(draft.plugin);

  const result = {
    ok: compatibility.ok,
    pluginId,
    compatibility,
    trust,
    checkedAt: new Date().toISOString(),
  };

  developerWorkspace.set(pluginId, {
    ...draft,
    status: result.ok ? "validated" : "invalid",
    validation: result,
  });

  return result;
}

export async function packageAS6DeveloperPlugin(pluginId) {
  const validation = validateAS6DeveloperPluginDraft(pluginId);
  if (!validation.ok) return { ok: false, error: "AS6_DEVELOPER_PLUGIN_VALIDATION_FAILED", validation };

  const exported = await exportAS6PluginPackage(pluginId);
  if (!exported.ok) return exported;

  saveAS6PluginPackage(exported.package);

  const draft = developerWorkspace.get(pluginId);
  developerWorkspace.set(pluginId, {
    ...draft,
    status: "packaged",
    package: exported.package,
    packagedAt: new Date().toISOString(),
  });

  return { ok: true, pluginId, package: exported.package };
}

export async function validateAS6DeveloperPackage(pluginId) {
  const draft = developerWorkspace.get(pluginId);
  if (!draft?.package) return { ok: false, error: "AS6_DEVELOPER_PACKAGE_NOT_FOUND", pluginId };
  return validateAS6PluginPackage(draft.package);
}

export async function publishAS6DeveloperPlugin(pluginId, metadata = {}) {
  const draft = developerWorkspace.get(pluginId);
  if (!draft) return { ok: false, error: "AS6_DEVELOPER_PLUGIN_DRAFT_NOT_FOUND", pluginId };

  const packageValidation = draft.package ? await validateAS6PluginPackage(draft.package) : { ok: true, skipped: true };
  if (!packageValidation.ok && !metadata.allowUntrusted) {
    return { ok: false, error: "AS6_DEVELOPER_PLUGIN_PACKAGE_VALIDATION_FAILED", packageValidation };
  }

  const published = publishAS6PublicMarketplacePlugin(draft.plugin, {
    category: metadata.category || draft.plugin.category || "general",
    tags: metadata.tags || draft.plugin.tags || [],
    description: metadata.description || draft.plugin.description || "",
    source: metadata.source || "developer",
    ...metadata,
  });

  const release = {
    pluginId,
    version: draft.plugin.version,
    status: published.ok ? "published" : "failed",
    published,
    packageValidation,
    publishedAt: new Date().toISOString(),
  };

  developerReleaseLog.unshift(release);
  developerWorkspace.set(pluginId, {
    ...draft,
    status: release.status,
    release,
  });

  return { ok: published.ok, release };
}

export function bumpAS6DeveloperPluginVersion(pluginId, nextVersion) {
  const draft = developerWorkspace.get(pluginId);
  if (!draft) return { ok: false, error: "AS6_DEVELOPER_PLUGIN_DRAFT_NOT_FOUND", pluginId };
  if (!nextVersion) return { ok: false, error: "AS6_DEVELOPER_PLUGIN_VERSION_MISSING", pluginId };

  const comparison = compareAS6PluginVersions(draft.plugin.version, nextVersion);
  if (comparison !== 1) return { ok: false, error: "AS6_DEVELOPER_PLUGIN_VERSION_NOT_INCREMENTED", currentVersion: draft.plugin.version, nextVersion };

  const plugin = {
    ...draft.plugin,
    version: nextVersion,
  };

  developerWorkspace.set(pluginId, {
    ...draft,
    status: "draft",
    plugin,
    updatedAt: new Date().toISOString(),
  });

  return { ok: true, pluginId, version: nextVersion };
}

export function getAS6DeveloperReleaseLog() {
  return [...developerReleaseLog];
}

export function getAS6DeveloperPortalState() {
  return {
    version: AS6_DEVELOPER_PORTAL_VERSION,
    drafts: getAS6DeveloperPluginDrafts(),
    releases: getAS6DeveloperReleaseLog(),
    draftCount: developerWorkspace.size,
    releaseCount: developerReleaseLog.length,
  };
}
