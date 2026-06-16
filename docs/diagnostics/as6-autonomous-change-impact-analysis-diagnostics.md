# AS6 Change Impact Analysis Diagnostics

Added checks:
- change_impact_analysis_controller
- change_impact_matrix_generation
- change_impact_worktree_scan
- change_impact_production_policy_gate
- change_impact_incident_commander_gate
- change_impact_rollback_gate
- change_impact_evidence_gate

Added root causes:
- CHANGE_IMPACT_ANALYSIS_MISSING
- CHANGE_IMPACT_MATRIX_MISSING
- CHANGE_WITHOUT_IMPACT_ANALYSIS
- CHANGE_IMPACT_WITHOUT_ROLLBACK
- CHANGE_IMPACT_WITHOUT_EVIDENCE
- CHANGE_IMPACT_POLICY_DRIFT

Added AEC:
- AEC_CHANGE_IMPACT_ANALYSIS_REQUIRED
- AEC_CHANGE_IMPACT_MATRIX_REQUIRED
- AEC_CHANGE_REQUIRES_POLICY_GATE
- AEC_CHANGE_REQUIRES_ROLLBACK_GATE
- AEC_CHANGE_REQUIRES_EVIDENCE_GATE
