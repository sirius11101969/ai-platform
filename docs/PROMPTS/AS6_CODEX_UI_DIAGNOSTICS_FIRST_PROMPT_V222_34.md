# AS6 Codex Prompt: UI Diagnostics First

Connect to the project server/repository and perform AS6 Diagnostics First before any UI change.

Required sequence:
Diagnostics -> Root Cause -> Structure Check -> Render Path Check -> CSS Import Check -> Dist Bundle Check -> Public Bundle Check -> DOM Evidence Check -> Plan -> Change -> Re-Diagnostics -> Diagnostic Artifacts -> Failure Classes -> AEC Rules -> Registry -> Coverage -> Governance -> State -> Detected Errors -> Validation -> Commit -> Push.

Hard rules:
- Do not edit UI until the active rendered component is proven.
- Search all frontend source for visible text, markers and component names.
- Prove CSS file is imported before editing it.
- Prove changes appear in frontend/dist.
- Prove changes appear in Docker nginx container.
- Prove changes appear in public HTTPS asset.
- Save diagnostics into runtime.
- Register all new failures in docs/REGISTRY and ops/status.
- Commit and push only after validation.
