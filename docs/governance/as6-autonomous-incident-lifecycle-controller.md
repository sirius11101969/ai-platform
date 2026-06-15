# AS6 Autonomous Incident Lifecycle Controller

Purpose:

Manage incident registry, lifecycle state machine, transition validation, closure evidence, and root-cause binding.

Controller:

- ops/bin/as6-autonomous-incident-lifecycle-controller

State machine:

- NEW
- TRIAGED
- CONFIRMED
- MITIGATED
- VALIDATED
- CLOSED
- REOPENED

Result contract:

- AS6_INCIDENT_LIFECYCLE=PASS
- AS6_INCIDENT_LIFECYCLE=FAIL
- AS6_INCIDENT_LIFECYCLE_RESULT=OK
- AS6_INCIDENT_LIFECYCLE_RESULT=FAIL
- AS6_INCIDENT_LIFECYCLE_STATE=<state>

Evidence:

- runtime/incidents/current.env
- runtime/incidents/history.log
- runtime/incidents/closure.md
- runtime/incident-lifecycle/latest.out
- runtime/incident-lifecycle/evidence/
