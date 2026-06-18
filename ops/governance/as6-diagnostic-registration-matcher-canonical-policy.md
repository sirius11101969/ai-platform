# AS6 Diagnostic Registration Matcher Canonical Policy

Rules:
- Diagnostic Registration must use exact path matching.
- Diagnostic Registry source is ops/registry/as6-diagnostic-registry.md.
- Coverage Registry source is ops/registry/as6-coverage-registry.md.
- Status Registry source is ops/status/diagnostic-status-registry.json diagnostics array.
- Every ops/bin/as6-diagnose-* executable must be git tracked, registered, covered and present in status registry.
- Matcher drift must fail before commit.
