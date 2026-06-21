# AS6 Real Page Component Migration V99

Base commit: 4620e8a.

## Target page families
- CRM: frontend/src/pages/CRMPage.jsx and crm/* components
- Dashboard: dashboard page family
- Revenue: revenue dashboard page family
- AI Workers: ai-workers page family

## Migration contract
- Use AS6UnifiedPageShell for new direct page rewrites.
- Use AS6UnifiedGlassCard for new card blocks.
- Use AS6UnifiedState for empty, loading and error states.
- Preserve V96/V97 global theme layers.
- V99 adds concrete component-level alignment until full direct JSX rewrites are performed.

## Coverage
- CRM components: migrated through V99 component shell layer.
- Dashboard components: migrated through V99 component shell layer.
- Revenue components: migrated through V99 component shell layer.
- AI Workers components: migrated through V99 component shell layer.

## Failure classes
- REAL_PAGE_COMPONENT_MIGRATION_MISSING
- CRM_COMPONENT_SHELL_DRIFT
- DASHBOARD_COMPONENT_SHELL_DRIFT
- REVENUE_COMPONENT_SHELL_DRIFT
- WORKERS_COMPONENT_SHELL_DRIFT
- COMPONENT_TABLE_DRIFT
- COMPONENT_FORM_DRIFT
- COMPONENT_STATE_DRIFT
