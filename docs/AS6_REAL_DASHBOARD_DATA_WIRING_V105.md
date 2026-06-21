# AS6 Real Dashboard Data Wiring V105

Base commit: 0be019b.

## Dashboard source
- AS6_OPERATIONAL_STORE_V104
- AS6_DASHBOARD_LIVE_DATA_V105

## Widgets
- productionHealth
- dashboard
- crm
- revenue
- workforce
- diagnostics
- governance

## Contract
- Dashboard must read from AS6OperationalStore.
- Dashboard must expose generatedAt.
- Dashboard must expose freshness.
- Dashboard must provide cached fallback.
- Dashboard must expose connectorHealth.
- Dashboard must expose widgetCount.

## Failure classes
- DASHBOARD_DATA_WIRING_MISSING
- DASHBOARD_OPERATIONAL_STORE_GAP
- DASHBOARD_STALE_DATA_GAP
- DASHBOARD_CACHE_FALLBACK_GAP
- DASHBOARD_WIDGET_DATA_DRIFT
- DASHBOARD_FRESHNESS_BADGE_MISSING
- DASHBOARD_CONNECTOR_HEALTH_GAP
- DASHBOARD_LIVE_SNAPSHOT_CONTRACT_DRIFT
