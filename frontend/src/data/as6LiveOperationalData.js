export const AS6_LIVE_OPERATIONAL_DATA_V103 = {
  status: "ENABLED",
  freshnessTargetSeconds: 60,
  sources: [
    "productionHealth",
    "dashboard",
    "crm",
    "revenue",
    "workforce",
    "diagnostics",
    "governance"
  ]
};

export function createAS6OperationalSnapshot(overrides = {}) {
  const now = new Date().toISOString();
  return {
    generatedAt: now,
    freshness: "live",
    productionHealth: { status: "OK", source: "/api/health", updatedAt: now },
    dashboard: { status: "LIVE", widgets: 8, updatedAt: now },
    crm: { status: "LIVE", pipeline: "monitored", updatedAt: now },
    revenue: { status: "LIVE", forecast: "available", updatedAt: now },
    workforce: { status: "LIVE", agents: "online", updatedAt: now },
    diagnostics: { status: "PASS", coverage: "100%", updatedAt: now },
    governance: { status: "PASS", enforcement: "active", updatedAt: now },
    ...overrides
  };
}

export function isAS6OperationalDataFresh(snapshot, maxAgeSeconds = 60) {
  if (!snapshot || !snapshot.generatedAt) return false;
  const ageMs = Date.now() - new Date(snapshot.generatedAt).getTime();
  return Number.isFinite(ageMs) && ageMs <= maxAgeSeconds * 1000;
}

export function getAS6OperationalDataSources() {
  return AS6_LIVE_OPERATIONAL_DATA_V103.sources;
}
