import { createAS6OperationalStoreSnapshot, isAS6StoreSnapshotFresh, readAS6OperationalCache, writeAS6OperationalCache } from "./as6OperationalStore.js";

export const AS6_CRM_LIVE_DATA_V106 = {
  status: "ENABLED",
  source: "AS6_OPERATIONAL_STORE_V104",
  freshnessTargetSeconds: 60,
  fallback: "cached-crm-snapshot",
  widgets: ["pipeline", "leads", "deals", "activities", "sla", "aiRecommendations", "connectorHealth"]
};

export function createAS6CrmLiveSnapshot(overrides = {}) {
  const store = createAS6OperationalStoreSnapshot(overrides);
  const now = store.generatedAt;
  const snapshot = {
    generatedAt: now,
    source: AS6_CRM_LIVE_DATA_V106.source,
    freshness: isAS6StoreSnapshotFresh(store) ? "fresh" : "stale",
    fallback: AS6_CRM_LIVE_DATA_V106.fallback,
    connectorHealth: store.connectorHealth,
    pipeline: { status: "LIVE", source: store.crm?.source || "AS6_OPERATIONAL_STORE_V104", updatedAt: now },
    leads: { status: "LIVE", open: "monitored", updatedAt: now },
    deals: { status: "LIVE", pipeline: "monitored", updatedAt: now },
    activities: { status: "LIVE", cadence: "monitored", updatedAt: now },
    sla: { status: "LIVE", risk: "tracked", updatedAt: now },
    aiRecommendations: { status: "LIVE", mode: "assistive", updatedAt: now }
  };
  writeAS6OperationalCache("crm-live-snapshot", snapshot);
  return snapshot;
}

export function getAS6CrmCachedSnapshot() {
  return readAS6OperationalCache("crm-live-snapshot");
}

export function getAS6CrmLiveDataStatus() {
  const snapshot = createAS6CrmLiveSnapshot();
  return {
    status: snapshot.freshness === "fresh" ? "LIVE" : "STALE",
    source: snapshot.source,
    connectorHealth: snapshot.connectorHealth,
    widgetCount: AS6_CRM_LIVE_DATA_V106.widgets.length,
    generatedAt: snapshot.generatedAt
  };
}
