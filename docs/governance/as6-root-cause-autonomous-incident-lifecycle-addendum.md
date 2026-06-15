# AS6 Root Cause Addendum: Autonomous Incident Lifecycle

## INCIDENT_NOT_REGISTERED
Severity: high
Symptoms: incident exists but is not registered.
Verification: check runtime/incidents/current.env.
Fix: run incident lifecycle controller.
Rollback: block incident automation.
Prevention: enforce AEC_INCIDENT_MUST_BE_REGISTERED.

## INCIDENT_WITHOUT_OWNER
Severity: high
Symptoms: incident has no accountable owner.
Verification: inspect AS6_INCIDENT_OWNER.
Fix: assign owner.
Rollback: block incident closure.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_OWNER.

## INCIDENT_WITHOUT_STATE
Severity: high
Symptoms: incident lacks lifecycle state.
Verification: inspect AS6_INCIDENT_STATE.
Fix: write incident state.
Rollback: block incident workflow.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_STATE.

## INCIDENT_WITHOUT_CLOSURE
Severity: high
Symptoms: closed incident has no closure evidence.
Verification: check runtime/incidents/closure.md.
Fix: generate closure evidence.
Rollback: reopen incident.
Prevention: enforce AEC_INCIDENT_MUST_HAVE_CLOSURE.

## INCIDENT_STATE_TRANSITION_DRIFT
Severity: high
Symptoms: incident moved through invalid state transition.
Verification: check transition table and history.
Fix: correct incident state and rerun lifecycle controller.
Rollback: return to previous valid state.
Prevention: enforce AEC_INCIDENT_TRANSITION_MUST_BE_VALID.
