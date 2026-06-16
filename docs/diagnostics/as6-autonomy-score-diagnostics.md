# AS6 Autonomy Score Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomy-score-controller

New diagnostic checks added:

- autonomy_score_controller
- autonomy_chain_score
- autonomy_beget_vps_gate
- autonomy_provider_control_plane_gate
- autonomy_production_drift_gate
- autonomy_architecture_compliance_gate
- autonomy_rollback_verification_gate
- autonomy_deployment_controller_gate
- autonomy_git_sync_gate
- autonomy_secret_scan_gate
- autonomy_root_cause_kb_gate
- autonomy_root_cause_governance_gate
- autonomy_evidence_correlation_gate
- autonomy_root_cause_deduplication_gate
- autonomy_human_dependency_calculation

New error classes added:

- AUTONOMY_SCORE_MISSING
- AUTONOMY_SCORE_BELOW_L7
- AUTONOMY_CHAIN_GATE_MISSING
- AUTONOMY_HUMAN_DEPENDENCY_TOO_HIGH
- AUTONOMY_LEVEL_DRIFT
- AUTONOMY_SCORE_EVIDENCE_MISSING

New AEC rules added:

- AEC_AUTONOMY_SCORE_REQUIRED
- AEC_AUTONOMY_LEVEL_MUST_BE_REGISTERED
- AEC_AUTONOMY_SCORE_EVIDENCE_REQUIRED
- AEC_AUTONOMY_HUMAN_DEPENDENCY_MUST_BE_EXPLICIT
- AEC_AUTONOMY_L8_REQUIRES_CONDITIONAL_AUTO_APPLY
