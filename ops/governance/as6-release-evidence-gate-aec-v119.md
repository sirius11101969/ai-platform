# AS6 Release Evidence Gate AEC V119

Failure classes:
- AS6_RELEASE_EVIDENCE_GATE_DRIFT
- AS6_RELEASE_EVIDENCE_MISSING
- AS6_RELEASE_EVIDENCE_VALIDATE_PASS_MISSING
- AS6_RELEASE_EVIDENCE_RELEASE_GATE_PASS_MISSING
- AS6_RELEASE_EVIDENCE_BUILD_PASS_MISSING
- AS6_RELEASE_EVIDENCE_READINESS_MISSING

AEC rules:
- Release evidence must exist before final release readiness.
- Evidence must include AS6_VALIDATE PASS.
- Evidence must include AS6_RELEASE_GATE PASS.
- Evidence must include BUILD PASS.
- Evidence must include Target, Head and Readiness.
