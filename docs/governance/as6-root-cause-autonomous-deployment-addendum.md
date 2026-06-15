# AS6 Root Cause Addendum: Autonomous Deployment

## DEPLOYMENT_PLAN_MISSING
Severity: high
Symptoms: deployment is requested without a clear deployment plan.
Verification: run ops/bin/as6-autonomous-deployment-controller.
Fix: add deployment plan and rerun controller.
Rollback: block deployment.
Prevention: enforce AEC_DEPLOYMENT_EVIDENCE_REQUIRED.

## DEPLOYMENT_EVIDENCE_MISSING
Severity: high
Symptoms: deployment gates are claimed but no evidence exists.
Verification: check runtime/deployment-controller/latest.out.
Fix: run deployment controller and store evidence.
Rollback: block deployment.
Prevention: enforce AEC_DEPLOYMENT_EVIDENCE_REQUIRED.

## DEPLOYMENT_PRECONDITION_FAILED
Severity: high
Symptoms: deployment precondition gate failed.
Verification: review deployment controller evidence.
Fix: repair failed precondition and rerun diagnostics.
Rollback: block deployment.
Prevention: enforce deployment gate sequence.

## DEPLOYMENT_ROLLBACK_BINDING_MISSING
Severity: high
Symptoms: deployment is not bound to verified rollback.
Verification: run rollback verification controller.
Fix: require rollback verification before deployment.
Rollback: block deployment.
Prevention: enforce AEC_DEPLOYMENT_REQUIRES_ROLLBACK_VERIFICATION.

## DEPLOYMENT_GOVERNANCE_GAP
Severity: high
Symptoms: deployment controller is not registered in governance, coverage, or diagnostics.
Verification: check ops/registry and docs/coverage.
Fix: register controller in all registries.
Rollback: block autonomous deployment.
Prevention: enforce governance registration.
