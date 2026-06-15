# AS6 Autonomous Deployment Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-deployment-controller

New diagnostic checks added:

- deployment_controller_gate
- deployment_plan_validation
- deployment_compose_plan_presence
- deployment_nginx_config_presence
- deployment_project_state_presence
- deployment_architecture_compliance_gate
- deployment_production_drift_gate
- deployment_rollback_verification_gate
- deployment_safety_gate
- deployment_change_pipeline_gate
- deployment_git_main_sync_gate
- deployment_public_health_confirmation
- deployment_secret_scan_gate
- deployment_working_tree_gate
- deployment_evidence_generation
- deployment_no_auto_apply_policy

New error classes added:

- DEPLOYMENT_PLAN_MISSING
- DEPLOYMENT_EVIDENCE_MISSING
- DEPLOYMENT_PRECONDITION_FAILED
- DEPLOYMENT_ROLLBACK_BINDING_MISSING
- DEPLOYMENT_GOVERNANCE_GAP
- DEPLOYMENT_ARCHITECTURE_GATE_FAILED
- DEPLOYMENT_PRODUCTION_DRIFT_GATE_FAILED
- DEPLOYMENT_SECRET_SCAN_FAILED
- DEPLOYMENT_GIT_SYNC_FAILED
- DEPLOYMENT_PUBLIC_HEALTH_FAILED

New AEC rules added:

- AEC_DEPLOYMENT_REQUIRES_ROLLBACK_VERIFICATION
- AEC_DEPLOYMENT_REQUIRES_ARCHITECTURE_COMPLIANCE
- AEC_DEPLOYMENT_REQUIRES_PRODUCTION_DRIFT_OK
- AEC_DEPLOYMENT_EVIDENCE_REQUIRED
- AEC_DEPLOYMENT_NO_AUTO_APPLY_WITHOUT_APPROVAL
