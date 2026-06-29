# AS6 Release Command AEC V120

Failure classes:
- AS6_RELEASE_COMMAND_DRIFT
- AS6_RELEASE_SEQUENCE_GAP
- AS6_RELEASE_EVIDENCE_GATE_BYPASS
- AS6_RELEASE_PARTIAL_EXECUTION_RISK

AEC rules:
- Release execution must use ops/bin/as6-release.
- Release command must run validate, release gate, evidence and evidence gate.
- Release command must emit AS6_RELEASE=PASS only after all gates pass.
