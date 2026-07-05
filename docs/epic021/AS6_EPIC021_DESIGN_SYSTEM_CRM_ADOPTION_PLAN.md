# AS6 EPIC021 — Design System CRM Adoption Plan

STAGE=AS6_EPIC021_DESIGN_SYSTEM_CRM_ADOPTION_PLAN
PROJECT_READINESS=99%
BASE_EXPECTED=5fd06e33a4572b78af6895f09215e44dda4b3b73
BASE_RESTORE_TAG=AS6_RESTORE_EPIC021_DESIGN_SYSTEM_COMPONENT_LIBRARY_20260705T184519Z

## Goal

Prepare gradual CRM adoption of AS6 Design System without mass UI rewrite.

## Adoption order

1. CRM_ANALYTICS
2. CRM_FILTERS
3. CRM_KANBAN
4. CRM_FOLLOWUPS
5. CRM_ACTIVITIES
6. CRM_DEALS
7. CRM_COMPANIES
8. CRM_CONTACTS

## Component mapping

| Local UI pattern | Design System target |
|---|---|
| page card | AS6Card |
| KPI tile | AS6KPI |
| panel shell | AS6Panel |
| toolbar/header actions | AS6Toolbar |
| table/list | AS6DataTable |
| empty result | AS6EmptyState |
| loading placeholder | AS6LoadingState |
| error placeholder | AS6ErrorState |
| status label | AS6Badge |
| action button | AS6Button |

## Rules

- Migrate one CRM module per cycle.
- Do not change CRM business logic during visual adoption.
- Do not create parallel UI primitives.
- Do not commit runtime/**.
- Use safe git pathspec checks.
- Validate every module migration with Production Build and Architecture Guardian.

## Next stage

NEXT_STAGE=AS6_EPIC021_DESIGN_SYSTEM_ANALYTICS_ADOPTION
