# AS6 Root Cause Addendum: Autonomous Governance Compliance

## CONTROLLER_WITHOUT_DIAGNOSTIC
Severity: high
Symptoms: controller exists without diagnostics registration.
Verification: run governance compliance controller.
Fix: add diagnostics document and registry entry.
Rollback: block controller promotion.
Prevention: enforce AEC_CONTROLLER_MUST_HAVE_DIAGNOSTIC.

## CONTROLLER_WITHOUT_COVERAGE
Severity: high
Symptoms: controller exists without coverage registration.
Verification: inspect coverage docs and registry.
Fix: add coverage document and registry entry.
Rollback: block controller promotion.
Prevention: enforce AEC_CONTROLLER_MUST_HAVE_COVERAGE.

## CONTROLLER_WITHOUT_REGISTRY
Severity: high
Symptoms: controller exists but is absent from registry.
Verification: inspect ops/registry.
Fix: add registry entry.
Rollback: block controller promotion.
Prevention: enforce AEC_CONTROLLER_MUST_HAVE_REGISTRY.

## CONTROLLER_WITHOUT_STATE_REGISTRATION
Severity: medium
Symptoms: controller exists but AS6_PROJECT_STATE is stale.
Verification: inspect docs/AS6_PROJECT_STATE.md.
Fix: update project state.
Rollback: block state promotion.
Prevention: enforce AEC_CONTROLLER_MUST_HAVE_STATE_REGISTRATION.

## CONTROLLER_WITHOUT_DIAGNOSE_ALL_INTEGRATION
Severity: medium
Symptoms: controller exists but is not called by as6-diagnose-all.
Verification: inspect ops/bin/as6-diagnose-all.
Fix: add diagnose-all integration.
Rollback: block autonomous promotion.
Prevention: enforce AEC_CONTROLLER_MUST_HAVE_DIAGNOSE_ALL_INTEGRATION.
