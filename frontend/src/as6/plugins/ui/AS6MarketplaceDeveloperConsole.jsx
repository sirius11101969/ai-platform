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
  getAS6PluginRuntimeState,
  enableAS6Plugin,
  disableAS6Plugin,
  removeAS6Plugin,
} from "../AS6PluginRuntime";

export const AS6_MARKETPLACE_DEVELOPER_CONSOLE_VERSION = "P14";

export function useAS6MarketplaceDeveloperConsole() {
  const [query, setQuery] = useState("");
  const [lastAction, setLastAction] = useState(null);

  const registry = getAS6PluginRegistryState();
  const runtime = getAS6PluginRuntimeState();
  const marketplace = getAS6MarketplacePlugins();
  const registeredIds = getAS6RegisteredPluginIds();

  const filteredRegistry = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (registry.discovered || []).filter((item) => {
      if (!q) return true;
      return [item.id, item.title, item.publisher, item.status].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [query, registry]);

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

      {consoleState.lastAction ? (
        <pre className="as6-marketplace-console__last-action">
          {JSON.stringify(consoleState.lastAction, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
