import { AS6_BACKEND_DATA_CONNECTORS_V104, getAS6BackendConnectorNames, createAS6ConnectorStatus } from "./as6BackendDataConnectors.js";
import { createAS6OperationalSnapshot, isAS6OperationalDataFresh } from "./as6LiveOperationalData.js";

const AS6_OPERATIONAL_CACHE = new Map();

export function createAS6OperationalStoreSnapshot(overrides = {}) {
  const base = createAS6OperationalSnapshot(overrides);
  const connectors = getAS6BackendConnectorNames().map((name) => createAS6ConnectorStatus(name));
  return {
    ...base,
    store: "AS6_OPERATIONAL_STORE_V104",
    cacheTtlSeconds: AS6_BACKEND_DATA_CONNECTORS_V104.cacheTtlSeconds,
    connectors,
    connectorHealth: connectors.every((item) => item.status === "READY") ? "PASS" : "DEGRADED"
  };
}

export function writeAS6OperationalCache(key, value) {
  AS6_OPERATIONAL_CACHE.set(key, { value, updatedAt: new Date().toISOString() });
  return AS6_OPERATIONAL_CACHE.get(key);
}

export function readAS6OperationalCache(key) {
  return AS6_OPERATIONAL_CACHE.get(key) || null;
}

export function isAS6StoreSnapshotFresh(snapshot) {
  return isAS6OperationalDataFresh(snapshot, AS6_BACKEND_DATA_CONNECTORS_V104.freshnessTargetSeconds);
}

export function getAS6OperationalStoreStatus() {
  const snapshot = createAS6OperationalStoreSnapshot();
  return {
    status: isAS6StoreSnapshotFresh(snapshot) ? "LIVE" : "STALE",
    connectorHealth: snapshot.connectorHealth,
    connectorCount: snapshot.connectors.length,
    generatedAt: snapshot.generatedAt
  };
}
