export const AS6_BACKEND_DATA_CONNECTORS_V104 = {
  status: "ENABLED",
  freshnessTargetSeconds: 60,
  cacheTtlSeconds: 45,
  connectors: {
    productionHealth: { endpoint: "/api/health", required: true, failover: "cached-health" },
    dashboard: { endpoint: "/api/dashboard", required: false, failover: "snapshot-dashboard" },
    crm: { endpoint: "/api/crm", required: false, failover: "snapshot-crm" },
    revenue: { endpoint: "/api/revenue", required: false, failover: "snapshot-revenue" },
    workforce: { endpoint: "/api/workforce", required: false, failover: "snapshot-workforce" },
    diagnostics: { endpoint: "/api/diagnostics", required: false, failover: "registry-diagnostics" },
    governance: { endpoint: "/api/governance", required: false, failover: "registry-governance" }
  }
};

export function getAS6BackendConnectorNames() {
  return Object.keys(AS6_BACKEND_DATA_CONNECTORS_V104.connectors);
}

export function getAS6BackendConnector(name) {
  return AS6_BACKEND_DATA_CONNECTORS_V104.connectors[name] || null;
}

export function createAS6ConnectorStatus(name, status = "READY") {
  const connector = getAS6BackendConnector(name);
  return {
    name,
    status,
    endpoint: connector?.endpoint || null,
    required: Boolean(connector?.required),
    failover: connector?.failover || "none",
    updatedAt: new Date().toISOString()
  };
}
