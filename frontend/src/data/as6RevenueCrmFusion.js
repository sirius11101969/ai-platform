import { createAS6OperationalStoreSnapshot, isAS6StoreSnapshotFresh, writeAS6OperationalCache, readAS6OperationalCache } from "./as6OperationalStore.js";
import { createAS6CrmLiveSnapshot } from "./as6CrmLiveData.js";

export const AS6_REVENUE_CRM_FUSION_V107 = {
  status: "ENABLED",
  source: "AS6_OPERATIONAL_STORE_V104 + AS6_CRM_LIVE_DATA_V106",
  freshnessTargetSeconds: 60,
  fallback: "cached-revenue-crm-fusion-snapshot",
  feeds: ["crmPipeline", "crmDeals", "crmConversion", "revenueForecast", "revenueProjection", "executiveRevenuePulse"]
};

export function createAS6RevenueCrmFusionSnapshot(overrides = {}) {
  const store = createAS6OperationalStoreSnapshot(overrides);
  const crm = createAS6CrmLiveSnapshot(overrides);
  const now = store.generatedAt;
  const snapshot = {
    generatedAt: now,
    source: AS6_REVENUE_CRM_FUSION_V107.source,
    freshness: isAS6StoreSnapshotFresh(store) ? "fresh" : "stale",
    fallback: AS6_REVENUE_CRM_FUSION_V107.fallback,
    connectorHealth: store.connectorHealth,
    crmPipeline: crm.pipeline,
    crmDeals: crm.deals,
    crmConversion: { status: "LIVE", source: "crm-pipeline", updatedAt: now },
    revenueForecast: { status: "LIVE", source: "crm-pipeline+revenue", updatedAt: now },
    revenueProjection: { status: "LIVE", source: "crm-deals+conversion", updatedAt: now },
    executiveRevenuePulse: { status: "LIVE", source: "revenue-crm-fusion", updatedAt: now }
  };
  writeAS6OperationalCache("revenue-crm-fusion-snapshot", snapshot);
  return snapshot;
}

export function getAS6RevenueCrmFusionCachedSnapshot() {
  return readAS6OperationalCache("revenue-crm-fusion-snapshot");
}

export function getAS6RevenueCrmFusionStatus() {
  const snapshot = createAS6RevenueCrmFusionSnapshot();
  return {
    status: snapshot.freshness === "fresh" ? "LIVE" : "STALE",
    source: snapshot.source,
    connectorHealth: snapshot.connectorHealth,
    feedCount: AS6_REVENUE_CRM_FUSION_V107.feeds.length,
    generatedAt: snapshot.generatedAt
  };
}
