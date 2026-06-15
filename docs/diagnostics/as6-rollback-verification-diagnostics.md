# AS6 Rollback Verification Diagnostics

Registered diagnostic artifact:

- ops/bin/as6-autonomous-rollback-verification-controller

New diagnostic checks added:

- rollback_verification_controller
- backup_artifact_presence
- backup_artifact_plausible_size
- backup_sql_signature
- restore_prerequisite_compose
- restore_prerequisite_env_example
- production_env_presence_without_secret_output
- postgres_runtime_target_presence
- rollback_readiness_diagnostic_execution
- restore_readiness_diagnostic_execution
- backup_integrity_diagnostic_execution
- rollback_documentation_reference_check
- restore_documentation_reference_check
- backup_governance_reference_check
- rollback_secret_scan_gate
- rollback_evidence_file_generation

New error classes added:

- ROLLBACK_PLAN_MISSING
- ROLLBACK_EVIDENCE_MISSING
- RESTORE_PROCEDURE_MISSING
- BACKUP_POLICY_GAP
- ROLLBACK_VALIDATION_MISSING
- BACKUP_ARTIFACT_MISSING
- BACKUP_ARTIFACT_TOO_SMALL
- BACKUP_SQL_SIGNATURE_MISSING
- RESTORE_TARGET_MISSING
- ROLLBACK_SECRET_SCAN_FAILED

New AEC rules added:

- AEC_ROLLBACK_READINESS_REQUIRED_BEFORE_DEPLOYMENT
- AEC_RESTORE_PATH_MUST_BE_VERIFIED
- AEC_BACKUP_POLICY_MUST_HAVE_EVIDENCE
- AEC_ROLLBACK_VERIFICATION_EVIDENCE_REQUIRED
