# AS6 Build Once Validation AEC V117

Failure classes:
- AS6_BUILD_ONCE_VALIDATION_DRIFT
- AS6_DUPLICATE_BUILD_VALIDATION_RISK
- AS6_RELEASE_GATE_BUILD_BYPASS_RISK

AEC rules:
- Release Gate owns build validation.
- Stage scripts should not run an extra build after successful release gate.
- Build evidence must be available from release gate logs.
