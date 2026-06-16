# AS6 Autonomous Governance Compliance Controller

Purpose:

Verify that every autonomous controller has diagnostics, coverage, governance docs, registry registration, project state registration, and diagnose-all integration.

Controller:

- ops/bin/as6-autonomous-governance-compliance-controller

Result contract:

- AS6_GOVERNANCE_COMPLIANCE=PASS
- AS6_GOVERNANCE_COMPLIANCE=FAIL
- AS6_GOVERNANCE_COMPLIANCE_RESULT=OK
- AS6_GOVERNANCE_COMPLIANCE_RESULT=FAIL

Evidence:

- runtime/governance-compliance/latest.out
- runtime/governance-compliance/controller-governance-matrix.tsv
