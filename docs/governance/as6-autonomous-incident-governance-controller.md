# AS6 Autonomous Incident Governance Controller

Purpose:

Create incident state, remediation plan, validation plan, and evidence bundle from all AS6 L7 gates.

Controller:

- ops/bin/as6-autonomous-incident-governance-controller

Result contract:

- AS6_INCIDENT_GOVERNANCE=PASS
- AS6_INCIDENT_GOVERNANCE=FAIL
- AS6_INCIDENT_GOVERNANCE_RESULT=OK
- AS6_INCIDENT_GOVERNANCE_RESULT=FAIL
- AS6_INCIDENT_STATE=<state>
- AS6_INCIDENT_DECISION=<decision>
- AS6_INCIDENT_ROOT_CAUSE=<root-cause>

Evidence:

- runtime/incident-governance/latest.out
- runtime/incident-governance/incident-state.env
- runtime/incident-governance/remediation-plan.md
- runtime/incident-governance/validation-plan.md
- runtime/incident-governance/evidence/
