# EPIC-006 PR-3 — Execution Orchestrator Governance

- Execution Orchestrator must remain runtime-only unless persistence is explicitly approved.
- Scenario selection must bind priority, dependencies and governance.
- Every non-selection must expose a reason or fallback.
- Orchestrator must not mutate Workspace Storage V99.
- Orchestrator must not mutate contextState.businessHome.
- Orchestrator must not use localStorage or persistent storage.
