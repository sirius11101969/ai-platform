# AS6 CRM Analytics Render Owner Control V76
- CRMAnalyticsPanel must own analytics render execution through renderRevenuePanel in V76.
- Existing AiRevenueIntelligencePanel markup must stay unchanged and scoped in CRMPage for this step.
- CRMAnalyticsPanel must not add CSS wrapper markup.
- Children fallback is allowed for rollback compatibility only.
- Rollback is mandatory if diagnostics, build, route chunks, production health, or explicit scan fails.
