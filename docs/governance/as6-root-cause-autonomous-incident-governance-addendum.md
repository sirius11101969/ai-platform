# AS6 Root Cause Addendum: Autonomous Incident Governance

## INCIDENT_WITHOUT_ROOT_CAUSE
Severity: high
Symptoms: incident exists but no root cause is bound.
Verification: run incident governance controller.
Fix: bind incident to root-cause route.
Rollback: block repair apply.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_ROOT_CAUSE.

## INCIDENT_WITHOUT_REMEDIATION_PLAN
Severity: high
Symptoms: incident exists without remediation plan.
Verification: check runtime/incident-governance/remediation-plan.md.
Fix: generate remediation plan.
Rollback: block repair apply.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_REMEDIATION.

## INCIDENT_WITHOUT_VALIDATION_PLAN
Severity: high
Symptoms: incident exists without validation plan.
Verification: check runtime/incident-governance/validation-plan.md.
Fix: generate validation plan.
Rollback: block repair apply.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_VALIDATION.

## INCIDENT_WITHOUT_EVIDENCE
Severity: high
Symptoms: incident state exists without evidence bundle.
Verification: check runtime/incident-governance/evidence.
Fix: generate evidence bundle.
Rollback: block repair apply.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_EVIDENCE.

## INCIDENT_STATE_DRIFT
Severity: high
Symptoms: incident state conflicts with current diagnostics.
Verification: rerun incident governance controller.
Fix: regenerate incident state.
Rollback: block automation.
Prevention: enforce AEC_INCIDENT_MUST_BE_REGISTERED.
