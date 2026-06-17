# AS6 Self-Expanding Diagnostics Framework

Purpose:

Automatically convert every newly discovered failure class into diagnostics, coverage, registry, governance, prevention, AEC, state, and validation artifacts.

Mandatory pipeline:

Detection -> Classification -> Diagnostic Creation -> Coverage Registration -> Governance Registration -> Prevention Registration -> AEC Registration -> State Update -> Validation.

Rules:

- Every new failure class must create a diagnostic.
- Every new diagnostic must be registered in the diagnostic registry.
- Every new diagnostic must be registered in the coverage registry.
- Every new failure class must create a prevention control.
- Every new failure class must create an AEC rule.
- Every new failure class must update project state.
- Every generated diagnostic must be executable.
- Every generated diagnostic must be Git-tracked before closure.
- Every generated artifact must be validated before commit.
