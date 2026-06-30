import { useMemo, useState } from "react";
import {
  getAS6PluginRegistryState,
  getAS6RegisteredPluginIds,
  findAS6PluginInRegistry,
} from "../AS6PluginRegistry";
import {
  getAS6MarketplacePlugins,
  installAS6MarketplacePlugin,
} from "../AS6PluginMarketplace";
import {
  getAS6MarketplacePluginTrustSummary,
  getAS6MarketplaceTrustPolicy,
  getAS6MarketplaceTrustAuditLog,
} from "../AS6MarketplaceTrustPolicy";
import {
  fetchAS6RemoteMarketplaceCatalog,
  getAS6RemoteMarketplaceCatalogState,
  registerAS6RemoteMarketplaceCatalog,
} from "../AS6RemoteMarketplaceCatalog";
import {
  getAS6PluginRuntimeState,
  enableAS6Plugin,
  disableAS6Plugin,
  removeAS6Plugin,
} from "../AS6PluginRuntime";

export const AS6_MARKETPLACE_DEVELOPER_CONSOLE_VERSION = "P14";
export const AS6_REMOTE_CATALOG_UI_INTEGRATION_VERSION = "P26B";
export const AS6_MARKETPLACE_TRUST_UI_VERSION = "P29";

export function useAS6MarketplaceDeveloperConsole() {
  const [query, setQuery] = useState("");
  const [lastAction, setLastAction] = useState(null);
  const [remoteCatalog, setRemoteCatalog] = useState(() => getAS6RemoteMarketplaceCatalogState());
  const [remoteCatalogUrl, setRemoteCatalogUrl] = useState("");

  const registry = getAS6PluginRegistryState();
  const runtime = getAS6PluginRuntimeState();
  const marketplace = getAS6MarketplacePlugins();
  const trustPolicy = getAS6MarketplaceTrustPolicy();
  const trustAuditLog = getAS6MarketplaceTrustAuditLog();
  const registeredIds = getAS6RegisteredPluginIds();

  const filteredRegistry = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (registry.discovered || []).filter((item) => {
      if (!q) return true;
      return [item.id, item.title, item.publisher, item.status].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [query, registry]);

  async function syncRemoteCatalog(url = remoteCatalogUrl) {
    const result = await fetchAS6RemoteMarketplaceCatalog(url);
    if (result.catalog) registerAS6RemoteMarketplaceCatalog(result.catalog);
    setRemoteCatalog(getAS6RemoteMarketplaceCatalogState());
    setLastAction({ type: "remote_catalog_sync", result });
    return result;
  }

  function install(pluginId) {
    const result = installAS6MarketplacePlugin(pluginId);
    setLastAction({ type: "install", pluginId, result });
    return result;
  }

  function enable(pluginId) {
    const result = enableAS6Plugin(pluginId);
    setLastAction({ type: "enable", pluginId, result });
    return result;
  }

  function disable(pluginId) {
    const result = disableAS6Plugin(pluginId);
    setLastAction({ type: "disable", pluginId, result });
    return result;
  }

  function remove(pluginId) {
    const result = removeAS6Plugin(pluginId);
    setLastAction({ type: "remove", pluginId, result });
    return result;
  }

  return {
    query,
    setQuery,
    registry,
    runtime,
    marketplace,
    trustPolicy,
    trustAuditLog,
    remoteCatalog,
    remoteCatalogUrl,
    setRemoteCatalogUrl,
    syncRemoteCatalog,
    registeredIds,
    filteredRegistry,
    lastAction,
    findPlugin: findAS6PluginInRegistry,
    install,
    enable,
    disable,
    remove,
  };
}

export function AS6MarketplaceDeveloperConsole() {
  const consoleState = useAS6MarketplaceDeveloperConsole();

  return (
    <section className="as6-marketplace-console" data-as6-marketplace-console="enabled">
      <header className="as6-marketplace-console__header">
        <div>
          <p className="as6-marketplace-console__eyebrow">AS6 Platform V2</p>
          <h2>Marketplace / Developer Console</h2>
        </div>
        <strong>{consoleState.registry.count || 0} plugins</strong>
      </header>

      <div className="as6-marketplace-console__remote" data-as6-remote-catalog-ui="P26B">
        <div>
          <strong>Catalog source: {consoleState.remoteCatalog.source || "local"}</strong>
          <span>Synced: {consoleState.remoteCatalog.syncedAt || "not synced"}</span>
          {consoleState.remoteCatalog.error ? <span>Error: {consoleState.remoteCatalog.error}</span> : null}
        </div>
        <input
          aria-label="Remote catalog URL"
          value={consoleState.remoteCatalogUrl}
          onChange={(event) => consoleState.setRemoteCatalogUrl(event.target.value)}
          placeholder="Remote catalog URL..."
          className="as6-marketplace-console__search"
        />
        <button type="button" onClick={() => consoleState.syncRemoteCatalog()}>
          Sync remote catalog
        </button>
      </div>

      <input
        aria-label="Search plugins"
        value={consoleState.query}
        onChange={(event) => consoleState.setQuery(event.target.value)}
        placeholder="Search plugins..."
        className="as6-marketplace-console__search"
      />

      <div className="as6-marketplace-console__grid">
        {consoleState.filteredRegistry.map((item) => (
          <article key={item.id} className="as6-marketplace-console__card">
            <header>
              <h3>{item.title || item.id}</h3>
              <span>{item.status}</span>
            </header>
            <p>{item.publisher || "Unknown publisher"}</p>
            <p>Version: {item.version || "unknown"}</p>
            <p>SDK: {item.compatibility?.ok ? "compatible" : "incompatible"}</p>
            <p>Trust: {getAS6MarketplacePluginTrustSummary(item.plugin || item).trustStatus}</p>
            <p>Publisher: {getAS6MarketplacePluginTrustSummary(item.plugin || item).publisherId}</p>
            <p>Signature: {getAS6MarketplacePluginTrustSummary(item.plugin || item).signatureVerified ? "verified" : "not verified"}</p>
            <p>Policy: {consoleState.trustPolicy.mode}</p>
            <div className="as6-marketplace-console__actions">
              <button type="button" onClick={() => consoleState.enable(item.id)}>Enable</button>
              <button type="button" onClick={() => consoleState.disable(item.id)}>Disable</button>
              <button type="button" onClick={() => consoleState.remove(item.id)}>Remove</button>
            </div>
            {item.compatibility?.failures?.length ? (
              <ul>
                {item.compatibility.failures.map((failure) => <li key={failure}>{failure}</li>)}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      <section className="as6-marketplace-console__trust" data-as6-marketplace-trust-ui="P29">
        <strong>Trust policy: {consoleState.trustPolicy.mode}</strong>
        <span>Audit records: {consoleState.trustAuditLog.length}</span>
      </section>

      {consoleState.lastAction ? (
        <pre className="as6-marketplace-console__last-action">
          {JSON.stringify(consoleState.lastAction, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
