# EPIC-007 PR2 — Workspace Context Governance

- Workspace Context is the canonical runtime context for Workspace modules.
- Modules must use Workspace Context before creating local module context.
- Active Module must be represented through Workspace Context.
- Focus Context must be represented through Workspace Context.
- Right Rail state must be represented through Workspace Context.
- Workspace Actions and Events must be runtime-only unless persistence is explicitly approved.
- Duplicate Workspace contexts are architecture drift.
- Workspace Context must not mutate Workspace Storage V99.
- Workspace Context must not mutate contextState.businessHome.
