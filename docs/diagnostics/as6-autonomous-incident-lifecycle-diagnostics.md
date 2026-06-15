# AS6 Autonomous Incident Lifecycle Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-incident-lifecycle-controller

New diagnostic checks added:

- incident_lifecycle_controller
- incident_registry_diagnostics
- incident_state_diagnostics
- incident_transition_diagnostics
- incident_closure_diagnostics
- incident_evidence_diagnostics
- incident_root_cause_binding_diagnostics
- incident_owner_presence
- incident_human_approval_gate
- incident_auto_repair_apply_block
- incident_history_generation
- incident_closure_generation

New error classes added:

- INCIDENT_NOT_REGISTERED
- INCIDENT_WITHOUT_OWNER
- INCIDENT_WITHOUT_STATE
- INCIDENT_WITHOUT_EVIDENCE
- INCIDENT_WITHOUT_CLOSURE
- INCIDENT_STATE_TRANSITION_DRIFT
- INCIDENT_REOPEN_REQUIRED
- INCIDENT_SEVERITY_MISMATCH
- INCIDENT_ROOT_CAUSE_MISMATCH
- INCIDENT_HISTORY_MISSING

New AEC rules added:

- AEC_INCIDENT_MUST_BE_REGISTERED
- AEC_INCIDENT_MUST_HAVE_STATE
- AEC_INCIDENT_MUST_HAVE_EVIDENCE
- AEC_INCIDENT_MUST_HAVE_ROOT_CAUSE
- AEC_INCIDENT_MUST_HAVE_CLOSURE
- AEC_INCIDENT_TRANSITION_MUST_BE_VALID
- AEC_INCIDENT_MUST_HAVE_OWNER
