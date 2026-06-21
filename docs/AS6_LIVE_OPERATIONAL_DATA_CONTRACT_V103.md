# AS6 Live Operational Data Contract V103

Base commit: ddcf84a.

## Sources
- productionHealth: /api/health
- dashboard
- crm
- revenue
- workforce
- diagnostics
- governance

## Contract
- generatedAt is required.
- freshnessTargetSeconds is 60.
- every source must expose status and updatedAt.
- stale data must be detected.
- unavailable data source must degrade safely.
- UI must show data freshness.

## Failure classes
- LIVE_OPERATIONAL_DATA_PROVIDER_MISSING
- OPERATIONAL_DATA_STALE
- OPERATIONAL_DATA_SOURCE_UNAVAILABLE
- OPERATIONAL_DATA_CONTRACT_DRIFT
- DASHBOARD_LIVE_DATA_GAP
- CRM_LIVE_DATA_GAP
- REVENUE_LIVE_DATA_GAP
- WORKFORCE_LIVE_DATA_GAP
- DIAGNOSTIC_LIVE_DATA_GAP
- GOVERNANCE_LIVE_DATA_GAP
