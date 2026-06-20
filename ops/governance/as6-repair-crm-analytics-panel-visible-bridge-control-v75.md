# AS6 Repair CRM Analytics Panel Visible Bridge Control V75
- Existing CRMAnalyticsPanel self-closing usage must be converted into an explicit children bridge wrapper.
- The closing CRMAnalyticsPanel tag must appear after AiRevenueIntelligencePanel.
- CRMAnalyticsPanel may render children only; no CSS wrapper markup may be added in V75.
- Rollback is mandatory if diagnostics, build, route chunks, or production health validation fail.
- Runtime artifacts must not be staged.
