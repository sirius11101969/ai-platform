# AS6 Fast Final Green Proof Policy

Rule:

Final production readiness proof must be fast, deterministic and operator-visible.

Required behavior:

- Validate insertion points.
- Validate diagnostic status registry.
- Validate diagnostic registration.
- Validate autonomous controller cluster.
- Validate generated Python contracts.
- Validate reboot evidence self-heal.
- Do not recursively run full diagnose-all inside the proof gate.
- Use heartbeat wrapper for operator visibility.
- Full diagnose-all remains available, but fast final green proof is the reliable commit gate after long-run SSH reset drift.
