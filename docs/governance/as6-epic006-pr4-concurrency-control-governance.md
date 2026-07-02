# EPIC-006 PR-4 — Concurrency Control Governance

- Concurrency control must remain runtime-only unless persistence is explicitly approved.
- Conflicting scenario launches must be blocked.
- Every conflict must expose a human-readable reason.
- Every blocked launch must expose wait decision or fallback.
- Concurrency control must not mutate Workspace Storage V99.
- Concurrency control must not mutate contextState.businessHome.
- Concurrency control must not use localStorage or persistent storage.
