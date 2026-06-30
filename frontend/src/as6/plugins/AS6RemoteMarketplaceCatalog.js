import { getAS6MarketplacePlugins, publishAS6MarketplacePlugin } from "./AS6PluginMarketplace";

export const AS6_REMOTE_MARKETPLACE_CATALOG_VERSION = "P26A";
export const AS6_REMOTE_MARKETPLACE_CATALOG_DEFAULT_TIMEOUT_MS = 5000;

let remoteCatalogCache = {
  source: "local",
  syncedAt: null,
  plugins: [],
  error: null,
};

export function getAS6RemoteMarketplaceCatalogState() {
  return {
    version: AS6_REMOTE_MARKETPLACE_CATALOG_VERSION,
    ...remoteCatalogCache,
  };
}

export function normalizeAS6RemoteMarketplaceCatalog(payload = {}) {
  const plugins = Array.isArray(payload.plugins) ? payload.plugins : [];
  return {
    source: payload.source || "remote",
    syncedAt: payload.syncedAt || new Date().toISOString(),
    plugins: plugins.filter((plugin) => plugin?.id && plugin?.version),
    error: null,
  };
}

export async function fetchAS6RemoteMarketplaceCatalog(url, options = {}) {
  if (!url) {
    remoteCatalogCache = {
      source: "local",
      syncedAt: new Date().toISOString(),
      plugins: getAS6MarketplacePlugins(),
      error: "AS6_REMOTE_MARKETPLACE_CATALOG_URL_MISSING",
    };
    return { ok: false, fallback: true, catalog: remoteCatalogCache };
  }

  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutMs = options.timeoutMs || AS6_REMOTE_MARKETPLACE_CATALOG_DEFAULT_TIMEOUT_MS;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    const response = await fetch(url, { signal: controller?.signal });
    if (timer) clearTimeout(timer);

    if (!response.ok) throw new Error("AS6_REMOTE_MARKETPLACE_CATALOG_HTTP_" + response.status);

    remoteCatalogCache = normalizeAS6RemoteMarketplaceCatalog(await response.json());
    return { ok: true, catalog: remoteCatalogCache };
  } catch (error) {
    remoteCatalogCache = {
      source: "local",
      syncedAt: new Date().toISOString(),
      plugins: getAS6MarketplacePlugins(),
      error: error?.message || "AS6_REMOTE_MARKETPLACE_CATALOG_FETCH_FAILED",
    };
    return { ok: false, fallback: true, catalog: remoteCatalogCache };
  }
}

export function registerAS6RemoteMarketplaceCatalog(catalog = remoteCatalogCache) {
  for (const plugin of catalog.plugins || []) {
    publishAS6MarketplacePlugin({
      source: catalog.source || "remote",
      ...plugin,
    });
  }

  return {
    ok: true,
    source: catalog.source || "remote",
    registered: (catalog.plugins || []).length,
  };
}

export function getAS6RemoteMarketplaceCatalogPlugins() {
  return remoteCatalogCache.plugins || [];
}
