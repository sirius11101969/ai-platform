# EPIC-006 PR-2 — Scenario Dependencies Governance

- Scenario dependencies must remain runtime-only unless persistence is explicitly approved.
- Every dependency-blocked scenario must expose a wait reason.
- Dependency cycles are merge-blocking.
- Dependencies must not mutate Workspace Storage V99.
- Dependencies must not mutate contextState.businessHome.
- Dependencies must not use localStorage or persistent storage.
