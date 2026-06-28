# AS6 Control Runner CI Integration AEC V103

Failure classes:
- AS6_VALIDATE_ENTRYPOINT_DRIFT
- AS6_CI_VALIDATION_ENTRYPOINT_GAP
- AS6_LEGACY_CONTROL_CHAIN_USAGE_RISK
- AS6_DAG_VALIDATION_BYPASS_RISK

AEC rules:
- Canonical validation must use ops/bin/as6-validate.
- ops/bin/as6-validate must call ops/bin/as6-control-runner.
- CI/manual validation must prefer DAG runner over direct legacy chained controls.
- Legacy controls remain compatible, but should not be the main validation entrypoint.
