# AS6 Root Cause Addendum: Autonomous Change Approval

## CHANGE_APPROVAL_MISSING
Severity: high
Symptoms: production-changing action has no change approval.
Verification: run change approval controller.
Fix: generate approval evidence before change.
Rollback: block production apply.
Prevention: enforce AEC_CHANGE_REQUIRES_APPROVAL.

## CHANGE_APPROVAL_EVIDENCE_MISSING
Severity: high
Symptoms: approval is claimed but no evidence exists.
Verification: check runtime/change-approval/latest.out.
Fix: run change approval controller.
Rollback: block production apply.
Prevention: enforce AEC_CHANGE_REQUIRES_EVIDENCE.

## CHANGE_APPROVAL_WITHOUT_ROLLBACK
Severity: high
Symptoms: change approval without rollback verification.
Verification: inspect rollback gate evidence.
Fix: run rollback verification.
Rollback: block production apply.
Prevention: enforce AEC_CHANGE_REQUIRES_ROLLBACK_VERIFICATION.

## CHANGE_APPROVAL_WITHOUT_INCIDENT_LIFECYCLE
Severity: medium
Symptoms: change approval lacks incident lifecycle context.
Verification: inspect incident lifecycle evidence.
Fix: run incident lifecycle controller.
Rollback: block autonomous apply.
Prevention: enforce AEC_CHANGE_REQUIRES_INCIDENT_LIFECYCLE.

## CHANGE_APPROVAL_AUTO_APPLY_POLICY_VIOLATION
Severity: critical
Symptoms: change approval allows auto apply without human approval.
Verification: inspect AS6_CHANGE_APPROVAL_AUTO_APPLY.
Fix: set auto apply to NO and require human approval.
Rollback: immediately block apply.
Prevention: enforce AEC_CHANGE_AUTO_APPLY_FORBIDDEN_WITHOUT_HUMAN_APPROVAL.
