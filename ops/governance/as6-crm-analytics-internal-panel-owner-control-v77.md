# AS6 CRM Analytics Internal Panel Owner Control V77
- CRMAnalyticsPanel must own the first internal analytics UI component in V77.
- CRMPage may keep the legacy revenue component only for rollback compatibility in this step.
- Existing DOM class names must be preserved.
- No runtime artifacts may be staged.
- Rollback is mandatory if diagnostics, build, route chunks, production health, or explicit scan fails.
