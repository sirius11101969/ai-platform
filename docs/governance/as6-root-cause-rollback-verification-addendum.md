# AS6 Root Cause Addendum: Rollback Verification

## ROLLBACK_PLAN_MISSING
Severity: high
Symptoms: a production change has no documented rollback plan.
Verification: run ops/bin/as6-autonomous-rollback-verification-controller.
Fix: add rollback plan and validate it.
Rollback: block deployment until rollback plan exists.
Prevention: enforce AEC_ROLLBACK_READINESS_REQUIRED_BEFORE_DEPLOYMENT.

## ROLLBACK_EVIDENCE_MISSING
Severity: high
Symptoms: rollback readiness is claimed but no evidence file exists.
Verification: check runtime/rollback-verification/latest.out.
Fix: run rollback verification controller and store evidence.
Rollback: block deployment until evidence exists.
Prevention: enforce AEC_ROLLBACK_VERIFICATION_EVIDENCE_REQUIRED.

## RESTORE_PROCEDURE_MISSING
Severity: high
Symptoms: backup exists but restore procedure is not documented or verifiable.
Verification: run restore readiness and rollback verification diagnostics.
Fix: document restore procedure and validate prerequisites.
Rollback: block deployment until restore procedure exists.
Prevention: enforce AEC_RESTORE_PATH_MUST_BE_VERIFIED.

## BACKUP_POLICY_GAP
Severity: high
Symptoms: backup artifact is missing, stale, too small, or lacks governance reference.
Verification: run backup integrity and rollback verification diagnostics.
Fix: create valid backup and register backup policy evidence.
Rollback: block deployment until valid backup exists.
Prevention: enforce AEC_BACKUP_POLICY_MUST_HAVE_EVIDENCE.

## ROLLBACK_VALIDATION_MISSING
Severity: high
Symptoms: rollback readiness is not validated by executable diagnostics.
Verification: run ops/bin/as6-diagnose-rollback-readiness and ops/bin/as6-autonomous-rollback-verification-controller.
Fix: add executable rollback validation.
Rollback: block deployment until validation passes.
Prevention: enforce rollback verification in change pipeline.
