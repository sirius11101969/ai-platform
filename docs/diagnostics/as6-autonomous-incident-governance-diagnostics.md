# AS6 Autonomous Incident Governance Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-incident-governance-controller

New diagnostic checks added:

- incident_governance_controller
- incident_state_generation
- incident_remediation_plan_generation
- incident_validation_plan_generation
- incident_evidence_bundle_generation
- incident_root_cause_binding
- incident_no_auto_repair_apply_policy
- incident_human_approval_gate
- incident_production_health_gate
- incident_l7_gate_capture
- incident_secret_scan_gate

New error classes added:

- INCIDENT_WITHOUT_ROOT_CAUSE
- INCIDENT_WITHOUT_REMEDIATION_PLAN
- INCIDENT_WITHOUT_VALIDATION_PLAN
- INCIDENT_WITHOUT_EVIDENCE
- INCIDENT_STATE_DRIFT
- INCIDENT_REMEDIATION_PLAN_DRIFT
- INCIDENT_VALIDATION_PLAN_DRIFT
- INCIDENT_EVIDENCE_BUNDLE_MISSING
- INCIDENT_HUMAN_APPROVAL_GATE_MISSING
- INCIDENT_AUTO_REPAIR_POLICY_VIOLATION

New AEC rules added:

- AEC_INCIDENT_MUST_HAVE_ROOT_CAUSE
- AEC_INCIDENT_MUST_HAVE_REMEDIATION
- AEC_INCIDENT_MUST_HAVE_VALIDATION
- AEC_INCIDENT_MUST_HAVE_EVIDENCE
- AEC_INCIDENT_MUST_BE_REGISTERED
- AEC_INCIDENT_AUTO_REPAIR_APPLY_FORBIDDEN_WITHOUT_APPROVAL
