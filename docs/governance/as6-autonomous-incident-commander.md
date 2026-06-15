# AS6 Autonomous Incident Commander

Purpose:

Classify incidents, collect evidence, verify root-cause routing, and decide whether AS6 should observe, block, or escalate.

Controller:

- ops/bin/as6-autonomous-incident-commander

Result contract:

- AUTONOMOUS_INCIDENT_COMMANDER=PASS
- AUTONOMOUS_INCIDENT_COMMANDER=FAIL
- AS6_AUTONOMOUS_INCIDENT_COMMANDER_RESULT=OK
- AS6_AUTONOMOUS_INCIDENT_COMMANDER_RESULT=FAIL
- AS6_INCIDENT_CLASS=<class>
- AS6_INCIDENT_DECISION=<decision>

Policy:

- classifies incidents
- collects evidence
- validates root-cause route readiness
- does not auto-apply repairs
- requires human approval for repair apply

Evidence:

- runtime/incident-commander/latest.out
