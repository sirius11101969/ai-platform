# AS6 EPIC021 — Design System Kanban Adoption

STAGE=AS6_EPIC021_DESIGN_SYSTEM_KANBAN_ADOPTION
PROJECT_READINESS=99%
BASE_EXPECTED=54db57e762b97116cc2b10fc56a223660e01d8d0
BASE_RESTORE_TAG=AS6_RESTORE_EPIC021_FILTERS_ADOPTION_VALIDATION_20260706T065130Z

## Goal

Migrate CRM Kanban visual shell to AS6 Design System without changing Kanban business logic.

## Adoption

CRMKanbanWorkspaceSurface now uses real AS6 Design System primitives:

- AS6Panel
- AS6Toolbar
- AS6Card
- AS6Badge
- AS6Button
- AS6EmptyState

CRMKanbanPanel still mounts CRMKanbanWorkspaceSurface and preserves CRMKanbanLegacyPanel with props forwarding.

## Policy

- Visual adoption only.
- No Kanban business logic migration.
- No parallel router or store.
- Legacy rollback path remains preserved.
- runtime/** is not committed.

## Diagnostic additions

- AS6_DESIGN_SYSTEM_KANBAN_ADOPTION_GAP

## Next stage

NEXT_STAGE=AS6_EPIC021_DESIGN_SYSTEM_KANBAN_ADOPTION_VALIDATION
