# AS6 Real Backend Data Connectors V104

Base commit: f36373a.

## Connectors
- productionHealth: /api/health
- dashboard: /api/dashboard
- crm: /api/crm
- revenue: /api/revenue
- workforce: /api/workforce
- diagnostics: /api/diagnostics
- governance: /api/governance

## Store
- AS6_OPERATIONAL_STORE_V104
- freshnessTargetSeconds: 60
- cacheTtlSeconds: 45
- failover required for every source

## Failure classes
- BACKEND_DATA_CONNECTORS_MISSING
- BACKEND_CONNECTOR_SOURCE_UNAVAILABLE
- BACKEND_CONNECTOR_STALE_CACHE
- BACKEND_DATA_CONTRACT_DRIFT
- DASHBOARD_BACKEND_CONNECTOR_GAP
- CRM_BACKEND_CONNECTOR_GAP
- REVENUE_BACKEND_CONNECTOR_GAP
- WORKFORCE_BACKEND_CONNECTOR_GAP
- DIAGNOSTIC_BACKEND_CONNECTOR_GAP
- GOVERNANCE_BACKEND_CONNECTOR_GAP
- OPERATIONAL_STORE_MISSING
- CONNECTOR_FAILOVER_GAP
