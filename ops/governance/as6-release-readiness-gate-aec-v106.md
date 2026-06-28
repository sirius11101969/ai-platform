# AS6 Release Readiness Gate AEC V106

Failure classes:
- AS6_RELEASE_GATE_DRIFT
- AS6_RELEASE_VALIDATION_BYPASS_RISK
- AS6_RELEASE_GOVERNANCE_COMPLETENESS_GAP
- AS6_RELEASE_REGISTRY_COMPLETENESS_GAP
- AS6_RELEASE_STATE_COMPLETENESS_GAP

AEC rules:
- Release readiness must run ops/bin/as6-release-gate.
- Release gate must run frontend build.
- Release gate must run ops/bin/as6-validate.
- Release gate must verify governance/registry/coverage/state/status completeness.
- Merge/release should not bypass the release gate.
