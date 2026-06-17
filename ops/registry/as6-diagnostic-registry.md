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
- class: GENERATED_PYTHON_COMPILE_TARGET_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_CONTRACT_COVERAGE_DRIFT
- diagnostic: as6-diagnose-generated-python-contract-coverage
- class: GENERATED_PYTHON_CONTRACT_COVERAGE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_CONTRACT_DRIFT
- diagnostic: as6-diagnose-generated-python-contracts
- class: GENERATED_PYTHON_CONTRACT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_CONTRACT_HELPER_IMPORT_SIDE_EFFECT
- diagnostic: as6-diagnose-generated-python-contracts
- class: GENERATED_PYTHON_CONTRACT_HELPER_IMPORT_SIDE_EFFECT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_CONTRACT_RECURSIVE_IMPORT_DRIFT
- diagnostic: as6-diagnose-generated-python-contracts
- class: GENERATED_PYTHON_CONTRACT_RECURSIVE_IMPORT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_HELPER_CONTRACT_COVERAGE_DRIFT
- diagnostic: as6-diagnose-generated-python-contract-coverage
- class: GENERATED_PYTHON_HELPER_CONTRACT_COVERAGE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_IMPORT_DRIFT
- diagnostic: as6-diagnose-generated-python-imports
- class: GENERATED_PYTHON_IMPORT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_IMPORT_SIDE_EFFECT
- diagnostic: as6-diagnose-generated-python-imports
- class: GENERATED_PYTHON_IMPORT_SIDE_EFFECT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_NAMEERROR_DRIFT
- diagnostic: as6-diagnose-generated-python-nameerror
- class: GENERATED_PYTHON_NAMEERROR_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_PYCACHE_ARTIFACT_DRIFT
- diagnostic: as6-diagnose-generated-python-runtime
- class: GENERATED_PYTHON_PYCACHE_ARTIFACT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_REGRESSION_DRIFT
- diagnostic: as6-diagnose-generated-python-regression
- class: GENERATED_PYTHON_REGRESSION_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_RUNTIME_CONTRACT_DRIFT
- diagnostic: as6-diagnose-generated-python-runtime
- class: GENERATED_PYTHON_RUNTIME_CONTRACT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_RUNTIME_DRIFT
- diagnostic: as6-diagnose-generated-python-runtime
- class: GENERATED_PYTHON_RUNTIME_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_SAFETY_LEGACY_SCOPE_FALSE_POSITIVE
- diagnostic: as6-diagnose-generated-python-safety
- class: GENERATED_PYTHON_SAFETY_LEGACY_SCOPE_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_SAFETY_SELF_REFERENCE_FALSE_POSITIVE
- diagnostic: as6-diagnose-generated-python-safety
- class: GENERATED_PYTHON_SAFETY_SELF_REFERENCE_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_SELF_IMPORT_RECURSION
- diagnostic: as6-diagnose-generated-python-runtime
- class: GENERATED_PYTHON_SELF_IMPORT_RECURSION
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_SHELL_QUOTE_COLLISION
- diagnostic: as6-diagnose-root-cause-router
- class: GENERATED_PYTHON_SHELL_QUOTE_COLLISION
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_PYTHON_TEMPLATE_VARIABLE_LEAK
- diagnostic: as6-diagnose-root-cause-router
- class: GENERATED_PYTHON_TEMPLATE_VARIABLE_LEAK
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_TEMPLATE_REFERENCE_DRIFT
- diagnostic: as6-diagnose-generated-python-safety
- class: GENERATED_TEMPLATE_REFERENCE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GENERATED_VARIABLE_NAME_DRIFT
- diagnostic: as6-diagnose-python-variable-contract
- class: GENERATED_VARIABLE_NAME_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: GIANT_BASE64_PATCH
- diagnostic: as6-diagnose-patch-mode
- class: GIANT_BASE64_PATCH
- source: bulk-root-cause-governance-repair

## Root Cause: HOST_CONFIGURATION_DRIFT
- diagnostic: as6-diagnose-vps-baseline
- class: HOST_CONFIGURATION_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: HOST_FREEZE_SSH_DROP
- diagnostic: as6-diagnose-host-freeze-investigation-pack
- class: HOST_FREEZE_SSH_DROP
- source: bulk-root-cause-governance-repair

## Root Cause: KNOWLEDGE_BASE_REFERENCE_FALSE_POSITIVE
- diagnostic: as6-diagnose-patch-mode
- class: KNOWLEDGE_BASE_REFERENCE_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: METRIC_QUERY_DRIFT
- diagnostic: as6-diagnose-diagnostic-contract
- class: METRIC_QUERY_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: MISSING_CHANGE_IMPACT_ANALYSIS
- diagnostic: as6-diagnose-change-governance
- class: MISSING_CHANGE_IMPACT_ANALYSIS
- source: bulk-root-cause-governance-repair

## Root Cause: MISSING_CHANGE_ROLLBACK_PLAN
- diagnostic: as6-diagnose-change-governance
- class: MISSING_CHANGE_ROLLBACK_PLAN
- source: bulk-root-cause-governance-repair

## Root Cause: MISSING_CHANGE_VALIDATION_PLAN
- diagnostic: as6-diagnose-change-governance
- class: MISSING_CHANGE_VALIDATION_PLAN
- source: bulk-root-cause-governance-repair

## Root Cause: MISSING_REQUIRED_ENV
- diagnostic: as6-diagnose-env-contract
- class: MISSING_REQUIRED_ENV
- source: bulk-root-cause-governance-repair

## Root Cause: NESTED_HEREDOC_PATCH
- diagnostic: as6-diagnose-patch-mode
- class: NESTED_HEREDOC_PATCH
- source: bulk-root-cause-governance-repair

## Root Cause: NETWORK_BLACKHOLE
- diagnostic: as6-diagnose-host-freeze-network
- class: NETWORK_BLACKHOLE
- source: bulk-root-cause-governance-repair

## Root Cause: OVERSIZED_SINGLE_LINE_PATCH
- diagnostic: as6-diagnose-patch-mode
- class: OVERSIZED_SINGLE_LINE_PATCH
- source: bulk-root-cause-governance-repair

## Root Cause: PANEL_SECURITY_DRIFT
- diagnostic: as6-diagnose-provider-control-plane
- class: PANEL_SECURITY_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: PAYMENT_ENV_DRIFT
- diagnostic: as6-diagnose-env-contract
- class: PAYMENT_ENV_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: PRE_REBOOT_EVIDENCE_MISSING
- diagnostic: as6-diagnose-pre-reboot-forensics
- class: PRE_REBOOT_EVIDENCE_MISSING
- source: bulk-root-cause-governance-repair

## Root Cause: PRODUCTION_FREEZE_VIOLATION
- diagnostic: as6-diagnose-production-freeze-guard
- class: PRODUCTION_FREEZE_VIOLATION
- source: bulk-root-cause-governance-repair

## Root Cause: PRODUCTION_HEALTH_NOT_CONFIRMED
- diagnostic: as6-diagnose-autonomous-validation-controller
- class: PRODUCTION_HEALTH_NOT_CONFIRMED
- source: bulk-root-cause-governance-repair

## Root Cause: PROVIDER_HYPERVISOR_REBOOT
- diagnostic: as6-diagnose-provider-hypervisor-reboot
- class: PROVIDER_HYPERVISOR_REBOOT
- source: bulk-root-cause-governance-repair

## Root Cause: PROVIDER_UI_ACTION
- diagnostic: as6-diagnose-control-panel-reboot-correlation
- class: PROVIDER_UI_ACTION
- source: bulk-root-cause-governance-repair

## Root Cause: PYTHON_ARTIFACT_GIT_HYGIENE_DRIFT
- diagnostic: as6-diagnose-python-artifact-git-hygiene
- class: PYTHON_ARTIFACT_GIT_HYGIENE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: PYTHON_HELPER_RUNTIME_ARTIFACT_DRIFT
- diagnostic: as6-diagnose-python-artifact-git-hygiene
- class: PYTHON_HELPER_RUNTIME_ARTIFACT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: REBOOT_FORENSICS_PROVIDER_SUPPRESSOR_DRIFT
- diagnostic: as6-diagnose-provider-control-plane
- class: REBOOT_FORENSICS_PROVIDER_SUPPRESSOR_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: REBOOT_FORENSICS_RUNTIME_FAILURE
- diagnostic: as6-diagnose-reboot-forensics-runtime
- class: REBOOT_FORENSICS_RUNTIME_FAILURE
- source: bulk-root-cause-governance-repair

## Root Cause: REGISTRY_METRIC_QUERY_DRIFT
- diagnostic: as6-diagnose-diagnostic-contract
- class: REGISTRY_METRIC_QUERY_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: REGISTRY_SCHEMA_DRIFT
- diagnostic: as6-diagnose-diagnostic-contract
- class: REGISTRY_SCHEMA_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: REPAIR_WITHOUT_ROLLBACK
- diagnostic: as6-diagnose-autonomous-repair-controller
- class: REPAIR_WITHOUT_ROLLBACK
- source: bulk-root-cause-governance-repair

## Root Cause: REPAIR_WITHOUT_ROOT_CAUSE
- diagnostic: as6-diagnose-autonomous-repair-controller
- class: REPAIR_WITHOUT_ROOT_CAUSE
- source: bulk-root-cause-governance-repair

## Root Cause: REPAIR_WITHOUT_VALIDATION
- diagnostic: as6-diagnose-autonomous-repair-controller
- class: REPAIR_WITHOUT_VALIDATION
- source: bulk-root-cause-governance-repair

## Root Cause: ROLLBACK_NOT_TESTED
- diagnostic: as6-diagnose-rollback-readiness
- class: ROLLBACK_NOT_TESTED
- source: bulk-root-cause-governance-repair

## Root Cause: ROLLBACK_VERIFICATION_MISSING
- diagnostic: as6-diagnose-autonomous-validation-controller
- class: ROLLBACK_VERIFICATION_MISSING
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_CLASS_NOT_DOCUMENTED
- diagnostic: as6-diagnose-root-cause-knowledge-base
- class: ROOT_CAUSE_CLASS_NOT_DOCUMENTED
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_GOVERNANCE_COVERAGE_DRIFT
- diagnostic: as6-diagnose-root-cause-governance
- class: ROOT_CAUSE_GOVERNANCE_COVERAGE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_ROUTER_MISSING_ROUTE
- diagnostic: as6-diagnose-root-cause-router
- class: ROOT_CAUSE_ROUTER_MISSING_ROUTE
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_ROUTING_CONTRACT_DRIFT
- diagnostic: as6-diagnose-root-cause-router
- class: ROOT_CAUSE_ROUTING_CONTRACT_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_COVERAGE
- diagnostic: as6-diagnose-root-cause-governance
- class: ROOT_CAUSE_WITHOUT_COVERAGE
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_DIAGNOSTIC
- diagnostic: as6-diagnose-root-cause-governance
- class: ROOT_CAUSE_WITHOUT_DIAGNOSTIC
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_PREVENTION
- diagnostic: as6-diagnose-root-cause-governance
- class: ROOT_CAUSE_WITHOUT_PREVENTION
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_REGISTRY
- diagnostic: as6-diagnose-root-cause-governance
- class: ROOT_CAUSE_WITHOUT_REGISTRY
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_REMEDIATION_PLAN
- diagnostic: as6-diagnose-root-cause-remediation
- class: ROOT_CAUSE_WITHOUT_REMEDIATION_PLAN
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_ROLLBACK
- diagnostic: as6-diagnose-root-cause-governance
- class: ROOT_CAUSE_WITHOUT_ROLLBACK
- source: bulk-root-cause-governance-repair

## Root Cause: ROOT_CAUSE_WITHOUT_VALIDATION_PLAN
- diagnostic: as6-diagnose-root-cause-validation
- class: ROOT_CAUSE_WITHOUT_VALIDATION_PLAN
- source: bulk-root-cause-governance-repair

## Root Cause: RUNTIME_DIAGNOSTIC_BACKUP_SCANNED_AS_SOURCE
- diagnostic: as6-diagnose-nameerror-signatures
- class: RUNTIME_DIAGNOSTIC_BACKUP_SCANNED_AS_SOURCE
- source: bulk-root-cause-governance-repair

## Root Cause: SYSTEMD_TIMER_DRIFT
- diagnostic: as6-diagnose-vps-baseline
- class: SYSTEMD_TIMER_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause: TRACKED_ENV_SECRET_FILE
- diagnostic: as6-diagnose-env-contract
- class: TRACKED_ENV_SECRET_FILE
- source: bulk-root-cause-governance-repair

## Root Cause: UNATTRIBUTED_PROVIDER_ACTION
- diagnostic: as6-diagnose-provider-control-plane
- class: UNATTRIBUTED_PROVIDER_ACTION
- source: bulk-root-cause-governance-repair

## Root Cause: UNCONTROLLED_CHANGE
- diagnostic: as6-diagnose-change-governance
- class: UNCONTROLLED_CHANGE
- source: bulk-root-cause-governance-repair

## Root Cause: UNFINISHED_HEREDOC_BLOCK
- diagnostic: as6-diagnose-heredoc-safety
- class: UNFINISHED_HEREDOC_BLOCK
- source: bulk-root-cause-governance-repair

## Root Cause: UNSAFE_AUTO_REPAIR_APPLY
- diagnostic: as6-diagnose-autonomous-repair-controller
- class: UNSAFE_AUTO_REPAIR_APPLY
- source: bulk-root-cause-governance-repair

## Root Cause: UNVALIDATED_AUTONOMOUS_CHANGE
- diagnostic: as6-diagnose-autonomous-change-controller
- class: UNVALIDATED_AUTONOMOUS_CHANGE
- source: bulk-root-cause-governance-repair

## Root Cause: VALIDATION_EVIDENCE_MISSING
- diagnostic: as6-diagnose-autonomous-validation-controller
- class: VALIDATION_EVIDENCE_MISSING
- source: bulk-root-cause-governance-repair

## Root Cause: VARIABLE_CONTRACT_EXCEPTION_HANDLER_FALSE_POSITIVE
- diagnostic: as6-diagnose-python-variable-contract
- class: VARIABLE_CONTRACT_EXCEPTION_HANDLER_FALSE_POSITIVE
- source: bulk-root-cause-governance-repair

## Root Cause: VPS_BASELINE_DRIFT
- diagnostic: as6-diagnose-vps-baseline
- class: VPS_BASELINE_DRIFT
- source: bulk-root-cause-governance-repair

## Root Cause Governance Final Reconciliation
- diagnostic: ops/bin/as6-root-cause-governance-final-reconciliation-controller
- result: AS6_ROOT_CAUSE_GOVERNANCE_FINAL_RECONCILIATION_RESULT

## Root Cause Governance Aggregator Consistency
- diagnostic: ops/bin/as6-root-cause-governance-aggregator-consistency
- result: AS6_ROOT_CAUSE_GOVERNANCE_AGGREGATOR_CONSISTENCY_RESULT

## Diagnostic Registry: as6-diagnose-actions-node24
- diagnostic: ops/bin/as6-diagnose-actions-node24
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-actions-node24-migration
- diagnostic: ops/bin/as6-diagnose-actions-node24-migration
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-agent-branch-writer
- diagnostic: ops/bin/as6-diagnose-agent-branch-writer
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-agent-branch-writer-e2e
- diagnostic: ops/bin/as6-diagnose-agent-branch-writer-e2e
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-agent-pr-factory-e2e
- diagnostic: ops/bin/as6-diagnose-agent-pr-factory-e2e
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-agent-write-mode
- diagnostic: ops/bin/as6-diagnose-agent-write-mode
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-all
- diagnostic: ops/bin/as6-diagnose-all
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-automation-sources
- diagnostic: ops/bin/as6-diagnose-automation-sources
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-autonomous-change-controller
- diagnostic: ops/bin/as6-diagnose-autonomous-change-controller
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-autonomous-coverage
- diagnostic: ops/bin/as6-diagnose-autonomous-coverage
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-autonomous-repair-controller
- diagnostic: ops/bin/as6-diagnose-autonomous-repair-controller
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-autonomous-validation-controller
- diagnostic: ops/bin/as6-diagnose-autonomous-validation-controller
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-autonomy-operating-standard
- diagnostic: ops/bin/as6-diagnose-autonomy-operating-standard
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-backup-governance
- diagnostic: ops/bin/as6-diagnose-backup-governance
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-backup-integrity
- diagnostic: ops/bin/as6-diagnose-backup-integrity
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-change-governance
- diagnostic: ops/bin/as6-diagnose-change-governance
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-change-pipeline-controller
- diagnostic: ops/bin/as6-diagnose-change-pipeline-controller
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-codex-review-scope
- diagnostic: ops/bin/as6-diagnose-codex-review-scope
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-codex-workflow
- diagnostic: ops/bin/as6-diagnose-codex-workflow
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-command-center
- diagnostic: ops/bin/as6-diagnose-command-center
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-command-length-safety
- diagnostic: ops/bin/as6-diagnose-command-length-safety
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-constitution
- diagnostic: ops/bin/as6-diagnose-constitution
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-controlled-branch-writer
- diagnostic: ops/bin/as6-diagnose-controlled-branch-writer
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-controlled-write-mode
- diagnostic: ops/bin/as6-diagnose-controlled-write-mode
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-control-panel-reboot-correlation
- diagnostic: ops/bin/as6-diagnose-control-panel-reboot-correlation
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-contract
- diagnostic: ops/bin/as6-diagnose-diagnostic-contract
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-coverage
- diagnostic: ops/bin/as6-diagnose-diagnostic-coverage
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-governance
- diagnostic: ops/bin/as6-diagnose-diagnostic-governance
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-insertion-points
- diagnostic: ops/bin/as6-diagnose-diagnostic-insertion-points
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-performance
- diagnostic: ops/bin/as6-diagnose-diagnostic-performance
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-recursion
- diagnostic: ops/bin/as6-diagnose-diagnostic-recursion
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-registration
- diagnostic: ops/bin/as6-diagnose-diagnostic-registration
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-registry
- diagnostic: ops/bin/as6-diagnose-diagnostic-registry
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-status-registry
- diagnostic: ops/bin/as6-diagnose-diagnostic-status-registry
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-timeout-governance
- diagnostic: ops/bin/as6-diagnose-diagnostic-timeout-governance
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-diagnostic-tracking
- diagnostic: ops/bin/as6-diagnose-diagnostic-tracking
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-disaster-recovery
- diagnostic: ops/bin/as6-diagnose-disaster-recovery
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-env-contract
- diagnostic: ops/bin/as6-diagnose-env-contract
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-freeze-correlation
- diagnostic: ops/bin/as6-diagnose-freeze-correlation
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-function-order
- diagnostic: ops/bin/as6-diagnose-function-order
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-contract-coverage
- diagnostic: ops/bin/as6-diagnose-generated-python-contract-coverage
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-contracts
- diagnostic: ops/bin/as6-diagnose-generated-python-contracts
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-imports
- diagnostic: ops/bin/as6-diagnose-generated-python-imports
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-nameerror
- diagnostic: ops/bin/as6-diagnose-generated-python-nameerror
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-regression
- diagnostic: ops/bin/as6-diagnose-generated-python-regression
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-runtime
- diagnostic: ops/bin/as6-diagnose-generated-python-runtime
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-generated-python-safety
- diagnostic: ops/bin/as6-diagnose-generated-python-safety
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-git-hygiene
- diagnostic: ops/bin/as6-diagnose-git-hygiene
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-git-main-sync
- diagnostic: ops/bin/as6-diagnose-git-main-sync
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-alerts
- diagnostic: ops/bin/as6-diagnose-health-alerts
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-anomaly-root-cause
- diagnostic: ops/bin/as6-diagnose-health-anomaly-root-cause
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-cache
- diagnostic: ops/bin/as6-diagnose-health-cache
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-cache-freshness
- diagnostic: ops/bin/as6-diagnose-health-cache-freshness
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-cache-timer-freshness
- diagnostic: ops/bin/as6-diagnose-health-cache-timer-freshness
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-cleanup
- diagnostic: ops/bin/as6-diagnose-health-cleanup
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-dashboard-integration
- diagnostic: ops/bin/as6-diagnose-health-dashboard-integration
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-anomaly
- diagnostic: ops/bin/as6-diagnose-health-history-anomaly
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-corruption
- diagnostic: ops/bin/as6-diagnose-health-history-corruption
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-gap-root-cause
- diagnostic: ops/bin/as6-diagnose-health-history-gap-root-cause
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-gap-suppression
- diagnostic: ops/bin/as6-diagnose-health-history-gap-suppression
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-historical-only
- diagnostic: ops/bin/as6-diagnose-health-history-historical-only
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-recovery-window
- diagnostic: ops/bin/as6-diagnose-health-history-recovery-window
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-history-stall-root-cause
- diagnostic: ops/bin/as6-diagnose-health-history-stall-root-cause
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-recovery
- diagnostic: ops/bin/as6-diagnose-health-recovery
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-runtime-policy
- diagnostic: ops/bin/as6-diagnose-health-runtime-policy
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-status
- diagnostic: ops/bin/as6-diagnose-health-status
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-timer
- diagnostic: ops/bin/as6-diagnose-health-timer
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-timer-dashboard
- diagnostic: ops/bin/as6-diagnose-health-timer-dashboard
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-timer-runtime
- diagnostic: ops/bin/as6-diagnose-health-timer-runtime
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-health-trend
- diagnostic: ops/bin/as6-diagnose-health-trend
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-heredoc-safety
- diagnostic: ops/bin/as6-diagnose-heredoc-safety
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-historical-gap-aging
- diagnostic: ops/bin/as6-diagnose-historical-gap-aging
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-historical-incident-api
- diagnostic: ops/bin/as6-diagnose-historical-incident-api
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-historical-incident-archive
- diagnostic: ops/bin/as6-diagnose-historical-incident-archive
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-historical-incident-autoclose
- diagnostic: ops/bin/as6-diagnose-historical-incident-autoclose
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-historical-incident-canonicalization
- diagnostic: ops/bin/as6-diagnose-historical-incident-canonicalization
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-historical-incident-suppressor
- diagnostic: ops/bin/as6-diagnose-historical-incident-suppressor
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-host-freeze-history
- diagnostic: ops/bin/as6-diagnose-host-freeze-history
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-host-freeze-investigation-pack
- diagnostic: ops/bin/as6-diagnose-host-freeze-investigation-pack
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-host-freeze-network
- diagnostic: ops/bin/as6-diagnose-host-freeze-network
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-host-stability
- diagnostic: ops/bin/as6-diagnose-host-stability
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-hypervisor-reboot
- diagnostic: ops/bin/as6-diagnose-hypervisor-reboot
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-issue-router
- diagnostic: ops/bin/as6-diagnose-issue-router
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-nameerror-signatures
- diagnostic: ops/bin/as6-diagnose-nameerror-signatures
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-ops-agent
- diagnostic: ops/bin/as6-diagnose-ops-agent
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-output-format
- diagnostic: ops/bin/as6-diagnose-output-format
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-patch-mode
- diagnostic: ops/bin/as6-diagnose-patch-mode
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-patch-structure
- diagnostic: ops/bin/as6-diagnose-patch-structure
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-pre-reboot-forensics
- diagnostic: ops/bin/as6-diagnose-pre-reboot-forensics
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-pr-factory
- diagnostic: ops/bin/as6-diagnose-pr-factory
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-production-deployment-safety
- diagnostic: ops/bin/as6-diagnose-production-deployment-safety
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-production-freeze-guard
- diagnostic: ops/bin/as6-diagnose-production-freeze-guard
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-provider-control-plane
- diagnostic: ops/bin/as6-diagnose-provider-control-plane
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-provider-event-correlation
- diagnostic: ops/bin/as6-diagnose-provider-event-correlation
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-provider-hypervisor-reboot
- diagnostic: ops/bin/as6-diagnose-provider-hypervisor-reboot
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-python-artifact-git-hygiene
- diagnostic: ops/bin/as6-diagnose-python-artifact-git-hygiene
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-python-variable-contract
- diagnostic: ops/bin/as6-diagnose-python-variable-contract
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-raw-fail-consumers
- diagnostic: ops/bin/as6-diagnose-raw-fail-consumers
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-reboot-evidence-cache
- diagnostic: ops/bin/as6-diagnose-reboot-evidence-cache
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-reboot-evidence-self-heal
- diagnostic: ops/bin/as6-diagnose-reboot-evidence-self-heal
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-reboot-evidence-symbols
- diagnostic: ops/bin/as6-diagnose-reboot-evidence-symbols
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-reboot-forensics
- diagnostic: ops/bin/as6-diagnose-reboot-forensics
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-reboot-forensics-runtime
- diagnostic: ops/bin/as6-diagnose-reboot-forensics-runtime
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-reboot-origin
- diagnostic: ops/bin/as6-diagnose-reboot-origin
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-restore-drill
- diagnostic: ops/bin/as6-diagnose-restore-drill
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-restore-drill-history
- diagnostic: ops/bin/as6-diagnose-restore-drill-history
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-restore-readiness
- diagnostic: ops/bin/as6-diagnose-restore-readiness
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-rollback-readiness
- diagnostic: ops/bin/as6-diagnose-rollback-readiness
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-cache
- diagnostic: ops/bin/as6-diagnose-root-cause-cache
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-canonicalization
- diagnostic: ops/bin/as6-diagnose-root-cause-canonicalization
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-contract
- diagnostic: ops/bin/as6-diagnose-root-cause-contract
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-dashboard
- diagnostic: ops/bin/as6-diagnose-root-cause-dashboard
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-governance
- diagnostic: ops/bin/as6-diagnose-root-cause-governance
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-knowledge-base
- diagnostic: ops/bin/as6-diagnose-root-cause-knowledge-base
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-remediation
- diagnostic: ops/bin/as6-diagnose-root-cause-remediation
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-router
- diagnostic: ops/bin/as6-diagnose-root-cause-router
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-staleness
- diagnostic: ops/bin/as6-diagnose-root-cause-staleness
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-token-policy
- diagnostic: ops/bin/as6-diagnose-root-cause-token-policy
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-v2
- diagnostic: ops/bin/as6-diagnose-root-cause-v2
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-root-cause-validation
- diagnostic: ops/bin/as6-diagnose-root-cause-validation
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-runtime-artifact-format
- diagnostic: ops/bin/as6-diagnose-runtime-artifact-format
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-runtime-artifacts
- diagnostic: ops/bin/as6-diagnose-runtime-artifacts
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-runtime-binary-artifacts
- diagnostic: ops/bin/as6-diagnose-runtime-binary-artifacts
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-runtime-stale-tmp-artifacts
- diagnostic: ops/bin/as6-diagnose-runtime-stale-tmp-artifacts
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-ssh-heredoc-guard
- diagnostic: ops/bin/as6-diagnose-ssh-heredoc-guard
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-ssh-stability
- diagnostic: ops/bin/as6-diagnose-ssh-stability
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-status-registry-consistency
- diagnostic: ops/bin/as6-diagnose-status-registry-consistency
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-strategic-readiness
- diagnostic: ops/bin/as6-diagnose-strategic-readiness
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-unreachable-diagnostic-blocks
- diagnostic: ops/bin/as6-diagnose-unreachable-diagnostic-blocks
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-vps-baseline
- diagnostic: ops/bin/as6-diagnose-vps-baseline
- registry: registered
- source: diagnostic-status-registry-autobuild

## Diagnostic Registry: as6-diagnose-workflow-yaml
- diagnostic: ops/bin/as6-diagnose-workflow-yaml
- registry: registered
- source: diagnostic-status-registry-autobuild

## Autonomous Validation Controller Wrapper
- diagnostic: ops/bin/as6-autonomous-validation-controller
- delegates_to: ops/bin/as6-diagnose-autonomous-validation-controller
- result: AS6_AUTONOMOUS_VALIDATION_CONTROLLER_RESULT

## KB Incident Cascade Reconciliation
- diagnostic: ops/bin/as6-autonomous-incident-auto-close-reconciliation-controller
- result: AS6_INCIDENT_AUTO_CLOSE_RECONCILIATION_RESULT

## Coverage Doc Contract Marker Repair
- diagnostic: coverage_doc_contract_marker
- result: COVERAGE_DOC_CONTRACT_MARKER_REPAIR=OK

## Autonomous Repair Controller Wrapper
- diagnostic: ops/bin/as6-autonomous-repair-controller
- delegates_to: ops/bin/as6-diagnose-autonomous-repair-controller
- result: AS6_AUTONOMOUS_REPAIR_CONTROLLER_RESULT

## Runtime Binary Empty Tmp Repair
- diagnostic: runtime_binary_empty_tmp_skip
- result: RUNTIME_BINARY_ARTIFACTS_RESULT

- ops/bin/as6-diagnose-public-health

- ops/bin/as6-diagnose-all-watch

- ops/bin/as6-diagnose-diagnostics-first-operating-standard
