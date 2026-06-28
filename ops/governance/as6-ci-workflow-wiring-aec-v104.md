# AS6 CI Workflow Wiring AEC V104

Failure classes:
- AS6_CI_WORKFLOW_WIRING_DRIFT
- AS6_VALIDATE_CI_BYPASS_RISK
- AS6_PR_VALIDATION_GAP
- AS6_CI_BUILD_STEP_GAP
- AS6_DAG_VALIDATION_CI_GAP

AEC rules:
- GitHub Actions must run ops/bin/as6-validate.
- CI must run frontend build before DAG validation.
- Pull requests must trigger AS6 validation.
- Legacy controls must not replace the canonical DAG validate entrypoint in CI.
