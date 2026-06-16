# AS6 Incident Commander Diagnostics

Added checks:
- incident_commander_controller
- incident_state_generation
- incident_timeline_generation
- incident_plan_generation
- incident_root_cause_binding
- incident_evidence_correlation_gate
- incident_rollback_gate
- incident_no_auto_repair_apply_policy

Added root causes:
- INCIDENT_COMMANDER_MISSING
- INCIDENT_STATE_MISSING
- INCIDENT_TIMELINE_MISSING
- INCIDENT_PLAN_MISSING
- INCIDENT_ROOT_CAUSE_NOT_BOUND
- INCIDENT_WITHOUT_EVIDENCE_CORRELATION

Added AEC:
- AEC_INCIDENT_COMMANDER_REQUIRED
- AEC_INCIDENT_STATE_REQUIRED
- AEC_INCIDENT_TIMELINE_REQUIRED
- AEC_INCIDENT_ROOT_CAUSE_BINDING_REQUIRED
- AEC_INCIDENT_REPAIR_REQUIRES_HUMAN_APPROVAL
