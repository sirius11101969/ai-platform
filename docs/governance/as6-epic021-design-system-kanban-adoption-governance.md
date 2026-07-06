# AS6 EPIC021 Design System Kanban Adoption Governance

GOVERNANCE=AS6_EPIC021_DESIGN_SYSTEM_KANBAN_ADOPTION
STATUS=ACTIVE

Rules:

- Kanban adoption must be visual-only.
- CRMKanbanWorkspaceSurface must reuse AS6 Design System primitives.
- CRMKanbanPanel must preserve CRMKanbanLegacyPanel as rollback path.
- Kanban runtime, routing, and stores must not be duplicated.
- Kanban business logic must not move into the visual wrapper.
- runtime/** must not be committed.
