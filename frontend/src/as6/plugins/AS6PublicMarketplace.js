import { getAS6MarketplacePlugins, publishAS6MarketplacePlugin } from "./AS6PluginMarketplace";
import { getAS6RemoteMarketplaceCatalogPlugins, registerAS6RemoteMarketplaceCatalog } from "./AS6RemoteMarketplaceCatalog";
import { getAS6MarketplacePluginTrustSummary } from "./AS6MarketplaceTrustPolicy";

export const AS6_PUBLIC_MARKETPLACE_VERSION = "P31";

const publicMarketplaceSources = new Map([
  ["local", { id: "local", title: "Local Marketplace", type: "local", enabled: true }],
  ["official", { id: "official", title: "AS6 Official Marketplace", type: "remote", enabled: false }],
  ["enterprise", { id: "enterprise", title: "Enterprise Marketplace", type: "remote", enabled: false }],
]);

const publicMarketplaceMetadata = new Map();

export function registerAS6PublicMarketplaceSource(source = {}) {
  if (!source.id) return { ok: false, error: "AS6_PUBLIC_MARKETPLACE_SOURCE_ID_MISSING" };
  publicMarketplaceSources.set(source.id, {
    enabled: true,
    type: "remote",
    registeredAt: new Date().toISOString(),
    ...source,
  });
  return { ok: true, sourceId: source.id };
}

export function getAS6PublicMarketplaceSources() {
  return [...publicMarketplaceSources.values()];
}

export function publishAS6PublicMarketplacePlugin(plugin = {}, metadata = {}) {
  if (!plugin.id) return { ok: false, error: "AS6_PUBLIC_MARKETPLACE_PLUGIN_ID_MISSING" };

  publishAS6MarketplacePlugin(plugin);

  publicMarketplaceMetadata.set(plugin.id, {
    category: metadata.category || plugin.category || "general",
    tags: metadata.tags || plugin.tags || [],
    rating: metadata.rating || plugin.rating || 0,
    downloads: metadata.downloads || plugin.downloads || 0,
    updatedAt: metadata.updatedAt || plugin.updatedAt || new Date().toISOString(),
    source: metadata.source || plugin.source || "local",
    description: metadata.description || plugin.description || "",
    ...metadata,
  });

  return { ok: true, pluginId: plugin.id };
}

export function getAS6PublicMarketplacePlugins() {
  const marketplacePlugins = getAS6MarketplacePlugins();
  const remotePlugins = getAS6RemoteMarketplaceCatalogPlugins();

  const merged = new Map();

  for (const plugin of [...marketplacePlugins, ...remotePlugins]) {
    const metadata = publicMarketplaceMetadata.get(plugin.id) || {};
    merged.set(plugin.id, {
      ...plugin,
      publicMarketplace: {
        category: metadata.category || plugin.category || "general",
        tags: metadata.tags || plugin.tags || [],
        rating: metadata.rating || plugin.rating || 0,
        downloads: metadata.downloads || plugin.downloads || 0,
        updatedAt: metadata.updatedAt || plugin.updatedAt || plugin.publishedAt || null,
        source: metadata.source || plugin.source || "local",
        description: metadata.description || plugin.description || "",
        trust: getAS6MarketplacePluginTrustSummary(plugin),
      },
    });
  }

  return [...merged.values()];
}

export function searchAS6PublicMarketplacePlugins(query = "", filters = {}) {
  const q = query.trim().toLowerCase();
  const plugins = getAS6PublicMarketplacePlugins();

  return plugins
    .filter((plugin) => {
      const meta = plugin.publicMarketplace || {};
      const text = [plugin.id, plugin.title, plugin.publisher, meta.category, ...(meta.tags || [])].filter(Boolean).join(" ").toLowerCase();
      if (q && !text.includes(q)) return false;
      if (filters.category && meta.category !== filters.category) return false;
      if (filters.source && meta.source !== filters.source) return false;
      if (filters.trustedOnly && !meta.trust?.trusted) return false;
      return true;
    })
    .sort((left, right) => {
      const leftMeta = left.publicMarketplace || {};
      const rightMeta = right.publicMarketplace || {};
      if (filters.sort === "downloads") return (rightMeta.downloads || 0) - (leftMeta.downloads || 0);
      if (filters.sort === "rating") return (rightMeta.rating || 0) - (leftMeta.rating || 0);
      return String(rightMeta.updatedAt || "").localeCompare(String(leftMeta.updatedAt || ""));
    });
}

export function getAS6PublicMarketplaceCategories() {
  return [...new Set(getAS6PublicMarketplacePlugins().map((plugin) => plugin.publicMarketplace?.category || "general"))].sort();
}

export function syncAS6PublicMarketplaceCatalog(catalog = {}) {
  const registered = registerAS6RemoteMarketplaceCatalog(catalog);
  for (const plugin of catalog.plugins || []) {
    publishAS6PublicMarketplacePlugin(plugin, { source: catalog.source || "remote" });
  }
  return {
    ok: true,
    source: catalog.source || "remote",
    registered,
    pluginCount: (catalog.plugins || []).length,
  };
}

export function getAS6PublicMarketplaceState() {
  const plugins = getAS6PublicMarketplacePlugins();
  return {
    version: AS6_PUBLIC_MARKETPLACE_VERSION,
    sources: getAS6PublicMarketplaceSources(),
    categories: getAS6PublicMarketplaceCategories(),
    pluginCount: plugins.length,
    plugins,
  };
}
