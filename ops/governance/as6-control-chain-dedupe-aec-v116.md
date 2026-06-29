# AS6 Control Chain Dedupe AEC V116

Failure classes:
- AS6_CONTROL_DIRECT_CHAIN_DRIFT
- AS6_NESTED_RELEASE_GATE_DRIFT
- AS6_VALIDATION_DUPLICATION_RISK
- AS6_CONTROL_RUNNER_BYPASS_RISK
- AS6_MANIFEST_DEPENDENCY_GAP

AEC rules:
- Controls must not call previous controls directly.
- Controls must not call release gate internally.
- Dependency order must be defined in as6-control-dependency-manifest.tsv.
- as6-validate and as6-release-gate are the canonical validation entrypoints.
