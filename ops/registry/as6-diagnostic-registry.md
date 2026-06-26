# AS6 Diagnostic Registry

## Autonomous Production Drift Controller
- ops/bin/as6-autonomous-production-drift-controller
- result: AS6_PRODUCTION_DRIFT_CONTROLLER_RESULT

## Architecture Compliance Controller
- ops/bin/as6-autonomous-architecture-compliance-controller

## Autonomous Rollback Verification Controller
- ops/bin/as6-autonomous-rollback-verification-controller
- result: AS6_AUTONOMOUS_ROLLBACK_VERIFICATION_RESULT

## Autonomous Deployment Controller
- ops/bin/as6-autonomous-deployment-controller
- result: AS6_AUTONOMOUS_DEPLOYMENT_CONTROLLER_RESULT

## Autonomous Incident Commander
- ops/bin/as6-autonomous-incident-commander
- result: AS6_AUTONOMOUS_INCIDENT_COMMANDER_RESULT

## Autonomous Knowledge Base Controller
- ops/bin/as6-autonomous-knowledge-base-controller
- result: AS6_AUTONOMOUS_KNOWLEDGE_BASE_CONTROLLER_RESULT

## Autonomous Incident Governance Controller
- ops/bin/as6-autonomous-incident-governance-controller
- result: AS6_INCIDENT_GOVERNANCE_RESULT

## Autonomous Incident Lifecycle Controller
- ops/bin/as6-autonomous-incident-lifecycle-controller
- result: AS6_INCIDENT_LIFECYCLE_RESULT

## Autonomous Change Approval Controller
- ops/bin/as6-autonomous-change-approval-controller
- result: AS6_CHANGE_APPROVAL_RESULT

## Autonomous Governance Compliance Controller
- ops/bin/as6-autonomous-governance-compliance-controller
- result: AS6_GOVERNANCE_COMPLIANCE_RESULT

## Autonomous Evidence Correlation Controller
- ops/bin/as6-autonomous-evidence-correlation-controller
- result: AS6_EVIDENCE_CORRELATION_RESULT

## Autonomous Root Cause Deduplication Controller
- ops/bin/as6-autonomous-root-cause-deduplication-controller
- result: AS6_ROOT_CAUSE_DEDUPLICATION_RESULT

## Autonomy Score Controller
- ops/bin/as6-autonomy-score-controller
- result: AS6_AUTONOMY_SCORE_RESULT

## Autonomous Production Policy Engine
- ops/bin/as6-autonomous-production-policy-engine
- result: AS6_PRODUCTION_POLICY_ENGINE_RESULT

## Autonomous Architecture Evolution Controller
- ops/bin/as6-autonomous-architecture-evolution-controller
- result: AS6_ARCHITECTURE_EVOLUTION_RESULT

## Autonomous Change Impact Analysis Controller
- ops/bin/as6-autonomous-change-impact-analysis-controller
- result: AS6_CHANGE_IMPACT_ANALYSIS_RESULT

## Unified Autonomy Orchestrator
- ops/bin/as6-unified-autonomy-orchestrator
- result: AS6_UNIFIED_AUTONOMY_ORCHESTRATOR_RESULT

## Diagnostic Flow Guard
- ops/bin/as6-diagnose-diagnostic-flow-guard
- result: AS6_DIAGNOSTIC_FLOW_GUARD_RESULT

## Diagnostic Status Registry Repair
- file: ops/status/diagnostic-status-registry.json
- diagnostic: ops/bin/as6-diagnose-diagnostic-flow-guard
- result: AS6_DIAGNOSTIC_FLOW_GUARD_RESULT

## Root Cause: AUTONOMOUS_CHANGE_CONTROLLER_DRIFT
- diagnostic: as6-diagnose-autonomous-change-controller
- class: AUTONOMOUS_CHANGE_CONTROLLER_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: AUTONOMOUS_COVERAGE_GAP
- diagnostic: as6-diagnose-autonomous-coverage
- class: AUTONOMOUS_COVERAGE_GAP
- source: bulk-root-cause-governance-repair

## Root Cause: AUTONOMOUS_REPAIR_CONTROLLER_DRIFT
- diagnostic: as6-diagnose-autonomous-repair-controller
- class: AUTONOMOUS_REPAIR_CONTROLLER_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: AUTONOMOUS_VALIDATION_CONTROLLER_DRIFT
- diagnostic: as6-diagnose-autonomous-validation-controller
- class: AUTONOMOUS_VALIDATION_CONTROLLER_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: AUTONOMY_OPERATING_STANDARD_DRIFT
- diagnostic: as6-diagnose-autonomy-operating-standard
- class: AUTONOMY_OPERATING_STANDARD_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: BACKUP_ARTIFACT_FALSE_POSITIVE
- diagnostic: as6-diagnose-nameerror-signatures
- class: BACKUP_ARTIFACT_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: CHANGE_EVIDENCE_MISSING
- diagnostic: as6-diagnose-autonomous-change-controller
- class: CHANGE_EVIDENCE_MISSING
- source: bulk-root-cause-governance-repair

## Root Cause: CHANGE_PIPELINE_CONTROLLER_DRIFT
- diagnostic: as6-diagnose-change-pipeline-controller
- class: CHANGE_PIPELINE_CONTROLLER_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: CHANGE_WITHOUT_GATE
- diagnostic: as6-diagnose-change-pipeline-controller
- class: CHANGE_WITHOUT_GATE
- source: bulk-root-cause-governance-repair

## Root Cause: CHANGE_WITHOUT_POST_VALIDATION
- diagnostic: as6-diagnose-autonomous-validation-controller
- class: CHANGE_WITHOUT_POST_VALIDATION
- source: bulk-root-cause-governance-repair

## Root Cause: CHANGE_WITHOUT_ROLLBACK
- diagnostic: as6-diagnose-rollback-readiness
- class: CHANGE_WITHOUT_ROLLBACK
- source: bulk-root-cause-governance-repair

## Root Cause: CONTROL_PANEL_POWER_REBOOT
- diagnostic: as6-diagnose-control-panel-reboot-correlation
- class: CONTROL_PANEL_POWER_REBOOT
- source: bulk-root-cause-governance-repair

## Root Cause: CONTROL_PANEL_REBOOT
- diagnostic: as6-diagnose-control-panel-reboot-correlation
- class: CONTROL_PANEL_REBOOT
- source: bulk-root-cause-governance-repair

## Root Cause: CONTROL_PANEL_REBOOT_UNATTRIBUTED
- diagnostic: as6-diagnose-control-panel-reboot-correlation
- class: CONTROL_PANEL_REBOOT_UNATTRIBUTED
- source: bulk-root-cause-governance-repair

## Root Cause: CONTROL_PLANE_AUDIT_GAP
- diagnostic: as6-diagnose-provider-control-plane
- class: CONTROL_PLANE_AUDIT_GAP
- source: bulk-root-cause-governance-repair

## Root Cause: COPY_PASTE_CORRUPTED_PATCH
- diagnostic: as6-diagnose-output-format
- class: COPY_PASTE_CORRUPTED_PATCH
- source: bulk-root-cause-governance-repair

## Root Cause: DEPLOYMENT_GATE_BYPASS
- diagnostic: as6-diagnose-autonomous-change-controller
- class: DEPLOYMENT_GATE_BYPASS
- source: bulk-root-cause-governance-repair

## Root Cause: DEPLOYMENT_WITHOUT_BACKUP
- diagnostic: as6-diagnose-production-deployment-safety
- class: DEPLOYMENT_WITHOUT_BACKUP
- source: bulk-root-cause-governance-repair

## Root Cause: DEPLOYMENT_WITHOUT_ROLLBACK
- diagnostic: as6-diagnose-production-deployment-safety
- class: DEPLOYMENT_WITHOUT_ROLLBACK
- source: bulk-root-cause-governance-repair

## Root Cause: DEPLOYMENT_WITHOUT_VALIDATION
- diagnostic: as6-diagnose-production-deployment-safety
- class: DEPLOYMENT_WITHOUT_VALIDATION
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_CONTRACT_NO_RECURSION_SELF_REFERENCE_FALSE_POSITIVE
- diagnostic: as6-diagnose-diagnostic-contract
- class: DIAGNOSTIC_CONTRACT_NO_RECURSION_SELF_REFERENCE_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_CONTRACT_PYTHON_C_EXIT_OR_HANG
- diagnostic: as6-diagnose-diagnostic-contract
- class: DIAGNOSTIC_CONTRACT_PYTHON_C_EXIT_OR_HANG
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_CONTRACT_RECURSIVE_DEPENDENCY
- diagnostic: as6-diagnose-diagnostic-contract
- class: DIAGNOSTIC_CONTRACT_RECURSIVE_DEPENDENCY
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_CONTRACT_SELF_REFERENCE_FALSE_POSITIVE
- diagnostic: as6-diagnose-diagnostic-contract
- class: DIAGNOSTIC_CONTRACT_SELF_REFERENCE_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_COVERAGE_REGISTRATION_DRIFT
- diagnostic: as6-diagnose-diagnostic-registration
- class: DIAGNOSTIC_COVERAGE_REGISTRATION_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_EMBEDDED_HEREDOC_RUNTIME_HANG
- diagnostic: as6-diagnose-diagnostic-contract
- class: DIAGNOSTIC_EMBEDDED_HEREDOC_RUNTIME_HANG
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_GIT_REGISTRATION_DRIFT
- diagnostic: as6-diagnose-diagnostic-registration
- class: DIAGNOSTIC_GIT_REGISTRATION_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_HELPER_GIT_REGISTRATION_DRIFT
- diagnostic: as6-diagnose-diagnostic-registration
- class: DIAGNOSTIC_HELPER_GIT_REGISTRATION_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_REGISTRY_GIT_ALIGNMENT_DRIFT
- diagnostic: as6-diagnose-diagnostic-tracking
- class: DIAGNOSTIC_REGISTRY_GIT_ALIGNMENT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_REGISTRY_GIT_HYGIENE_DRIFT
- diagnostic: as6-diagnose-diagnostic-registration
- class: DIAGNOSTIC_REGISTRY_GIT_HYGIENE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_SELF_REFERENCE_FALSE_POSITIVE
- diagnostic: as6-diagnose-patch-mode
- class: DIAGNOSTIC_SELF_REFERENCE_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_TRACKING_DRIFT
- diagnostic: as6-diagnose-diagnostic-tracking
- class: DIAGNOSTIC_TRACKING_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DIAGNOSTIC_TRACKING_SINGLE_FILE_DRIFT
- diagnostic: as6-diagnose-diagnostic-tracking
- class: DIAGNOSTIC_TRACKING_SINGLE_FILE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: DOCKER_ENV_CONTRACT_DRIFT
- diagnostic: as6-diagnose-env-contract
- class: DOCKER_ENV_CONTRACT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: EMPTY_REQUIRED_ENV
- diagnostic: as6-diagnose-env-contract
- class: EMPTY_REQUIRED_ENV
- source: bulk-root-cause-governance-repair

## Root Cause: ENV_EXAMPLE_DRIFT
- diagnostic: as6-diagnose-env-contract
- class: ENV_EXAMPLE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_COMPILE_TARGET_DRIFT
- diagnostic: as6-diagnose-generated-python-runtime

## Design System Foundation V220
- diagnostic: ops/bin/as6-diagnose-design-system-foundation-v220
- result: AS6_DESIGN_SYSTEM_FOUNDATION_V220
- root cause: DESIGN_SYSTEM_FOUNDATION_DRIFT
- failure class: AS6_FAILURE_CLASS_DESIGN_SYSTEM_FOUNDATION_DRIFT
- runtime tracer: frontend/src/utils/as6RuntimeTracer.js
- governance: ops/governance/as6-design-system-foundation-aec-v220.md

## V222_40 State Restore Tag Reconciliation

- Diagnostic: ops/bin/as6-diagnose-state-restore-tag-reconciliation-v222-40

- Control: ops/bin/as6-control-state-restore-tag-reconciliation-v222-40

- Runtime evidence: runtime/as6-v222-40/diagnostic-report.md

- Failure class: MARKDOWN_STATE_RESTORE_TAG_DRIFT

- Root cause: markdown_state_lagged_behind_restore_tag

## V222_40 Repair — Ignored Runtime Evidence

- Diagnostic added: ignored_runtime_evidence_add_check.

- Control added: forced_runtime_artifact_tracking_check.

- Pathspec guard added: commit_push_pathspec_guard_check.

- Failure class: IGNORED_RUNTIME_EVIDENCE_PATHSPEC.
