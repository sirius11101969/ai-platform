import { getAS6PublicMarketplaceState, searchAS6PublicMarketplacePlugins, syncAS6PublicMarketplaceCatalog } from "./AS6PublicMarketplace";
import { getAS6MarketplaceAdministrationState } from "./AS6MarketplaceAdministration";
import { importAS6MarketplacePluginPackage, exportAS6MarketplacePluginPackage } from "./AS6PluginMarketplace";
import { fetchAS6RemoteMarketplaceCatalog, getAS6RemoteMarketplaceCatalogState } from "./AS6RemoteMarketplaceCatalog";

export const AS6_MARKETPLACE_PRODUCTION_SERVICES_VERSION = "P34";

const productionServiceRegistry = new Map();
const productionCache = new Map();
const productionTelemetry = [];

function recordAS6MarketplaceProductionTelemetry(event, payload = {}) {
  const entry = {
    event,
    payload,
    createdAt: new Date().toISOString(),
  };
  productionTelemetry.unshift(entry);
  return entry;
}

export function registerAS6MarketplaceProductionService(service = {}) {
  if (!service.id) return { ok: false, error: "AS6_MARKETPLACE_PRODUCTION_SERVICE_ID_MISSING" };

  productionServiceRegistry.set(service.id, {
    status: "registered",
    registeredAt: new Date().toISOString(),
    ...service,
  });

  recordAS6MarketplaceProductionTelemetry("service.registered", { serviceId: service.id });
  return { ok: true, serviceId: service.id };
}

export function getAS6MarketplaceProductionServices() {
  return [...productionServiceRegistry.values()];
}

export function cacheAS6MarketplaceProductionValue(key, value, ttlMs = 300000) {
  if (!key) return { ok: false, error: "AS6_MARKETPLACE_CACHE_KEY_MISSING" };

  productionCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    cachedAt: new Date().toISOString(),
  });

  return { ok: true, key };
}

export function getAS6MarketplaceProductionCacheValue(key) {
  const item = productionCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    productionCache.delete(key);
    return null;
  }
  return item.value;
}

export function clearAS6MarketplaceProductionCache() {
  productionCache.clear();
  recordAS6MarketplaceProductionTelemetry("cache.cleared");
  return { ok: true };
}

export async function syncAS6MarketplaceProductionRemoteCatalog(url, options = {}) {
  const fetched = await fetchAS6RemoteMarketplaceCatalog(url, options);
  if (fetched.catalog) syncAS6PublicMarketplaceCatalog(fetched.catalog);

  cacheAS6MarketplaceProductionValue("remoteCatalogState", getAS6RemoteMarketplaceCatalogState());
  recordAS6MarketplaceProductionTelemetry("catalog.synced", { ok: fetched.ok, fallback: fetched.fallback || false });

  return fetched;
}

export function searchAS6MarketplaceProductionCatalog(query = "", filters = {}) {
  const cacheKey = "search:" + query + ":" + JSON.stringify(filters || {});
  const cached = getAS6MarketplaceProductionCacheValue(cacheKey);
  if (cached) return { ok: true, cached: true, results: cached };

  const results = searchAS6PublicMarketplacePlugins(query, filters);
  cacheAS6MarketplaceProductionValue(cacheKey, results);
  recordAS6MarketplaceProductionTelemetry("catalog.searched", { query, count: results.length });

  return { ok: true, cached: false, results };
}

export function downloadAS6MarketplaceProductionPackage(pluginId) {
  if (!pluginId) return { ok: false, error: "AS6_MARKETPLACE_DOWNLOAD_PLUGIN_ID_MISSING" };
  const result = exportAS6MarketplacePluginPackage(pluginId);
  recordAS6MarketplaceProductionTelemetry("package.download", { pluginId, ok: result.ok });
  return result;
}

export async function uploadAS6MarketplaceProductionPackage(input, options = {}) {
  const result = await importAS6MarketplacePluginPackage(input, options);
  recordAS6MarketplaceProductionTelemetry("package.upload", { ok: result.ok, pluginId: result.pluginId || null });
  return result;
}

export function getAS6MarketplaceProductionHealth() {
  const publicState = getAS6PublicMarketplaceState();
  const administrationState = getAS6MarketplaceAdministrationState();

  const health = {
    ok: true,
    version: AS6_MARKETPLACE_PRODUCTION_SERVICES_VERSION,
    services: productionServiceRegistry.size,
    cacheEntries: productionCache.size,
    pluginCount: publicState.pluginCount,
    sourceCount: publicState.sources.length,
    moderationQueueCount: administrationState.moderationQueue.length,
    blockedPluginCount: administrationState.blockedPlugins.length,
    revokedVersionCount: administrationState.revokedVersions.length,
    telemetryCount: productionTelemetry.length,
    checkedAt: new Date().toISOString(),
  };

  recordAS6MarketplaceProductionTelemetry("health.checked", health);
  return health;
}

export function getAS6MarketplaceProductionTelemetry() {
  return [...productionTelemetry];
}

export function bootstrapAS6MarketplaceProductionServices() {
  registerAS6MarketplaceProductionService({ id: "remote-catalog", title: "Remote Catalog Service", type: "catalog" });
  registerAS6MarketplaceProductionService({ id: "package-download", title: "Package Download Service", type: "download" });
  registerAS6MarketplaceProductionService({ id: "package-upload", title: "Package Upload Service", type: "upload" });
  registerAS6MarketplaceProductionService({ id: "search", title: "Marketplace Search Service", type: "search" });
  registerAS6MarketplaceProductionService({ id: "cache", title: "Marketplace Cache Service", type: "cache" });
  registerAS6MarketplaceProductionService({ id: "health", title: "Marketplace Health Service", type: "health" });
  registerAS6MarketplaceProductionService({ id: "telemetry", title: "Marketplace Telemetry Service", type: "telemetry" });

  return getAS6MarketplaceProductionState();
}

export function getAS6MarketplaceProductionState() {
  return {
    version: AS6_MARKETPLACE_PRODUCTION_SERVICES_VERSION,
    services: getAS6MarketplaceProductionServices(),
    health: getAS6MarketplaceProductionHealth(),
    telemetry: getAS6MarketplaceProductionTelemetry(),
  };
}
