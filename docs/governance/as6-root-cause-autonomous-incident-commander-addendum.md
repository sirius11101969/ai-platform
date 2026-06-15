# AS6 Root Cause Addendum: Autonomous Incident Commander

## INCIDENT_COMMANDER_EVIDENCE_MISSING
Severity: high
Symptoms: incident state is claimed but no commander evidence exists.
Verification: check runtime/incident-commander/latest.out.
Fix: run ops/bin/as6-autonomous-incident-commander.
Rollback: block autonomous incident actions.
Prevention: enforce AEC_INCIDENT_COMMANDER_REQUIRES_EVIDENCE.

## INCIDENT_CLASSIFICATION_FAILED
Severity: high
Symptoms: incident cannot be classified.
Verification: review incident commander evidence.
Fix: add classification rule and rerun diagnostics.
Rollback: escalate to human review.
Prevention: require incident classification before action.

## INCIDENT_ROOT_CAUSE_ROUTE_MISSING
Severity: high
Symptoms: incident has no root-cause route.
Verification: run root-cause router and governance diagnostics.
Fix: add route and register diagnostics/coverage.
Rollback: block auto repair.
Prevention: enforce AEC_INCIDENT_COMMANDER_REQUIRES_ROOT_CAUSE_ROUTE.

## INCIDENT_REPAIR_APPLY_BLOCK_REQUIRED
Severity: high
Symptoms: incident might trigger repair apply without approval.
Verification: inspect incident commander policy outputs.
Fix: enforce no-auto-repair-apply policy.
Rollback: block repair apply.
Prevention: enforce AEC_INCIDENT_COMMANDER_BLOCKS_AUTO_REPAIR_APPLY.

## INCIDENT_ESCALATION_REQUIRED
Severity: high
Symptoms: incident cannot be safely resolved by autonomous planning only.
Verification: inspect AS6_INCIDENT_DECISION output.
Fix: escalate to human approval.
Rollback: keep production unchanged.
Prevention: require escalation decision.
