import {
  registerAS6TrustedPublisher,
  registerAS6TrustedPublisherKey,
  rotateAS6TrustedPublisherKey,
  getAS6TrustedPublishers,
  getAS6TrustedPublisherKeys,
} from "./AS6PluginTrust";
import {
  registerAS6PublicMarketplaceSource,
  publishAS6PublicMarketplacePlugin,
  getAS6PublicMarketplaceState,
} from "./AS6PublicMarketplace";

export const AS6_MARKETPLACE_ADMINISTRATION_VERSION = "P33";

const marketplaceAdminAuditLog = [];
const marketplaceModerationQueue = new Map();
const marketplaceBlockedPlugins = new Map();
const marketplaceRevokedVersions = new Map();

function recordAS6MarketplaceAdminAudit(action, payload = {}) {
  const entry = {
    id: "admin-" + Date.now() + "-" + marketplaceAdminAuditLog.length,
    action,
    payload,
    createdAt: new Date().toISOString(),
  };
  marketplaceAdminAuditLog.unshift(entry);
  return entry;
}

export function getAS6MarketplaceAdminAuditLog() {
  return [...marketplaceAdminAuditLog];
}

export function approveAS6MarketplacePublisher(publisher = {}) {
  const result = registerAS6TrustedPublisher(publisher);
  recordAS6MarketplaceAdminAudit("publisher.approved", { publisher, result });
  return result;
}

export function registerAS6MarketplacePublisherKey(publisherId, key = {}) {
  const result = registerAS6TrustedPublisherKey(publisherId, key);
  recordAS6MarketplaceAdminAudit("publisher.key.registered", { publisherId, keyId: key.id, result });
  return result;
}

export function rotateAS6MarketplacePublisherKey(publisherId, key = {}) {
  const result = rotateAS6TrustedPublisherKey(publisherId, key);
  recordAS6MarketplaceAdminAudit("publisher.key.rotated", { publisherId, keyId: key.id, result });
  return result;
}

export function submitAS6MarketplaceModerationRequest(plugin = {}, metadata = {}) {
  if (!plugin.id) return { ok: false, error: "AS6_MARKETPLACE_MODERATION_PLUGIN_ID_MISSING" };

  marketplaceModerationQueue.set(plugin.id, {
    plugin,
    metadata,
    status: "pending",
    submittedAt: new Date().toISOString(),
  });

  const audit = recordAS6MarketplaceAdminAudit("plugin.moderation.submitted", { pluginId: plugin.id });
  return { ok: true, pluginId: plugin.id, audit };
}

export function approveAS6MarketplaceModeration(pluginId, reviewer = "AS6 Admin") {
  const request = marketplaceModerationQueue.get(pluginId);
  if (!request) return { ok: false, error: "AS6_MARKETPLACE_MODERATION_REQUEST_NOT_FOUND", pluginId };

  const published = publishAS6PublicMarketplacePlugin(request.plugin, {
    ...request.metadata,
    moderationStatus: "approved",
    reviewer,
  });

  marketplaceModerationQueue.set(pluginId, {
    ...request,
    status: "approved",
    reviewer,
    reviewedAt: new Date().toISOString(),
    published,
  });

  const audit = recordAS6MarketplaceAdminAudit("plugin.moderation.approved", { pluginId, reviewer, published });
  return { ok: published.ok, pluginId, published, audit };
}

export function rejectAS6MarketplaceModeration(pluginId, reason = "Rejected by AS6 Admin") {
  const request = marketplaceModerationQueue.get(pluginId);
  if (!request) return { ok: false, error: "AS6_MARKETPLACE_MODERATION_REQUEST_NOT_FOUND", pluginId };

  marketplaceModerationQueue.set(pluginId, {
    ...request,
    status: "rejected",
    reason,
    reviewedAt: new Date().toISOString(),
  });

  const audit = recordAS6MarketplaceAdminAudit("plugin.moderation.rejected", { pluginId, reason });
  return { ok: true, pluginId, reason, audit };
}

export function blockAS6MarketplacePlugin(pluginId, reason = "Blocked by AS6 Admin") {
  if (!pluginId) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_ID_MISSING" };

  marketplaceBlockedPlugins.set(pluginId, {
    pluginId,
    reason,
    blockedAt: new Date().toISOString(),
  });

  const audit = recordAS6MarketplaceAdminAudit("plugin.blocked", { pluginId, reason });
  return { ok: true, pluginId, reason, audit };
}

export function unblockAS6MarketplacePlugin(pluginId) {
  if (!marketplaceBlockedPlugins.has(pluginId)) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_NOT_BLOCKED", pluginId };
  marketplaceBlockedPlugins.delete(pluginId);
  const audit = recordAS6MarketplaceAdminAudit("plugin.unblocked", { pluginId });
  return { ok: true, pluginId, audit };
}

export function revokeAS6MarketplacePluginVersion(pluginId, version, reason = "Version revoked by AS6 Admin") {
  if (!pluginId || !version) return { ok: false, error: "AS6_MARKETPLACE_PLUGIN_VERSION_ID_MISSING" };

  const key = pluginId + "@" + version;
  marketplaceRevokedVersions.set(key, {
    pluginId,
    version,
    reason,
    revokedAt: new Date().toISOString(),
  });

  const audit = recordAS6MarketplaceAdminAudit("plugin.version.revoked", { pluginId, version, reason });
  return { ok: true, pluginId, version, reason, audit };
}

export function isAS6MarketplacePluginBlocked(pluginId) {
  return marketplaceBlockedPlugins.has(pluginId);
}

export function isAS6MarketplacePluginVersionRevoked(pluginId, version) {
  return marketplaceRevokedVersions.has(pluginId + "@" + version);
}

export function getAS6MarketplaceModerationQueue() {
  return [...marketplaceModerationQueue.values()];
}

export function getAS6MarketplaceBlockedPlugins() {
  return [...marketplaceBlockedPlugins.values()];
}

export function getAS6MarketplaceRevokedVersions() {
  return [...marketplaceRevokedVersions.values()];
}

export function registerAS6MarketplaceAdminSource(source = {}) {
  const result = registerAS6PublicMarketplaceSource(source);
  recordAS6MarketplaceAdminAudit("marketplace.source.registered", { source, result });
  return result;
}

export function getAS6MarketplaceAdministrationState() {
  return {
    version: AS6_MARKETPLACE_ADMINISTRATION_VERSION,
    marketplace: getAS6PublicMarketplaceState(),
    trustedPublishers: getAS6TrustedPublishers().map((publisher) => ({
      ...publisher,
      keyCount: getAS6TrustedPublisherKeys(publisher.id).length,
    })),
    moderationQueue: getAS6MarketplaceModerationQueue(),
    blockedPlugins: getAS6MarketplaceBlockedPlugins(),
    revokedVersions: getAS6MarketplaceRevokedVersions(),
    auditLog: getAS6MarketplaceAdminAuditLog(),
  };
}
