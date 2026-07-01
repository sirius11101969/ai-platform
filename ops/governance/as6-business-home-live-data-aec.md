# AS6 Business Home Live Data AEC

Failure classes:
- AS6_BUSINESS_HOME_STATIC_DATA_DRIFT
- AS6_BUSINESS_HOME_LIVE_DATA_GAP
- AS6_BUSINESS_HOME_PLATFORM_STATUS_GAP
- AS6_BUSINESS_HOME_SAFE_FALLBACK_GAP

AEC rules:
- Business Home must use createAS6BusinessHomeLiveData.
- Business Home live data must include dashboard status, workspace, navigation and Marketplace GA.
- Business Home must keep safe fallback behavior for unavailable sources.
