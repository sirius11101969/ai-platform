import { createAS6OperationalStoreSnapshot, isAS6StoreSnapshotFresh, readAS6OperationalCache, writeAS6OperationalCache } from "./as6OperationalStore.js";

export const AS6_DASHBOARD_LIVE_DATA_V105 = {
  status: "ENABLED",
  source: "AS6_OPERATIONAL_STORE_V104",
  freshnessTargetSeconds: 60,
  fallback: "cached-dashboard-snapshot",
  widgets: ["productionHealth", "dashboard", "crm", "revenue", "workforce", "diagnostics", "governance"]
};

export function createAS6DashboardLiveSnapshot(overrides = {}) {
  const store = createAS6OperationalStoreSnapshot(overrides);
  const snapshot = {
    generatedAt: store.generatedAt,
    source: AS6_DASHBOARD_LIVE_DATA_V105.source,
    freshness: isAS6StoreSnapshotFresh(store) ? "fresh" : "stale",
    fallback: AS6_DASHBOARD_LIVE_DATA_V105.fallback,
    widgets: {
      productionHealth: store.productionHealth,
      dashboard: store.dashboard,
      crm: store.crm,
      revenue: store.revenue,
      workforce: store.workforce,
      diagnostics: store.diagnostics,
      governance: store.governance
    },
    connectorHealth: store.connectorHealth
  };
  writeAS6OperationalCache("dashboard-live-snapshot", snapshot);
  return snapshot;
}

export function getAS6DashboardCachedSnapshot() {
  return readAS6OperationalCache("dashboard-live-snapshot");
}

export function getAS6DashboardLiveDataStatus() {
  const snapshot = createAS6DashboardLiveSnapshot();
  return {
    status: snapshot.freshness === "fresh" ? "LIVE" : "STALE",
    source: snapshot.source,
    connectorHealth: snapshot.connectorHealth,
    widgetCount: Object.keys(snapshot.widgets).length,
    generatedAt: snapshot.generatedAt
  };
}
