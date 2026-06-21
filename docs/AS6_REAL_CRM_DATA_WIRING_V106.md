# AS6 Real CRM Data Wiring V106

Base commit: f655ea7.

## CRM source
- AS6_OPERATIONAL_STORE_V104
- AS6_CRM_LIVE_DATA_V106

## Widgets
- pipeline
- leads
- deals
- activities
- sla
- aiRecommendations
- connectorHealth

## Contract
- CRM must read from AS6OperationalStore.
- CRM must expose generatedAt.
- CRM must expose freshness.
- CRM must provide cached fallback.
- CRM must expose connectorHealth.
- CRM must expose pipeline, leads, deals, activities, SLA and AI recommendations.

## Failure classes
- CRM_DATA_WIRING_MISSING
- CRM_OPERATIONAL_STORE_GAP
- CRM_PIPELINE_DATA_DRIFT
- CRM_SLA_DATA_GAP
- CRM_LEAD_STATUS_DRIFT
- CRM_ACTIVITY_DATA_GAP
- CRM_AI_RECOMMENDATION_DATA_GAP
- CRM_CONNECTOR_HEALTH_GAP
- CRM_FRESHNESS_BADGE_MISSING
- CRM_LIVE_SNAPSHOT_CONTRACT_DRIFT
