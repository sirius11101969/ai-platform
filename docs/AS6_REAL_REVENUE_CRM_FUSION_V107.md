# AS6 Real Revenue CRM Fusion V107

Base commit: f942f00.

## Fusion sources
- AS6_OPERATIONAL_STORE_V104
- AS6_CRM_LIVE_DATA_V106
- AS6_REVENUE_CRM_FUSION_V107

## Feeds
- CRM Pipeline -> Revenue Forecast
- CRM Deals -> Revenue Projection
- CRM Conversion -> Revenue KPI
- Revenue Forecast -> Executive Revenue Pulse
- Revenue Projection -> Mission Control Revenue Feed

## Contract
- Revenue must consume CRM pipeline.
- Revenue must consume CRM deals.
- Revenue must expose forecast freshness.
- Revenue must expose projection freshness.
- Executive Revenue Pulse must expose CRM fusion source.
- Cached fallback must exist.

## Failure classes
- REVENUE_CRM_FUSION_MISSING
- CRM_PIPELINE_REVENUE_FEED_GAP
- CRM_DEALS_REVENUE_PROJECTION_GAP
- CRM_CONVERSION_REVENUE_KPI_GAP
- REVENUE_FORECAST_FRESHNESS_GAP
- REVENUE_CRM_CONSISTENCY_DRIFT
- EXECUTIVE_REVENUE_PULSE_GAP
- REVENUE_CRM_FUSION_CACHE_GAP
- REVENUE_CRM_FUSION_CONTRACT_DRIFT
