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
| ops/bin/as6-diagnose-true-live-spinner | true-live-spinner | ENABLED |
| ops/bin/as6-diagnose-all-live | live-spinner-diagnostics | ENABLED |
| ops/bin/as6-diagnose-live-spinner-registration | live-spinner-registration-contract | ENABLED |
| ops/bin/as6-diagnose-watch-heartbeat | simple-watch-heartbeat | ENABLED |
| ops/bin/as6-diagnose-one-command-standard | one-command-diagnostics-first-standard | ENABLED |
| ops/bin/as6-diagnose-backup-secret-scan-contract | as6-one-command-and-diagnostic-contract | ENABLED |
| ops/bin/as6-diagnose-completion-marker-contract | one-command-completion-contract | ENABLED |
| ops/bin/as6-diagnose-registered-diagnostic-git-tracking | registered-diagnostic-git-tracking | ENABLED |
| ops/bin/as6-diagnose-autonomous-diagnostic-expansion-validation | generated-failure-class-diagnostic | ENABLED |
| ops/bin/as6-self-expand-diagnostics | self-expanding-diagnostics-framework | ENABLED |
| ops/bin/as6-diagnose-self-expanding-diagnostics | self-expanding-diagnostics-framework | ENABLED |
| ops/bin/as6-auto-expansion-router | autonomous-expansion-router | ENABLED |
| ops/bin/as6-diagnose-auto-expansion-router | autonomous-expansion-router | ENABLED |
| ops/bin/as6-diagnose-runtime-stage-gap | runtime-stage-gap+auto-expansion-router | ENABLED |
| ops/bin/as6-diagnose-runtime-stage-gap-exit-code | runtime-stage-gap-exit-code-contract | ENABLED |
| ops/bin/as6-diagnose-runtime-stage-gap-final-marker | runtime-stage-gap-final-marker-contract | ENABLED |
| ops/bin/as6-diagnose-runtime-stage-gap-policy-text | runtime-stage-gap-policy-text-contract | ENABLED |
| ops/bin/as6-diagnose-diagnose-all-wait-signature | diagnose-all-wait-signature | ENABLED |
| ops/bin/as6-diagnose-backup-discovery-drift | backup-diagnostic-discovery-drift | ENABLED |
| ops/bin/as6-diagnose-fast-summary | diagnostic-simplification-performance | ENABLED |
| ops/bin/as6-diagnose-diagnostic-simplification | diagnostic-simplification-performance | ENABLED |
| ops/bin/as6-diagnose-active-autonomy-score | active-autonomy-score-contract | ENABLED |
| ops/bin/as6-diagnose-primary-fail-repair | primary-fail-repair | ENABLED |
| ops/bin/as6-diagnose-primary-fail-repair-v2 | primary-fail-repair-v2 | ENABLED |
| ops/bin/as6-diagnose-universal-heartbeat-wrapper | heartbeat-wrapper-diagnostic | ENABLED |
| ops/bin/as6-diagnose-heartbeat-wrapper-registry-match | heartbeat-wrapper-registry-match | ENABLED |
| ops/bin/as6-diagnose-as6-test-router-drift-warn | generated-failure-class-diagnostic | ENABLED |
| ops/bin/as6-diagnose-as6-test-router-gap-fail | generated-failure-class-diagnostic | ENABLED |
| ops/bin/as6-diagnose-status-registry-sync | diagnostic-status-registry-sync | ENABLED |
| ops/bin/as6-diagnose-status-registry-schema-sync | diagnostic-status-registry-schema-sync | ENABLED |
| ops/bin/as6-diagnose-autonomous-change-approval-controller | governance-controller-convergence | ENABLED |
| ops/bin/as6-diagnose-autonomous-incident-governance-controller | governance-controller-convergence | ENABLED |
| ops/bin/as6-diagnose-autonomous-incident-lifecycle-controller | governance-controller-convergence | ENABLED |
| ops/bin/as6-diagnose-autonomous-knowledge-base-controller | governance-controller-convergence | ENABLED |
| ops/bin/as6-diagnose-governance-controller-convergence | governance-controller-convergence | ENABLED |
| ops/bin/as6-diagnose-unified-autonomy-orchestrator | governance-controller-convergence | ENABLED |
| ops/bin/as6-diagnose-final-registry-convergence | final-registry-convergence | ENABLED |
| ops/bin/as6-diagnose-registration-matcher-canonical | registration-matcher-canonical | ENABLED |
| ops/bin/as6-clean-python-artifacts | python-bytecode-artifact-hygiene | ENABLED |
| ops/bin/as6-diagnose-autonomous-controller-cluster | autonomous-controller-cluster-contract | ENABLED |
| ops/bin/as6-diagnose-controller-cluster-status-registry | controller-cluster-status-registry | ENABLED |
| ops/bin/as6-diagnose-fast-final-green-proof | fast-final-green-proof | ENABLED |
| ops/bin/as6-diagnose-fast-final-green-proof-control | fast-final-green-proof | ENABLED |
- ops/bin/as6-diagnose-meta-diagnostic-quality | AS6 meta diagnostic quality gate | GREEN
- ops/bin/as6-diagnose-meta-diagnostic-dedup | AS6 meta diagnostic dedup candidate scan | GREEN
- ops/bin/as6-diagnose-command-center-hook-order | AS6 command center React hook/order runtime black-screen guard | GREEN
- ops/bin/as6-diagnose-command-center-deployment | AS6 command center deployment/runtime marker verification | GREEN
- ops/bin/as6-diagnose-command-center-mission-control-layout | AS6 command center mission-control visual architecture gate | GREEN
- ops/bin/as6-diagnose-command-center-executive-ux-v6 | AS6 command center executive UX V6 visual-functional gate | GREEN
- ops/bin/as6-diagnose-command-center-screenshot-match-v7 | AS6 command center screenshot-match V7 visual-functional gate | GREEN
- ops/bin/as6-diagnose-command-center-pixel-perfect-v8 | AS6 command center pixel-perfect V8 visual architecture gate | GREEN
- ops/bin/as6-diagnose-command-center-executive-v10 | AS6 command center executive V10 pixel polish gate | GREEN
- ops/bin/as6-diagnose-command-center-pixel-polish-v11 | AS6 command center pixel polish V11 visual gate | GREEN
- ops/bin/as6-diagnose-command-center-final-pixel-v12 | AS6 command center final pixel V12 visual gate | GREEN
- ops/bin/as6-diagnose-command-center-visual-fix-v13 | AS6 command center visual fix V13 gate | GREEN
- ops/bin/as6-diagnose-command-center-visual-actions-v14 | AS6 command center visual actions V14 gate | GREEN
- ops/bin/as6-diagnose-appshell-jsx-tag-integrity | AS6 AppShell JSX tag integrity gate | GREEN
- ops/bin/as6-diagnose-command-center-recommendation-actions | AS6 command center recommendation action navigation gate | GREEN
- ops/bin/as6-diagnose-command-center-executive-cleanup-v16 | AS6 command center executive cleanup V16 route and visual contract gate | GREEN
- ops/bin/as6-diagnose-command-center-avatar-reference | AS6 command center avatar reference and Copilot CTA layout gate | GREEN
- ops/bin/as6-diagnose-command-center-visual-reference-v18 | AS6 command center visual reference V18 brand/icon/avatar/CTA gate | GREEN
- ops/bin/as6-diagnose-command-center-pixel-reference-v19 | AS6 command center pixel reference V19 logo/icon/avatar/CTA L2 gate | GREEN
- ops/bin/as6-diagnose-command-center-real-assets-v20 | AS6 Command Center real asset components and AppShell tag gate | GREEN
- ops/bin/as6-diagnose-command-center-real-logo-v21 | AS6 Command Center real logo asset gate | GREEN
- ops/bin/as6-diagnose-command-center-logo-top-v22 | AS6 logo top placement gate | GREEN
- ops/bin/as6-diagnose-command-center-robot-kpi-v23 | AS6 Command Center real robot KPI asset and single import gate | GREEN
- ops/bin/as6-diagnose-command-center-ai-workforce-robot-v24 | AS6 real robot in KPI and AI workforce rows gate | GREEN

## as6-diagnose-command-center-no-emoji-avatars-v28
Status: ENABLED
Scope: AI Command Center emoji avatar regression prevention
File: ops/bin/as6-diagnose-command-center-no-emoji-avatars-v28

## as6-diagnose-command-center-jsx-object-integrity-v31
Status: ENABLED
Scope: CommandCenterPage JSX object integrity and asset variable drift diagnostics
File: ops/bin/as6-diagnose-command-center-jsx-object-integrity-v31

## as6-diagnose-ai-kpi-robot-asset-v32
Status: ENABLED

## as6-diagnose-post-deploy-health-readiness-v33
Status: ENABLED
Scope: Post-deploy nginx/backend health readiness validation
File: ops/bin/as6-diagnose-post-deploy-health-readiness-v33

## as6-diagnose-frontend-bundle-v35
Status: ENABLED
Scope: Frontend Vite bundle diagnostics
File: ops/bin/as6-diagnose-frontend-bundle-v35

## as6-diagnose-robot-asset-size-v36
Status: ENABLED
Scope: Canonical AS6 robot PNG asset size diagnostics
File: ops/bin/as6-diagnose-robot-asset-size-v36

## as6-diagnose-copilot-visual-cleanup-v37
Status: ENABLED
Scope: AI Copilot duplicate visual asset and CTA layout diagnostics
File: ops/bin/as6-diagnose-copilot-visual-cleanup-v37

## as6-diagnose-copilot-style-consolidation-v38
Status: ENABLED
Scope: Copilot CSS layer drift and authoritative style diagnostics
File: ops/bin/as6-diagnose-copilot-style-consolidation-v38

## as6-diagnose-copilot-css-and-robot-cleanup-v39
Status: ENABLED
Scope: Copilot CSS cleanup and robot asset guard
File: ops/bin/as6-diagnose-copilot-css-and-robot-cleanup-v39

## as6-diagnose-copilot-inline-layout-v40
Status: ENABLED
Scope: AI Copilot compact inline logo plus CTA layout diagnostics
File: ops/bin/as6-diagnose-copilot-inline-layout-v40

## as6-diagnose-copilot-button-align-v41
Status: ENABLED
Scope: AI Copilot logo opposite CTA alignment and CTA text diagnostics
File: ops/bin/as6-diagnose-copilot-button-align-v41

## as6-diagnose-copilot-css-syntax-cleanup-v42
Status: ENABLED
Scope: Copilot CSS syntax drift and terminal style diagnostics
File: ops/bin/as6-diagnose-copilot-css-syntax-cleanup-v42

## as6-diagnose-css-orphan-brace-v43
Status: ENABLED
Scope: CSS orphan closing brace and syntax warning diagnostics
File: ops/bin/as6-diagnose-css-orphan-brace-v43

## as6-diagnose-copilot-orphan-fragment-v44
Status: ENABLED
Scope: Copilot orphan CSS fragment and frontend CSS warning diagnostics
File: ops/bin/as6-diagnose-copilot-orphan-fragment-v44

## as6-diagnose-command-center-final-v45
Status: ENABLED
Scope: Final AI Command Center closure diagnostic
File: ops/bin/as6-diagnose-command-center-final-v45

## as6-diagnose-frontend-asset-budget-v46
Status: ENABLED
Scope: Frontend visual asset budget and Command Center asset reference diagnostics
File: ops/bin/as6-diagnose-frontend-asset-budget-v46

## as6-diagnose-frontend-code-splitting-v47
Status: ENABLED
Scope: Frontend code splitting and Command Center chunk diagnostics
File: ops/bin/as6-diagnose-frontend-code-splitting-v47

## as6-diagnose-rendered-asset-paths-v48
Status: ENABLED
Scope: Rendered asset path and hashed PNG filename UI diagnostics
File: ops/bin/as6-diagnose-rendered-asset-paths-v48

## as6-diagnose-quick-action-icon-v49
Status: ENABLED
Scope: Quick action icon asset text rendering diagnostics
File: ops/bin/as6-diagnose-quick-action-icon-v49

## as6-diagnose-executive-module-icon-v50
Status: ENABLED
Scope: Executive module icon asset text rendering diagnostics
File: ops/bin/as6-diagnose-executive-module-icon-v50

## as6-diagnose-logo-optimization-v51
Status: ENABLED
Scope: Logo WebP optimization and branding asset budget diagnostics
File: ops/bin/as6-diagnose-logo-optimization-v51

## as6-diagnose-css-and-bundle-budget-v52
Status: ENABLED
Scope: CSS source budget, frontend bundle budget, and Command Center chunk diagnostics
File: ops/bin/as6-diagnose-css-and-bundle-budget-v52

## as6-diagnose-global-frontend-dead-code-v53
Status: ENABLED
Scope: Global frontend dead code, legacy CSS, duplicate logo and file size diagnostics
File: ops/bin/as6-diagnose-global-frontend-dead-code-v53

## as6-diagnose-command-center-ui-restore-v54
Status: ENABLED
Scope: Restore Command Center UI after overbroad V53 cleanup regression
File: ops/bin/as6-diagnose-command-center-ui-restore-v54

## as6-diagnose-frontend-heavy-files-v55
Status: ENABLED
Scope: Heavy frontend files, route/page source budgets, duplicate logo regression, WebP branding guard
File: ops/bin/as6-diagnose-frontend-heavy-files-v55

## as6-diagnose-crm-route-chunk-v56
Status: ENABLED
Scope: CRM and AI Workers route-level lazy loading and chunk diagnostics
File: ops/bin/as6-diagnose-crm-route-chunk-v56

## as6-diagnose-black-screen-react-import-v57
Status: ENABLED
Scope: React lazy/Suspense import drift and black screen prevention
File: ops/bin/as6-diagnose-black-screen-react-import-v57

## as6-diagnose-frontend-budgets-v58
Status: ENABLED
Scope: Autonomous frontend JS/CSS/route/image/source budgets and regression prevention
File: ops/bin/as6-diagnose-frontend-budgets-v58

## as6-diagnose-image-asset-ownership-v59
Status: ENABLED
Scope: Image asset ownership, logo PNG/WebP usage, duplicate logo and build asset diagnostics
File: ops/bin/as6-diagnose-image-asset-ownership-v59

## as6-diagnose-png-to-webp-branding-v60
Status: ENABLED
Scope: Sidebar branding PNG to WebP migration and branding asset budget diagnostics
File: ops/bin/as6-diagnose-png-to-webp-branding-v60

## as6-diagnose-css-ownership-v61
Status: ENABLED
Scope: CSS ownership, selector duplication, CSS contracts, source and bundle budget diagnostics
File: ops/bin/as6-diagnose-css-ownership-v61

## as6-diagnose-selector-ownership-map-v62
Status: ENABLED
Scope: CSS selector ownership map, probable dead selector report, protected contract selector diagnostics
File: ops/bin/as6-diagnose-selector-ownership-map-v62

## as6-diagnose-frontend-route-splitting-v63
Status: ENABLED
Scope: Protected route lazy loading, route chunk emission, runtime import guards
File: ops/bin/as6-diagnose-frontend-route-splitting-v63

## as6-diagnose-route-splitting-cache-aware-v63-2
Status: ENABLED
Scope: Cache-aware route splitting diagnostic repair for Docker cached builds
File: ops/bin/as6-diagnose-route-splitting-cache-aware-v63-2

## as6-diagnose-route-splitting-running-container-v63-3
Status: ENABLED
Scope: Running nginx container route chunk asset validation and stale image false negative prevention
File: ops/bin/as6-diagnose-route-splitting-running-container-v63-3

## as6-diagnose-frontend-dead-code-v64
Status: ENABLED
Scope: Frontend dead-code ownership, unused pages/components/CSS, legacy Command Center CSS diagnostics
File: ops/bin/as6-diagnose-frontend-dead-code-v64

## as6-diagnose-css-dead-selectors-v65
Status: ENABLED
Scope: CSS dead selector ownership, protected selector guard, legacy Command Center CSS drift diagnostics
File: ops/bin/as6-diagnose-css-dead-selectors-v65

## as6-diagnose-css-consolidation-v66
Status: ENABLED
Scope: Safe CSS consolidation gate and protected selector guard
File: ops/bin/as6-diagnose-css-consolidation-v66

## as6-diagnose-frontend-page-decomposition-v67
Status: ENABLED
Scope: Oversized frontend pages, services, route chunk and decomposition plan diagnostics
File: ops/bin/as6-diagnose-frontend-page-decomposition-v67

## as6-diagnose-crm-page-decomposition-v68
Status: ENABLED
Scope: CRMPage decomposition blueprint, candidates, chunk validation and safety controls
File: ops/bin/as6-diagnose-crm-page-decomposition-v68

## as6-diagnose-crm-decomposition-execution-guard-v69
Status: ENABLED
Scope: CRM decomposition execution contract, complexity map, extraction sequence and chunk validation
File: ops/bin/as6-diagnose-crm-decomposition-execution-guard-v69

## as6-diagnose-crm-panel-extraction-scaffold-v70
Status: ENABLED
Scope: CRM panel module boundaries, no-UI scaffold contract, chunk validation
File: ops/bin/as6-diagnose-crm-panel-extraction-scaffold-v70

## as6-diagnose-crm-analytics-panel-contract-v71
Status: ENABLED
Scope: CRM Analytics panel props contract, no-UI contract stage, chunk validation
File: ops/bin/as6-diagnose-crm-analytics-panel-contract-v71

## as6-diagnose-crm-analytics-panel-wiring-guard-v72
Status: ENABLED
Scope: CRM Analytics panel import guard, no-render stage, chunk validation
File: ops/bin/as6-diagnose-crm-analytics-panel-wiring-guard-v72

## as6-diagnose-diagnostic-debt-consolidation-v73-safe
Status: ENABLED
Scope: Diagnostic debt consolidation, stale artifact quarantine, frontend route splitting drift closure, route chunk validation
File: ops/bin/as6-diagnose-diagnostic-debt-consolidation-v73-safe

## as6-diagnose-v73-precommit-false-positive-repair
Status: ENABLED
Scope: V73 precommit null-token-initializer false positive repair, explicit secret scan, no-runtime-staging, route chunk validation
File: ops/bin/as6-diagnose-v73-precommit-false-positive-repair

## as6-diagnose-crm-analytics-panel-render-wiring-v74
Status: ENABLED
Scope: CRM Analytics panel null render wiring, full props contract, no-visible-UI guard, route chunk validation
File: ops/bin/as6-diagnose-crm-analytics-panel-render-wiring-v74

## as6-diagnose-repair-crm-analytics-panel-render-wiring-v74
Status: ENABLED
Scope: CRM Analytics targeted render wiring repair, no global fragment wrapping, no-visible-UI guard, route chunk validation
File: ops/bin/as6-diagnose-repair-crm-analytics-panel-render-wiring-v74

## as6-diagnose-repair-v74-docs-secret-scan-false-positive
Status: ENABLED
Scope: V74 docs secret-scan false-positive repair, docs wording guard, no-runtime-staging, route chunk validation
File: ops/bin/as6-diagnose-repair-v74-docs-secret-scan-false-positive

## as6-diagnose-repair-v74-staged-diff-reset-and-commit
Status: ENABLED
Scope: V74 staged diff reset, failed artifact quarantine, no-runtime-staging, route chunk validation
File: ops/bin/as6-diagnose-repair-v74-staged-diff-reset-and-commit

## as6-diagnose-repair-crm-analytics-visible-bridge-v75
Status: ENABLED
Scope: CRM Analytics visible bridge repair, explicit closing tag guard, no-wrapper guard, route chunk validation
File: ops/bin/as6-diagnose-repair-crm-analytics-visible-bridge-v75

## as6-diagnose-crm-analytics-render-owner-v76
Status: ENABLED
Scope: CRM Analytics render ownership via render prop, no-wrapper guard, route chunk validation
File: ops/bin/as6-diagnose-crm-analytics-render-owner-v76

## as6-diagnose-repair-v76-terminal-paste-integrity
Status: ENABLED
Scope: V76 terminal paste corruption repair, render-owner verification, no-runtime-staging, route chunk validation
File: ops/bin/as6-diagnose-repair-v76-terminal-paste-integrity

## as6-diagnose-crm-analytics-internal-panel-owner-v77
Status: ENABLED
Scope: CRM Analytics internal panel owner migration, DOM class preservation, rollback copy guard, route chunk validation
File: ops/bin/as6-diagnose-crm-analytics-internal-panel-owner-v77
- V78 | ops/bin/as6-diagnose-crm-analytics-remove-legacy-rollback-copy-v78 | CRM analytics legacy rollback copy removal diagnostic | ENABLED
- V78B | DIAGNOSTIC_SELF_MATCH_MARKDOWN_URL | Diagnostic self-match prevention | ENABLED
- V78C | HOST_NPM_MISSING_BUILD_RUNNER_GAP | Control detects host npm absence and uses Docker build fallback | ENABLED
- V78D | DOCKER_COMPOSE_IMAGE_AS_SERVICE_BUILD_RUNNER_GAP | Prevent external image from being treated as Compose service | ENABLED
- V79 | ops/bin/as6-diagnose-diagnostic-artifact-reconciliation-v79 | Diagnostic artifact reconciliation and drift detection | ENABLED
- V79 | ops/bin/as6-diagnose-crm-analytics-panel-visible-bridge-v75 | Reconciled historical diagnostic/control artifact | ENABLED
- V79 | ops/bin/as6-control-crm-analytics-panel-visible-bridge-v75 | Reconciled historical diagnostic/control artifact | ENABLED
- V79 | ops/bin/as6-diagnose-repair-v74-diag-script-secret-scan-false-positive | Reconciled historical diagnostic/control artifact | ENABLED
- V79 | ops/bin/as6-control-repair-v74-diag-script-secret-scan-false-positive | Reconciled historical diagnostic/control artifact | ENABLED
- V80 | ops/bin/as6-diagnose-project-state-readiness-snapshot-v80 | Project state production readiness snapshot diagnostic | ENABLED
- V80B | READINESS_BASELINE_MARKER_TOO_STRICT | Prevents readiness baseline false negative from exact marker mismatch | ENABLED
- V80B | READINESS_DIAGNOSTIC_SELF_VALIDATION_STAGED_CHANGE_FALSE_POSITIVE | Prevents staged self-validation worktree false positive | ENABLED
- V81 | ops/bin/as6-diagnose-autonomous-diagnostic-expansion-v81 | Autonomous diagnostic expansion scanner and gap discovery report | ENABLED
- V81 | AUTONOMOUS_DIAGNOSTIC_EXPANSION_GAP | Autonomous diagnostic expansion failure class | ENABLED
- V81 | DIAGNOSTIC_COVERAGE_INDEX_GAP | Autonomous diagnostic expansion failure class | ENABLED
- V81 | GOVERNANCE_PREVENTION_COVERAGE_GAP | Autonomous diagnostic expansion failure class | ENABLED
- V81 | MONITORING_GAP_SCAN_MISSING | Autonomous diagnostic expansion failure class | ENABLED
- V81 | VALIDATION_GAP_SCAN_MISSING | Autonomous diagnostic expansion failure class | ENABLED
- V81 | ROLLBACK_GAP_SCAN_MISSING | Autonomous diagnostic expansion failure class | ENABLED
- V81 | AEC_RULE_COVERAGE_GAP | Autonomous diagnostic expansion failure class | ENABLED
- V81 | DIAGNOSTIC_ARTIFACT_REGISTRY_GAP_DISCOVERED | Autonomous diagnostic expansion failure class | ENABLED
- V81 | AUTONOMOUS_GAP_DISCOVERY_REPORT_MISSING | Autonomous diagnostic expansion failure class | ENABLED
- V81B | ops/bin/as6-control-autonomous-diagnostic-expansion-v81 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-black-screen-react-import-v57 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-command-center-final-v45 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-command-center-jsx-v31 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-command-center-ui-restore-v54 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-copilot-button-align-v41 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-copilot-css-syntax-cleanup-v42 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-copilot-inline-layout-v40 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-copilot-orphan-fragment-v44 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-copilot-style-consolidation-v38 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-copilot-visual-cleanup-v37 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-analytics-internal-panel-owner-v77 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-analytics-panel-contract-v71 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-analytics-panel-wiring-guard-v72 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-analytics-remove-legacy-rollback-copy-v78 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-analytics-render-owner-v76 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-decomposition-execution-guard-v69 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-page-decomposition-v68 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-panel-extraction-scaffold-v70 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-crm-route-chunk-v56 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-css-and-bundle-budget-v52 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-css-consolidation-v66 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-css-dead-selectors-v65 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-css-ownership-v61 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-diagnostic-artifact-reconciliation-v79 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-diagnostic-debt-consolidation-v73-safe | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-executive-module-icon-v50 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-frontend-asset-budget-v46 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-frontend-budgets-v58 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-frontend-code-splitting-v47 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-frontend-dead-code-v64 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-frontend-heavy-files-v55 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-frontend-page-decomposition-v67 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-global-frontend-dead-code-v53 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-image-asset-ownership-v59 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-logo-optimization-v51 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-png-to-webp-branding-v60 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-post-deploy-health-v33 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-project-state-readiness-snapshot-v80 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-quick-action-icon-v49 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-rendered-asset-paths-v48 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-repair-crm-analytics-panel-render-wiring-v74 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-repair-crm-analytics-visible-bridge-v75 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-repair-v74-docs-secret-scan-false-positive | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-repair-v74-staged-diff-reset-and-commit | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-repair-v76-terminal-paste-integrity | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-robot-asset-size-v36 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-selector-ownership-map-v62 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-control-v73-precommit-false-positive-repair | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-diagnose-ai-kpi-robot-asset-v32 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-diagnose-ai-kpi-visual-parity-v34 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-diagnose-command-center-visual-parity-v27 | Historical diagnostic artifact reconciled | ENABLED
- V81B | ops/bin/as6-diagnose-diagnostic-registry-reconciliation-v81b | Diagnostic registry reconciliation scanner | ENABLED
- V82 | ops/bin/as6-diagnose-registry-reconciliation-enforcement-v82 | Registry reconciliation enforcement diagnostic | ENABLED
- V82 | REGISTRY_ENFORCEMENT_BYPASS | Registry reconciliation enforcement failure class | ENABLED
- V82 | COVERAGE_ENFORCEMENT_BYPASS | Registry reconciliation enforcement failure class | ENABLED
- V82 | GOVERNANCE_ENFORCEMENT_BYPASS | Registry reconciliation enforcement failure class | ENABLED
- V82 | AEC_ENFORCEMENT_BYPASS | Registry reconciliation enforcement failure class | ENABLED
- V82 | STATE_ENFORCEMENT_BYPASS | Registry reconciliation enforcement failure class | ENABLED
- V82 | DETECTED_ERRORS_ENFORCEMENT_BYPASS | Registry reconciliation enforcement failure class | ENABLED
- V82 | ORPHAN_DIAGNOSTIC_COMMIT_BLOCK_REQUIRED | Registry reconciliation enforcement failure class | ENABLED
- V82 | ORPHAN_CONTROL_COMMIT_BLOCK_REQUIRED | Registry reconciliation enforcement failure class | ENABLED
- V83 | ops/bin/as6-diagnose-pre-commit-push-enforcement-wiring-v83 | Pre-commit/push enforcement wiring diagnostic | ENABLED
- V83 | PRE_COMMIT_ENFORCEMENT_WIRING_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | PUSH_ENFORCEMENT_WIRING_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | ENFORCEMENT_WORKFLOW_GUARD_MISSING | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | ENFORCEMENT_WORKFLOW_SECRET_SCAN_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | ENFORCEMENT_WORKFLOW_RUNTIME_STAGING_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | ENFORCEMENT_WORKFLOW_HEALTH_CHECK_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | ENFORCEMENT_WORKFLOW_REGISTRY_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83 | ENFORCEMENT_WORKFLOW_READINESS_GAP | Pre-commit/push enforcement wiring failure class | ENABLED
- V83B | V83_ENFORCEMENT_SELF_VALIDATION_ALLOWLIST_GAP | Pre-commit/push enforcement self-validation failure class | ENABLED
- V83B | SAME_CYCLE_ENFORCEMENT_MODE_REQUIRED | Pre-commit/push enforcement self-validation failure class | ENABLED
- V83B | READINESS_CONTROL_STRICT_MODE_DURING_ENFORCEMENT_WIRING | Pre-commit/push enforcement self-validation failure class | ENABLED
- V83B | PRE_COMMIT_PUSH_GUARD_SELF_VALIDATION_FALSE_POSITIVE | Pre-commit/push enforcement self-validation failure class | ENABLED
- V83C | SAME_CYCLE_INLINE_READINESS_REQUIRED | Same-cycle inline readiness enforcement failure class | ENABLED
- V83C | STRICT_READINESS_DIAGNOSTIC_IN_SAME_CYCLE_GAP | Same-cycle inline readiness enforcement failure class | ENABLED
- V83C | INLINE_READINESS_EVIDENCE_MISSING | Same-cycle inline readiness enforcement failure class | ENABLED
- V83C | PRE_COMMIT_PUSH_GUARD_STRICT_READINESS_FALSE_POSITIVE | Same-cycle inline readiness enforcement failure class | ENABLED
- V83D | INLINE_READINESS_EVIDENCE_ALIAS_GAP | Same-cycle readiness alias evidence failure class | ENABLED
- V83D | READINESS_COMPLETION_MARKER_ALIAS_REQUIRED | Same-cycle readiness alias evidence failure class | ENABLED
- V83D | SINGLE_MARKER_READINESS_EVIDENCE_FALSE_NEGATIVE | Same-cycle readiness alias evidence failure class | ENABLED
- V83D | SAME_CYCLE_READINESS_ALIAS_VALIDATION_REQUIRED | Same-cycle readiness alias evidence failure class | ENABLED
- V84 | ops/bin/as6-diagnose-autonomous-governance-enforcement-v84 | Autonomous governance enforcement diagnostic | ENABLED
- V84 | AUTONOMOUS_GOVERNANCE_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | AUTONOMOUS_AEC_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | AUTONOMOUS_CONTROL_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | AUTONOMOUS_FAILURE_CLASS_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | AUTONOMOUS_AUTOMATION_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | AUTONOMOUS_STATE_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | AUTONOMOUS_DETECTED_ERRORS_DRIFT | Autonomous governance enforcement failure class | ENABLED
- V84 | GOVERNANCE_ENFORCEMENT_COMMIT_BLOCK_REQUIRED | Autonomous governance enforcement failure class | ENABLED
- V84 | GOVERNANCE_ENFORCEMENT_PUSH_BLOCK_REQUIRED | Autonomous governance enforcement failure class | ENABLED
- V84 | ops/governance/as6-autonomous-governance-enforcement-root-cause-v84.md | Autonomous governance enforcement artifact alias | ENABLED
- V84 | ops/governance/as6-autonomous-governance-enforcement-plan-v84.md | Autonomous governance enforcement artifact alias | ENABLED
- V84 | ops/governance/as6-autonomous-governance-enforcement-control-v84.md | Autonomous governance enforcement artifact alias | ENABLED
- V84 | ops/governance/as6-autonomous-governance-enforcement-failure-classes-v84.md | Autonomous governance enforcement artifact alias | ENABLED
- V84 | ops/governance/as6-autonomous-governance-enforcement-aec-v84.md | Autonomous governance enforcement artifact alias | ENABLED
- V84 | ops/governance/as6-autonomous-governance-enforcement-automation-v84.md | Autonomous governance enforcement artifact alias | ENABLED
- V84B | GOVERNANCE_ARTIFACT_SELF_REGISTRATION_GAP | Autonomous governance self-registration failure class | ENABLED
- V84B | GOVERNANCE_ALIAS_COVERAGE_FALSE_NEGATIVE | Autonomous governance self-registration failure class | ENABLED
- V84B | GOVERNANCE_ENFORCEMENT_SELF_VALIDATION_GAP | Autonomous governance self-registration failure class | ENABLED
- V84B | GOVERNANCE_STAGE_ARTIFACT_ALIAS_REQUIRED | Autonomous governance self-registration failure class | ENABLED
- V85 | ops/bin/as6-diagnose-mission-control-design-system-v85 | AS6 Mission Control UI design system diagnostic | ENABLED
- V85 | UI_DESIGN_SYSTEM_DRIFT | AS6 Mission Control UI failure class | ENABLED
- V85 | COMMAND_CENTER_STYLE_DRIFT | AS6 Mission Control UI failure class | ENABLED
- V85 | CROSS_PAGE_VISUAL_INCONSISTENCY | AS6 Mission Control UI failure class | ENABLED
- V85 | UI_DENSITY_DRIFT | AS6 Mission Control UI failure class | ENABLED
- V85 | UI_PERFORMANCE_STYLE_DRIFT | AS6 Mission Control UI failure class | ENABLED
- V85 | BRAND_TOKEN_MISSING | AS6 Mission Control UI failure class | ENABLED
- V85 | GLOBAL_UI_IMPORT_MISSING | AS6 Mission Control UI failure class | ENABLED
- V85 | RESPONSIVE_LAYOUT_DRIFT | AS6 Mission Control UI failure class | ENABLED
- V85B | UI_DIAGNOSTIC_SECRET_SCAN_FALSE_POSITIVE | UI diagnostic secret-scan false-positive failure class | ENABLED
- V85B | DIAGNOSTIC_OUTPUT_SECRET_SCAN_HEURISTIC_COLLISION | UI diagnostic secret-scan false-positive failure class | ENABLED
- V85B | DESIGN_SYSTEM_TOKEN_CHECK_OUTPUT_DRIFT | UI diagnostic secret-scan false-positive failure class | ENABLED
- V86 | ops/bin/as6-diagnose-mission-control-workspace-v86 | AS6 Mission Control Workspace diagnostic | ENABLED
- V86 | MISSION_CONTROL_WORKSPACE_DRIFT | AS6 Mission Control Workspace failure class | ENABLED
- V86 | COMMAND_CENTER_LAYOUT_DRIFT | AS6 Mission Control Workspace failure class | ENABLED
- V86 | CROSS_PAGE_WORKSPACE_INCONSISTENCY | AS6 Mission Control Workspace failure class | ENABLED
- V86 | COMPACT_DENSITY_DRIFT | AS6 Mission Control Workspace failure class | ENABLED
- V86 | DEBUG_UI_EXPOSURE_DRIFT | AS6 Mission Control Workspace failure class | ENABLED
- V86 | MOBILE_WORKSPACE_DRIFT | AS6 Mission Control Workspace failure class | ENABLED
- V86 | STICKY_COCKPIT_LAYOUT_GAP | AS6 Mission Control Workspace failure class | ENABLED
- V86 | WORKSPACE_PERFORMANCE_STYLE_GAP | AS6 Mission Control Workspace failure class | ENABLED
- V87 | ops/bin/as6-diagnose-frontend-architecture-audit-v87 | Frontend architecture audit diagnostic | ENABLED
- V87 | FRONTEND_ARCHITECTURE_MAP_MISSING | Frontend architecture audit failure class | ENABLED
- V87 | UI_COMPONENT_INVENTORY_GAP | Frontend architecture audit failure class | ENABLED
- V87 | BLIND_CSS_OVERLAY_DRIFT | Frontend architecture audit failure class | ENABLED
- V87 | UI_REFACTOR_ROADMAP_MISSING | Frontend architecture audit failure class | ENABLED
- V87 | FRONTEND_PAGE_MAP_DRIFT | Frontend architecture audit failure class | ENABLED
- V87 | COMPONENT_REUSE_GAP | Frontend architecture audit failure class | ENABLED
- V87 | UI_LAYOUT_ENGINE_GAP | Frontend architecture audit failure class | ENABLED
- V87 | COMMAND_CENTER_COMPONENT_DRIFT | Frontend architecture audit failure class | ENABLED
- V88 | ops/bin/as6-diagnose-global-health-bar-v88 | AS6 Global Health Bar diagnostic | ENABLED
- V88 | GLOBAL_HEALTH_BAR_MISSING | AS6 Global Health Bar failure class | ENABLED
- V88 | GLOBAL_STATUS_VISIBILITY_GAP | AS6 Global Health Bar failure class | ENABLED
- V88 | CROSS_PAGE_HEALTH_CONTEXT_DRIFT | AS6 Global Health Bar failure class | ENABLED
- V88 | HEALTH_BAR_MOBILE_LAYOUT_DRIFT | AS6 Global Health Bar failure class | ENABLED
- V88 | HEALTH_BAR_MOUNT_GAP | AS6 Global Health Bar failure class | ENABLED
- V88 | HEALTH_BAR_PERFORMANCE_DRIFT | AS6 Global Health Bar failure class | ENABLED
- V88 | HEALTH_BAR_BRAND_DRIFT | AS6 Global Health Bar failure class | ENABLED
- V89 | ops/bin/as6-diagnose-global-command-palette-v89 | AS6 Global Command Palette diagnostic | ENABLED
- V89 | GLOBAL_COMMAND_PALETTE_MISSING | AS6 Global Command Palette failure class | ENABLED
- V89 | COMMAND_PALETTE_SHORTCUT_GAP | AS6 Global Command Palette failure class | ENABLED
- V89 | COMMAND_DISCOVERY_DRIFT | AS6 Global Command Palette failure class | ENABLED
- V89 | CROSS_PAGE_NAVIGATION_FRICTION | AS6 Global Command Palette failure class | ENABLED
- V89 | COMMAND_PALETTE_MOBILE_LAYOUT_DRIFT | AS6 Global Command Palette failure class | ENABLED
- V89 | COMMAND_PALETTE_MOUNT_GAP | AS6 Global Command Palette failure class | ENABLED
- V89 | COMMAND_PALETTE_BRAND_DRIFT | AS6 Global Command Palette failure class | ENABLED
- V89 | COMMAND_PALETTE_ACTION_REGISTRY_GAP | AS6 Global Command Palette failure class | ENABLED
- V90 | ops/bin/as6-diagnose-mission-control-layout-engine-v90 | AS6 Mission Control Layout Engine diagnostic | ENABLED
- V90 | MISSION_LAYOUT_ENGINE_MISSING | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | COPILOT_RAIL_MISSING | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | EVENT_STREAM_MISSING | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | WIDGET_STANDARDIZATION_DRIFT | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | EXECUTIVE_SUMMARY_MISSING | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | CROSS_PAGE_LAYOUT_DRIFT | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | COCKPIT_VISIBILITY_GAP | AS6 Mission Control Layout Engine failure class | ENABLED
- V90 | MISSION_CONTEXT_GAP | AS6 Mission Control Layout Engine failure class | ENABLED
- V91 | ops/bin/as6-diagnose-autonomous-event-stream-v91 | Autonomous Event Stream and AI Copilot Rail diagnostic | ENABLED
- V91 | GLOBAL_EVENT_STREAM_MISSING | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V91 | EVENT_SOURCE_COVERAGE_DRIFT | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V91 | AI_INSIGHT_PANEL_MISSING | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V91 | AUTONOMOUS_RECOMMENDATION_GAP | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V91 | PRIORITY_QUEUE_MISSING | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V91 | EXECUTIVE_ALERT_DRIFT | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V91 | CROSS_PAGE_EVENT_CONTINUITY_GAP | Autonomous Event Stream / Copilot Rail failure class | ENABLED
- V92 | ops/bin/as6-diagnose-autonomous-operations-timeline-v92 | Autonomous Operations Timeline diagnostic | ENABLED
- V92 | AUTONOMOUS_OPERATIONS_TIMELINE_MISSING | Autonomous Operations Timeline failure class | ENABLED
- V92 | OPERATIONS_EVENT_SOURCE_GAP | Autonomous Operations Timeline failure class | ENABLED
- V92 | DEPLOYMENT_TIMELINE_GAP | Autonomous Operations Timeline failure class | ENABLED
- V92 | CRM_TIMELINE_GAP | Autonomous Operations Timeline failure class | ENABLED
- V92 | GOVERNANCE_TIMELINE_GAP | Autonomous Operations Timeline failure class | ENABLED
- V92 | DIAGNOSTIC_TIMELINE_GAP | Autonomous Operations Timeline failure class | ENABLED
- V92 | INCIDENT_TIMELINE_GAP | Autonomous Operations Timeline failure class | ENABLED
- V92 | TIMELINE_SEVERITY_DRIFT | Autonomous Operations Timeline failure class | ENABLED
- V93 | ops/bin/as6-diagnose-executive-command-dashboard-v93 | Executive Command Dashboard diagnostic | ENABLED
- V93 | EXECUTIVE_COMMAND_DASHBOARD_MISSING | Executive Command Dashboard failure class | ENABLED
- V93 | EXECUTIVE_KPI_STRIP_GAP | Executive Command Dashboard failure class | ENABLED
- V93 | REVENUE_PULSE_GAP | Executive Command Dashboard failure class | ENABLED
- V93 | CRM_PULSE_GAP | Executive Command Dashboard failure class | ENABLED
- V93 | WORKFORCE_PULSE_GAP | Executive Command Dashboard failure class | ENABLED
- V93 | GOVERNANCE_PULSE_GAP | Executive Command Dashboard failure class | ENABLED
- V93 | DIAGNOSTIC_PULSE_GAP | Executive Command Dashboard failure class | ENABLED
- V93 | EXECUTIVE_ALERT_VISIBILITY_GAP | Executive Command Dashboard failure class | ENABLED
- V94 | ops/bin/as6-diagnose-executive-control-tower-completion-v94 | Executive Control Tower completion diagnostic | ENABLED
- V94 | EXECUTIVE_CONTROL_TOWER_COMPLETION_MISSING | Executive Control Tower completion failure class | ENABLED
- V94 | EXECUTIVE_DECISION_INTELLIGENCE_GAP | Executive Control Tower completion failure class | ENABLED
- V94 | EXECUTIVE_RISK_RADAR_GAP | Executive Control Tower completion failure class | ENABLED
- V94 | EXECUTIVE_ACTION_QUEUE_GAP | Executive Control Tower completion failure class | ENABLED
- V94 | EXECUTIVE_CONTROL_TOWER_COMPLETION_DRIFT | Executive Control Tower completion failure class | ENABLED
- V95 | ops/bin/as6-diagnose-unified-mission-control-ui-system-v95 | Unified Mission Control UI System diagnostic | ENABLED
- V95 | MISSION_PAGE_LAYOUT_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | CARD_SYSTEM_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | TYPOGRAPHY_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | COLOR_TOKEN_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | CHART_STYLE_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | TABLE_STYLE_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | FORM_STYLE_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | COPILOT_STYLE_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | SIDEBAR_STYLE_DRIFT | Unified Mission Control UI failure class | ENABLED
- V95 | TOPBAR_STYLE_DRIFT | Unified Mission Control UI failure class | ENABLED
- V96 | ops/bin/as6-diagnose-full-mission-control-theme-rollout-v96 | Full Mission Control Theme Rollout diagnostic | ENABLED
- V96 | PAGE_THEME_DRIFT | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | LEGACY_LAYOUT_DRIFT | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | LEGACY_CARD_DRIFT | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | LEGACY_TABLE_DRIFT | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | LEGACY_FORM_DRIFT | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | PAGE_BRAND_INCONSISTENCY | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | GLOBAL_THEME_IMPORT_MISSING | Full Mission Control Theme Rollout failure class | ENABLED
- V96 | COMMAND_CENTER_BRAND_ROLLOUT_GAP | Full Mission Control Theme Rollout failure class | ENABLED
- V97 | ops/bin/as6-diagnose-unified-page-shell-v97 | Unified Page Shell diagnostic | ENABLED
- V97 | UNIFIED_PAGE_SHELL_MISSING | Unified Page Shell failure class | ENABLED
- V97 | PAGE_HERO_DRIFT | Unified Page Shell failure class | ENABLED
- V97 | KPI_STRIP_DRIFT | Unified Page Shell failure class | ENABLED
- V97 | GLASS_CARD_SHELL_DRIFT | Unified Page Shell failure class | ENABLED
- V97 | EMPTY_STATE_STYLE_DRIFT | Unified Page Shell failure class | ENABLED
- V97 | LOADING_STATE_STYLE_DRIFT | Unified Page Shell failure class | ENABLED
- V97 | ERROR_STATE_STYLE_DRIFT | Unified Page Shell failure class | ENABLED
- V97 | PAGE_SHELL_IMPORT_MISSING | Unified Page Shell failure class | ENABLED
- V98 | ops/bin/as6-diagnose-real-page-shell-migration-v98 | Real Page Shell Migration diagnostic | ENABLED
- V98 | REAL_PAGE_SHELL_MIGRATION_MISSING | Real Page Shell Migration failure class | ENABLED
- V98 | DASHBOARD_PAGE_SHELL_DRIFT | Real Page Shell Migration failure class | ENABLED
- V98 | CRM_PAGE_SHELL_DRIFT | Real Page Shell Migration failure class | ENABLED
- V98 | REVENUE_PAGE_SHELL_DRIFT | Real Page Shell Migration failure class | ENABLED
- V98 | WORKFORCE_PAGE_SHELL_DRIFT | Real Page Shell Migration failure class | ENABLED
- V98 | APPROVAL_PAGE_SHELL_DRIFT | Real Page Shell Migration failure class | ENABLED
- V98 | EXECUTION_PAGE_SHELL_DRIFT | Real Page Shell Migration failure class | ENABLED
- V98 | PAGE_STATE_PRIMITIVE_DRIFT | Real Page Shell Migration failure class | ENABLED
- V99 | ops/bin/as6-diagnose-real-page-component-migration-v99 | Real Page Component Migration diagnostic | ENABLED
- V99 | REAL_PAGE_COMPONENT_MIGRATION_MISSING | Real Page Component Migration failure class | ENABLED
- V99 | CRM_COMPONENT_SHELL_DRIFT | Real Page Component Migration failure class | ENABLED
- V99 | DASHBOARD_COMPONENT_SHELL_DRIFT | Real Page Component Migration failure class | ENABLED
- V99 | REVENUE_COMPONENT_SHELL_DRIFT | Real Page Component Migration failure class | ENABLED
- V99 | WORKERS_COMPONENT_SHELL_DRIFT | Real Page Component Migration failure class | ENABLED
- V99 | COMPONENT_TABLE_DRIFT | Real Page Component Migration failure class | ENABLED
- V99 | COMPONENT_FORM_DRIFT | Real Page Component Migration failure class | ENABLED
- V99 | COMPONENT_STATE_DRIFT | Real Page Component Migration failure class | ENABLED
- V100 | ops/bin/as6-diagnose-direct-page-rewrite-framework-v100 | Direct Page Rewrite Framework diagnostic | ENABLED
- V100 | DIRECT_PAGE_REWRITE_FRAMEWORK_MISSING | Direct Page Rewrite Framework failure class | ENABLED
- V100 | DIRECT_CRM_PAGE_REWRITE_GAP | Direct Page Rewrite Framework failure class | ENABLED
- V100 | DIRECT_DASHBOARD_PAGE_REWRITE_GAP | Direct Page Rewrite Framework failure class | ENABLED
- V100 | DIRECT_REVENUE_PAGE_REWRITE_GAP | Direct Page Rewrite Framework failure class | ENABLED
- V100 | DIRECT_WORKERS_PAGE_REWRITE_GAP | Direct Page Rewrite Framework failure class | ENABLED
- V100 | LEGACY_PAGE_WRAPPER_DRIFT | Direct Page Rewrite Framework failure class | ENABLED
- V100 | DIRECT_PAGE_REWRITE_MARKER_MISSING | Direct Page Rewrite Framework failure class | ENABLED
- V100 | PAGE_SHELL_MIGRATION_COVERAGE_GAP | Direct Page Rewrite Framework failure class | ENABLED
- V101 | ops/bin/as6-diagnose-unified-data-surface-system-v101 | Unified Data Surface System diagnostic | ENABLED
- V101 | UNIFIED_DATA_SURFACE_MISSING | Unified Data Surface System failure class | ENABLED
- V101 | KPI_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | TABLE_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | CRM_CARD_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | KANBAN_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | FILTER_FORM_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | CHART_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | ACTION_BAR_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | MODAL_DRAWER_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V101 | STATE_SURFACE_DRIFT | Unified Data Surface System failure class | ENABLED
- V102 | ops/bin/as6-diagnose-real-data-surface-migration-v102 | Real Data Surface Migration diagnostic | ENABLED
- V102 | REAL_DATA_SURFACE_MIGRATION_MISSING | Real Data Surface Migration failure class | ENABLED
- V102 | DASHBOARD_DATA_SURFACE_DRIFT | Real Data Surface Migration failure class | ENABLED
- V102 | CRM_DATA_SURFACE_DRIFT | Real Data Surface Migration failure class | ENABLED
- V102 | REVENUE_DATA_SURFACE_DRIFT | Real Data Surface Migration failure class | ENABLED
- V102 | WORKFORCE_DATA_SURFACE_DRIFT | Real Data Surface Migration failure class | ENABLED
- V102 | APPROVAL_DATA_SURFACE_DRIFT | Real Data Surface Migration failure class | ENABLED
- V102 | EXECUTION_DATA_SURFACE_DRIFT | Real Data Surface Migration failure class | ENABLED
- V102 | DATA_SURFACE_MIGRATION_GAP | Real Data Surface Migration failure class | ENABLED
- V103 | ops/bin/as6-diagnose-live-operational-data-integration-v103 | Live Operational Data Integration diagnostic | ENABLED
- V103 | LIVE_OPERATIONAL_DATA_PROVIDER_MISSING | Live Operational Data Integration failure class | ENABLED
- V103 | OPERATIONAL_DATA_STALE | Live Operational Data Integration failure class | ENABLED
- V103 | OPERATIONAL_DATA_SOURCE_UNAVAILABLE | Live Operational Data Integration failure class | ENABLED
- V103 | OPERATIONAL_DATA_CONTRACT_DRIFT | Live Operational Data Integration failure class | ENABLED
- V103 | DASHBOARD_LIVE_DATA_GAP | Live Operational Data Integration failure class | ENABLED
- V103 | CRM_LIVE_DATA_GAP | Live Operational Data Integration failure class | ENABLED
- V103 | REVENUE_LIVE_DATA_GAP | Live Operational Data Integration failure class | ENABLED
- V103 | WORKFORCE_LIVE_DATA_GAP | Live Operational Data Integration failure class | ENABLED
- V103 | DIAGNOSTIC_LIVE_DATA_GAP | Live Operational Data Integration failure class | ENABLED
- V103 | GOVERNANCE_LIVE_DATA_GAP | Live Operational Data Integration failure class | ENABLED
- V104 | ops/bin/as6-diagnose-real-backend-data-connectors-v104 | Real Backend Data Connectors diagnostic | ENABLED
- V104 | BACKEND_DATA_CONNECTORS_MISSING | Real Backend Data Connectors failure class | ENABLED
- V104 | BACKEND_CONNECTOR_SOURCE_UNAVAILABLE | Real Backend Data Connectors failure class | ENABLED
- V104 | BACKEND_CONNECTOR_STALE_CACHE | Real Backend Data Connectors failure class | ENABLED
- V104 | BACKEND_DATA_CONTRACT_DRIFT | Real Backend Data Connectors failure class | ENABLED
- V104 | DASHBOARD_BACKEND_CONNECTOR_GAP | Real Backend Data Connectors failure class | ENABLED
- V104 | CRM_BACKEND_CONNECTOR_GAP | Real Backend Data Connectors failure class | ENABLED
- V104 | REVENUE_BACKEND_CONNECTOR_GAP | Real Backend Data Connectors failure class | ENABLED
- V104 | WORKFORCE_BACKEND_CONNECTOR_GAP | Real Backend Data Connectors failure class | ENABLED
- V104 | DIAGNOSTIC_BACKEND_CONNECTOR_GAP | Real Backend Data Connectors failure class | ENABLED
- V104 | GOVERNANCE_BACKEND_CONNECTOR_GAP | Real Backend Data Connectors failure class | ENABLED
- V104 | OPERATIONAL_STORE_MISSING | Real Backend Data Connectors failure class | ENABLED
- V104 | CONNECTOR_FAILOVER_GAP | Real Backend Data Connectors failure class | ENABLED
- V105 | ops/bin/as6-diagnose-real-dashboard-data-wiring-v105 | Real Dashboard Data Wiring diagnostic | ENABLED
- V105 | DASHBOARD_DATA_WIRING_MISSING | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_OPERATIONAL_STORE_GAP | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_STALE_DATA_GAP | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_CACHE_FALLBACK_GAP | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_WIDGET_DATA_DRIFT | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_FRESHNESS_BADGE_MISSING | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_CONNECTOR_HEALTH_GAP | Real Dashboard Data Wiring failure class | ENABLED
- V105 | DASHBOARD_LIVE_SNAPSHOT_CONTRACT_DRIFT | Real Dashboard Data Wiring failure class | ENABLED
- V106 | ops/bin/as6-diagnose-real-crm-data-wiring-v106 | Real CRM Data Wiring diagnostic | ENABLED
- V106 | CRM_DATA_WIRING_MISSING | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_OPERATIONAL_STORE_GAP | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_PIPELINE_DATA_DRIFT | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_SLA_DATA_GAP | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_LEAD_STATUS_DRIFT | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_ACTIVITY_DATA_GAP | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_AI_RECOMMENDATION_DATA_GAP | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_CONNECTOR_HEALTH_GAP | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_FRESHNESS_BADGE_MISSING | Real CRM Data Wiring failure class | ENABLED
- V106 | CRM_LIVE_SNAPSHOT_CONTRACT_DRIFT | Real CRM Data Wiring failure class | ENABLED
- V107 | ops/bin/as6-diagnose-real-revenue-crm-fusion-v107 | Real Revenue CRM Fusion diagnostic | ENABLED
- V107 | REVENUE_CRM_FUSION_MISSING | Real Revenue CRM Fusion failure class | ENABLED
- V107 | CRM_PIPELINE_REVENUE_FEED_GAP | Real Revenue CRM Fusion failure class | ENABLED
- V107 | CRM_DEALS_REVENUE_PROJECTION_GAP | Real Revenue CRM Fusion failure class | ENABLED
- V107 | CRM_CONVERSION_REVENUE_KPI_GAP | Real Revenue CRM Fusion failure class | ENABLED
- V107 | REVENUE_FORECAST_FRESHNESS_GAP | Real Revenue CRM Fusion failure class | ENABLED
- V107 | REVENUE_CRM_CONSISTENCY_DRIFT | Real Revenue CRM Fusion failure class | ENABLED
- V107 | EXECUTIVE_REVENUE_PULSE_GAP | Real Revenue CRM Fusion failure class | ENABLED
- V107 | REVENUE_CRM_FUSION_CACHE_GAP | Real Revenue CRM Fusion failure class | ENABLED
- V107 | REVENUE_CRM_FUSION_CONTRACT_DRIFT | Real Revenue CRM Fusion failure class | ENABLED
- V108 | ops/bin/as6-diagnose-real-page-conversion-engine-v108 | Real Page Conversion Engine diagnostic | ENABLED
- V108 | REAL_PAGE_CONVERSION_ENGINE_MISSING | Real Page Conversion Engine failure class | ENABLED
- V108 | CRM_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | DASHBOARD_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | REVENUE_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | WORKFORCE_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | APPROVAL_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | EXECUTION_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | EXECUTIVE_PAGE_CONVERSION_GAP | Real Page Conversion Engine failure class | ENABLED
- V108 | PAGE_CONVERSION_PRIMITIVE_DRIFT | Real Page Conversion Engine failure class | ENABLED
- V108 | MISSION_CONTROL_LAYOUT_2_DRIFT | Real Page Conversion Engine failure class | ENABLED
- V109 | ops/bin/as6-diagnose-physical-page-refactor-migration-v109 | Physical Page Refactor Migration diagnostic | ENABLED
- V109 | PHYSICAL_PAGE_REFACTOR_MISSING | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_CRM_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_DASHBOARD_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_REVENUE_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_WORKFORCE_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_APPROVAL_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_EXECUTION_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_EXECUTIVE_REFACTOR_GAP | Physical Page Refactor Migration failure class | ENABLED
- V109 | LEGACY_LAYOUT_PHYSICAL_DRIFT | Physical Page Refactor Migration failure class | ENABLED
- V109 | PHYSICAL_REFACTOR_PRIMITIVE_GAP | Physical Page Refactor Migration failure class | ENABLED
- V110 | ops/bin/as6-diagnose-real-component-consolidation-v110 | Real Component Consolidation diagnostic | ENABLED
- V110 | COMPONENT_CONSOLIDATION_MISSING | Real Component Consolidation failure class | ENABLED
- V110 | COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V110 | PAGE_SPECIFIC_WIDGET_SPRAWL | Real Component Consolidation failure class | ENABLED
- V110 | UNIFIED_COMPONENT_COVERAGE_GAP | Real Component Consolidation failure class | ENABLED
- V110 | KPI_COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V110 | TABLE_COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V110 | CARD_COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V110 | FILTER_COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V110 | ACTION_BAR_COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V110 | STATE_COMPONENT_DUPLICATION_DRIFT | Real Component Consolidation failure class | ENABLED
- V111 | ops/bin/as6-diagnose-design-token-registry-governance-v111 | Design Token Registry Governance diagnostic | ENABLED
- V111 | DESIGN_TOKEN_REGISTRY_MISSING | Design Token Registry failure class | ENABLED
- V111 | DESIGN_TOKEN_IMPORT_MISSING | Design Token Registry failure class | ENABLED
- V111 | SPACING_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | RADIUS_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | SHADOW_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | TYPOGRAPHY_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | KPI_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | TABLE_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | STATUS_BADGE_TOKEN_DRIFT | Design Token Registry failure class | ENABLED
- V111 | THEME_GOVERNANCE_GAP | Design Token Registry failure class | ENABLED
- V112 | ops/bin/as6-diagnose-real-primitive-enforcement-engine-v112 | Real Primitive Enforcement Engine diagnostic | ENABLED
- V112 | REAL_PRIMITIVE_ENFORCEMENT_MISSING | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_KPI_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_CARD_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_TABLE_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_FILTER_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_ACTION_BAR_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_EMPTY_STATE_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_LOADING_STATE_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | LOCAL_ERROR_STATE_IMPLEMENTATION_DRIFT | Real Primitive Enforcement Engine failure class | ENABLED
- V112 | UNIFIED_PRIMITIVE_USAGE_GAP | Real Primitive Enforcement Engine failure class | ENABLED
- V112B | BUILD_RUNNER_FALLBACK_GAP | Frontend control build runner fallback gap | ENABLED
- V112B | PRIMITIVE_ENFORCEMENT_CONTROL_RUNNER_DRIFT | Primitive enforcement control runner drift | ENABLED
- V113 | ops/bin/as6-diagnose-autonomous-ui-governance-engine-v113 | Autonomous UI Governance Engine | ENABLED
- V113 | UI_GOVERNANCE_ENGINE_MISSING | UI governance failure class | ENABLED
- V113 | PAGE_REGISTRY_DRIFT | UI governance failure class | ENABLED
- V113 | COMPONENT_REGISTRY_DRIFT | UI governance failure class | ENABLED
- V113 | KPI_REGISTRY_DRIFT | UI governance failure class | ENABLED
- V113 | TABLE_REGISTRY_DRIFT | UI governance failure class | ENABLED
- V113 | FORM_REGISTRY_DRIFT | UI governance failure class | ENABLED
- V113 | STATE_REGISTRY_DRIFT | UI governance failure class | ENABLED
- V113 | UI_INVENTORY_MISSING | UI governance failure class | ENABLED
- V113 | UI_AUTONOMY_GAP | UI governance failure class | ENABLED
- V113B | UI_GOVERNANCE_BUILD_RUNNER_FALLBACK_GAP | UI governance build runner fallback gap | ENABLED
- V113B | UI_GOVERNANCE_CONTROL_RUNNER_DRIFT | UI governance control runner drift | ENABLED
- V114 | ops/bin/as6-diagnose-real-mission-control-shell-rollout-v114 | Real Mission Control Shell Rollout diagnostic | ENABLED
- V114 | REAL_MISSION_CONTROL_SHELL_MISSING | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | LEGACY_AI_OS_SHELL_DRIFT | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | COMMAND_CENTER_NAV_MISSING | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | GLOBAL_AS6_SIDEBAR_MISSING | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | GLOBAL_AS6_HEADER_MISSING | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | SHELL_CONTENT_OFFSET_GAP | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | VISUAL_MIGRATION_FALSE_POSITIVE | Real Mission Control Shell Rollout failure class | ENABLED
- V114 | NON_COMMAND_CENTER_PAGE_SHELL_GAP | Real Mission Control Shell Rollout failure class | ENABLED
- V115 | ops/bin/as6-diagnose-command-center-classic-restore-v115 | Command Center Classic Restore diagnostic | ENABLED
- V115 | COMMAND_CENTER_CLASSIC_RESTORE_MISSING | Command Center classic restore failure class | ENABLED
- V115 | COMMAND_CENTER_TOP_OVERLAY_DRIFT | Command Center classic restore failure class | ENABLED
- V115 | COMMAND_CENTER_AUTONOMOUS_COCKPIT_DRIFT | Command Center classic restore failure class | ENABLED
- V115 | COMMAND_CENTER_CLASSIC_LAYOUT_PADDING_DRIFT | Command Center classic restore failure class | ENABLED
- V115 | COMMAND_CENTER_REFERENCE_STYLE_GAP | Command Center classic restore failure class | ENABLED
- V115C | ops/bin/as6-diagnose-command-center-overlay-root-cleanup-v115c | Command Center overlay root cleanup diagnostic | ENABLED
- V115C | COMMAND_CENTER_OVERLAY_ROOT_DRIFT | Command Center overlay root cleanup failure class | ENABLED
- V115C | COMMAND_CENTER_STATUS_WIDGET_OVERLAY_DRIFT | Command Center overlay root cleanup failure class | ENABLED
- V115C | COMMAND_CENTER_FLOATING_TAB_OVERLAY_DRIFT | Command Center overlay root cleanup failure class | ENABLED
- V115C | COMMAND_CENTER_COCKPIT_OVERLAY_DRIFT | Command Center overlay root cleanup failure class | ENABLED
- V115C | COMMAND_CENTER_COPILOT_BUTTON_OVERLAY_DRIFT | Command Center overlay root cleanup failure class | ENABLED
- V115D | ops/bin/as6-diagnose-command-center-final-polish-v115d | Command Center final polish diagnostic | ENABLED
- V115D | COMMAND_CENTER_TOP_EMPTY_SPACE_DRIFT | Command Center final polish failure class | ENABLED
- V115D | COMMAND_CENTER_ROOT_SIBLING_OVERLAY_DRIFT | Command Center final polish failure class | ENABLED
- V115D | COMMAND_CENTER_BOTTOM_LINE_DRIFT | Command Center final polish failure class | ENABLED
- V115D | COMMAND_CENTER_RIGHT_WIDGET_OVERLAP_DRIFT | Command Center final polish failure class | ENABLED
- V115E | ops/bin/as6-diagnose-command-center-reference-lock-v115e | Command Center reference lock diagnostic | ENABLED
- V115E | COMMAND_CENTER_REFERENCE_LOCK_MISSING | Command Center reference lock failure class | ENABLED
- V115E | COMMAND_CENTER_REFERENCE_SPACING_DRIFT | Command Center reference lock failure class | ENABLED
- V115E | COMMAND_CENTER_REFERENCE_GRID_DRIFT | Command Center reference lock failure class | ENABLED
- V115E | COMMAND_CENTER_REFERENCE_SIDEBAR_DRIFT | Command Center reference lock failure class | ENABLED
- V115E | COMMAND_CENTER_REFERENCE_RECOMMENDATION_OVERFLOW_DRIFT | Command Center reference lock failure class | ENABLED
- V116B | ops/bin/as6-diagnose-command-center-real-reference-fix-v116b | Clean and real Command Center fix diagnostic | ENABLED
- V116B | DIRTY_WORKTREE_BLOCKED_UI_FIX | Command Center cleanup/source fix failure class | ENABLED
- V116B | STALE_V115_ARTIFACT_DRIFT | Command Center cleanup/source fix failure class | ENABLED
- V116B | COMMAND_CENTER_REAL_REFERENCE_DRIFT | Command Center cleanup/source fix failure class | ENABLED
- V116B | COMMAND_CENTER_LOGO_FRAME_SOURCE_DRIFT | Command Center cleanup/source fix failure class | ENABLED
- V116B | COMMAND_CENTER_ACTION_BAR_SOURCE_DRIFT | Command Center cleanup/source fix failure class | ENABLED
- V116B | COMMAND_CENTER_CARD_BORDER_SOURCE_DRIFT | Command Center cleanup/source fix failure class | ENABLED
- V117 | ops/bin/as6-diagnose-command-center-final-reference-css-v117 | Final Command Center reference CSS diagnostic | ENABLED
- V117 | COMMAND_CENTER_FINAL_CSS_ORDER_DRIFT | Final Command Center reference CSS failure class | ENABLED
- V117 | COMMAND_CENTER_REFERENCE_CSS_NOT_LAST | Final Command Center reference CSS failure class | ENABLED
- V117 | COMMAND_CENTER_VISUAL_LAYER_OVERRIDE | Final Command Center reference CSS failure class | ENABLED
- V117 | COMMAND_CENTER_REFERENCE_STILL_NOT_MATCHED | Final Command Center reference CSS failure class | ENABLED
- V118 | ops/bin/as6-diagnose-command-center-reference-restore-v118 | Command Center reference restore diagnostic | ENABLED
- V118 | COMMAND_CENTER_PATCH_LAYER_FAILURE | Command Center reference restore failure class | ENABLED
- V118 | COMMAND_CENTER_REFERENCE_SOURCE_DRIFT | Command Center reference restore failure class | ENABLED
- V118 | COMMAND_CENTER_CSS_OVERLAY_NOT_EFFECTIVE | Command Center reference restore failure class | ENABLED
- V118 | COMMAND_CENTER_RESTORE_FROM_REFERENCE_REQUIRED | Command Center reference restore failure class | ENABLED
- V118 | COMMAND_CENTER_TEMPORARY_PATCH_ARTIFACT_DRIFT | Command Center reference restore failure class | ENABLED
- V118B | ops/bin/as6-diagnose-command-center-reference-restore-v118b | Command Center reference restore diagnostic | ENABLED
- V118B | COMMAND_CENTER_REFERENCE_RESTORE_STAGE_FAILURE | Command Center reference restore failure class | ENABLED
- V118B | COMMAND_CENTER_MISSING_PATHSPEC_STAGING_FAILURE | Command Center reference restore failure class | ENABLED
- V118B | COMMAND_CENTER_PATCH_LAYER_CLEANUP_REQUIRED | Command Center reference restore failure class | ENABLED
- V118B | COMMAND_CENTER_REFERENCE_SOURCE_RESTORE_REQUIRED | Command Center reference restore failure class | ENABLED
- V119 | ops/bin/as6-diagnose-command-center-reference-page-v119 | Command Center reference page diagnostic | ENABLED
- V119 | COMMAND_CENTER_REFERENCE_COMMIT_MISMATCH | Command Center reference page failure class | ENABLED
- V119 | COMMAND_CENTER_GLOBAL_OVERLAY_REAPPEARED | Command Center reference page failure class | ENABLED
- V119 | COMMAND_CENTER_PAGE_REWRITE_REQUIRED | Command Center reference page failure class | ENABLED
- V119 | COMMAND_CENTER_OLD_BADGE_DRIFT | Command Center reference page failure class | ENABLED
- V119 | COMMAND_CENTER_REFERENCE_PAGE_NOT_ACTIVE | Command Center reference page failure class | ENABLED
- V120 | ops/bin/as6-diagnose-command-center-appshell-reference-v120 | Command Center AppShell reference diagnostic | ENABLED
- V120 | COMMAND_CENTER_DUPLICATE_SIDEBAR_DRIFT | Command Center AppShell reference failure class | ENABLED
- V120 | COMMAND_CENTER_APPSHELL_CONTRACT_VIOLATION | Command Center AppShell reference failure class | ENABLED
- V120 | COMMAND_CENTER_FULL_PAGE_SHELL_MISUSE | Command Center AppShell reference failure class | ENABLED
- V120 | COMMAND_CENTER_REFERENCE_WORKSPACE_NOT_ACTIVE | Command Center AppShell reference failure class | ENABLED
- V120 | COMMAND_CENTER_INTERNAL_NAVIGATION_DUPLICATION | Command Center AppShell reference failure class | ENABLED
- V121 | ops/bin/as6-diagnose-command-center-true-reference-lock-v121 | Command Center true reference lock diagnostic | ENABLED
- V121 | COMMAND_CENTER_BODY_ROOT_OVERLAY_DRIFT | Command Center true reference lock failure class | ENABLED
- V121 | COMMAND_CENTER_GLOBAL_HEALTH_BAR_REAPPEARED | Command Center true reference lock failure class | ENABLED
- V121 | COMMAND_CENTER_AUTONOMOUS_COCKPIT_REAPPEARED | Command Center true reference lock failure class | ENABLED
- V121 | COMMAND_CENTER_FLOATING_WIDGET_REAPPEARED | Command Center true reference lock failure class | ENABLED
- V121 | COMMAND_CENTER_REFERENCE_LOCK_NOT_ACTIVE | Command Center true reference lock failure class | ENABLED
- V122B | ops/bin/as6-diagnose-command-center-reference-guard-v122b | Real Command Center route guard diagnostic | ENABLED
- V122B | COMMAND_CENTER_SED_INJECTION_FAILURE | Command Center route guard failure class | ENABLED
- V122B | COMMAND_CENTER_EXTERNAL_ROOT_OVERLAY_DRIFT | Command Center route guard failure class | ENABLED
- V122B | COMMAND_CENTER_TOP_OFFSET_DRIFT | Command Center route guard failure class | ENABLED
- V122B | COMMAND_CENTER_MISSION_COCKPIT_REAPPEARED | Command Center route guard failure class | ENABLED
- V122B | COMMAND_CENTER_REFERENCE_GUARD_MISSING | Command Center route guard failure class | ENABLED
- V123C | ops/bin/as6-diagnose-command-center-reference-polish-v123c | Command Center reference polish hardened diagnostic | ENABLED
- V123C | COMMAND_CENTER_MISSING_PATHSPEC_FAILURE | Command Center reference polish hardened failure class | ENABLED
- V123C | COMMAND_CENTER_LEGACY_BADGE_DRIFT | Command Center reference polish hardened failure class | ENABLED
- V123C | COMMAND_CENTER_LOGO_FRAME_DRIFT | Command Center reference polish hardened failure class | ENABLED
- V123C | COMMAND_CENTER_ACTION_STRIP_DRIFT | Command Center reference polish hardened failure class | ENABLED
- V123C | COMMAND_CENTER_COPILOT_BORDER_DRIFT | Command Center reference polish hardened failure class | ENABLED
- V123C | COMMAND_CENTER_BOTTOM_NOISE_DRIFT | Command Center reference polish hardened failure class | ENABLED
- V126 | ops/bin/as6-diagnose-command-center-arrow-fix-v126 | Command Center arrow fix diagnostic | ENABLED
- V126 | COMMAND_CENTER_HERO_BORDER_DRIFT | Command Center arrow fix failure class | ENABLED
- V126 | COMMAND_CENTER_SIDEBAR_SEPARATOR_DRIFT | Command Center arrow fix failure class | ENABLED
- V126 | COMMAND_CENTER_COPILOT_DOUBLE_BORDER_DRIFT | Command Center arrow fix failure class | ENABLED
- V126 | COMMAND_CENTER_FAILED_ENFORCEMENT_CALL_DRIFT | Command Center arrow fix failure class | ENABLED
- V127 | ops/bin/as6-diagnose-command-center-final-runtime-style-v127 | Command Center final runtime style diagnostic | ENABLED
- V128 | ops/bin/as6-diagnose-command-center-hard-runtime-fix-v128 | Command Center hard runtime fix diagnostic | ENABLED
- V129 | ops/bin/as6-diagnose-emergency-restore-site-after-v128 | Emergency restore after V128 diagnostic | ENABLED

## 20260622T002129Z command-center-etalon-integrity
- Diagnostic: ops/bin/as6-diagnose-command-center-etalon-integrity
- Failure class: COMMAND_CENTER_VISUAL_DRIFT_FROM_RUNTIME_STYLE_PATCHES
- Status: ENABLED

## 20260622T003142Z command-center-real-production-etalon
- Diagnostic: ops/bin/as6-diagnose-command-center-real-production-etalon
- Failure class: NPM_MISSING_FRONTEND_BUILD_NOT_EXECUTED
- Failure class: FRONTEND_BUNDLE_DEPLOYMENT_GAP
- Status: ENABLED

## 20260622T003632Z command-center-real-visual-etalon-v134
- Diagnostic: ops/bin/as6-diagnose-command-center-real-visual-etalon-v134
- Failure class: ETALON_SOURCE_RESTORE_NOT_PIXEL_EQUAL_TO_TARGET_SCREENSHOT
- Status: ENABLED

## 20260622T004134Z command-center-copilot-etalon-v135
- Diagnostic: ops/bin/as6-diagnose-command-center-copilot-etalon-v135
- Failure class: COPILOT_CARD_EXTRA_FRAME_AND_TOP_LINE
- Status: ENABLED

## 20260622T004822Z command-center-bottom-neon-line-v136
- Diagnostic: ops/bin/as6-diagnose-command-center-bottom-neon-line-v136
- Failure class: BOTTOM_NEON_LINE_FROM_OVERFLOW_OR_DECORATIVE_BORDER_LAYER
- Status: ENABLED

## 20260622T005124Z command-center-real-horizontal-strip-v137
- Diagnostic: ops/bin/as6-diagnose-command-center-real-horizontal-strip-v137
- Failure class: REAL_HORIZONTAL_SCROLLBAR_OR_OVERFLOW_LAYER
- Status: ENABLED

## 20260622T005440Z command-center-fixed-neon-strip-v138
- Diagnostic: ops/bin/as6-diagnose-command-center-fixed-neon-strip-v138
- Failure class: FIXED_DECORATIVE_NEON_STRIP_LAYER
- Status: ENABLED

## 20260622T010245Z command-center-overlay-roots-dom-v140
- Diagnostic: ops/bin/as6-diagnose-command-center-overlay-roots-dom-v140
- Failure class: V139_PATCH_PATTERN_DID_NOT_MATCH_CURRENT_GUARD_FILE
- Failure class: HIDDEN_AS6_OVERLAY_ROOTS_REMAIN_IN_DOM
- Status: ENABLED

## 20260622T010732Z command-center-overlay-sources-v141
- Diagnostic: ops/bin/as6-diagnose-command-center-overlay-sources-v141
- Failure class: OVERLAY_COMPONENTS_CREATE_VISIBLE_LAYERS_AFTER_GUARD_RUNS
- Status: ENABLED

## 20260622T011405Z command-center-status-overlays-v143
- Diagnostic: ops/bin/as6-diagnose-command-center-status-overlays-v143
- Failure class: V142_OVERMATCHED_CSS_AND_GUARD_FILES
- Failure class: REMAINING_OPERATIONAL_STATUS_OVERLAY_ROOTS_STILL_MOUNTED
- Status: ENABLED

## 20260622T011700Z command-center-no-overlay-imports-v144
- Diagnostic: ops/bin/as6-diagnose-command-center-no-overlay-imports-v144
- Failure class: APP_SIDE_EFFECT_IMPORTS_STILL_LOAD_OVERLAY_MODULES
- Status: ENABLED

## 20260622T012800Z command-center-clean-etalon-v146b
- Diagnostic: ops/bin/as6-diagnose-command-center-clean-etalon-v146b
- Failure class: V146_DIAGNOSTIC_FALSE_POSITIVE_ON_VALID_WORKSPACE_AFTER_RESET
- Status: ENABLED

## 20260622T013806Z command-center-final-strip-cleanup-v147
- Diagnostic: ops/bin/as6-diagnose-command-center-final-strip-cleanup-v147
- Failure class: REAL_COMMAND_CENTER_BLOCK_STYLES_STILL_DRAW_VISIBLE_LINES
- Status: ENABLED

## 20260622T014627Z command-center-direct-etalon-v148
- Diagnostic: ops/bin/as6-diagnose-command-center-direct-etalon-v148
- Failure class: BODY_GUARD_CLASS_NOT_PRESENT_SO_PREVIOUS_CSS_DID_NOT_APPLY
- Status: ENABLED

## 20260622T022700Z command-center-copilot-etalon-v150
- Diagnostic: ops/bin/as6-diagnose-command-center-copilot-etalon-v150
- Failure class: COPILOT_PURPLE_BACKGROUND_NOT_ETALON

## 20260622T023653Z command-center-bottom-strip-final-v151
- Diagnostic: ops/bin/as6-diagnose-command-center-bottom-strip-final-v151
- Failure class: BOTTOM_STRIP_MASK_OVERRIDDEN_OR_NOT_COMMITTED

## 20260622T024736Z command-center-horizontal-scrollbar-v154
- Diagnostic: ops/bin/as6-diagnose-command-center-horizontal-scrollbar-v154
- Failure class: VISIBLE_STRIP_IS_HORIZONTAL_SCROLLBAR_OR_OVERFLOW_LAYER

## 20260622T025353Z command-center-real-overlay-strip-v155
- Diagnostic: ops/bin/as6-diagnose-command-center-real-overlay-strip-v155
- Failure class: STRIP_IS_REAL_OVERLAY_LAYER_NOT_SCROLLBAR_AND_NOT_CARD_BORDER

## 20260622T025900Z command-center-parent-overlay-strip-v156
- Diagnostic: ops/bin/as6-diagnose-command-center-parent-overlay-strip-v156
- Failure class: PARENT_CONTAINER_PSEUDO_ELEMENT_DRAWS_OVERLAY_STRIP

## 20260622T030447Z command-center-real-strip-clean-v157
- Diagnostic: ops/bin/as6-diagnose-command-center-real-strip-clean-v157
- Failure class: FAILED_STRIP_FIXES_ADDED_FIXED_MASKS_AND_OVERLAY_GUARDS

## 20260622T031110Z command-center-strip-source-v158
- Diagnostic: ops/bin/as6-diagnose-command-center-strip-source-v158
- Failure class: STRIP_SOURCE_UNKNOWN_REQUIRES_BROWSER_COMPUTED_STYLE_DIAGNOSTIC

## 20260622T031753Z command-center-pipeline-card-v159
- Diagnostic: ops/bin/as6-diagnose-command-center-pipeline-card-v159
- Failure class: PIPELINE_CARD_BORDER_AND_INSET_SHADOW_DRAW_VISIBLE_STRIP

## 20260622T032621Z command-center-pixel-strip-picker-v160
- Diagnostic: ops/bin/as6-diagnose-command-center-pixel-strip-picker-v160
- Failure class: STRIP_SOURCE_REQUIRES_PIXEL_LEVEL_DOM_PICKER

## 20260622T035624Z command-center-html-strip-v161
- Diagnostic: ops/bin/as6-diagnose-command-center-html-strip-v161
- Failure class: VISIBLE_STRIP_IS_HTML_LEVEL_BACKGROUND_OR_DOCUMENT_LAYER

## 20260622T040410Z command-second-grid-strip-v162
- Diagnostic: ops/bin/as6-diagnose-command-second-grid-strip-v162
- Failure class: COMMAND_SECOND_GRID_DRAWS_HORIZONTAL_STRIP_OVER_CONTENT

## 20260622T041954Z command-second-grid-strip-v163
- Diagnostic: ops/bin/as6-diagnose-command-second-grid-strip-v163
- Failure class: V162_LEFT_BORDER_TOP_ON_COMMAND_SECOND_GRID_CHILDREN

## 20260622T042635Z command-center-clip-second-row-v164
- Diagnostic: ops/bin/as6-diagnose-command-center-clip-second-row-v164
- Failure class: SECOND_ROW_INNER_CHART_OR_PROGRESS_OVERFLOW_ESCAPES_CARD_BOUNDS

## 20260622T043702Z command-center-strip-crossing-v165
- Diagnostic: ops/bin/as6-diagnose-command-center-strip-crossing-v165
- Failure class: STRIP_REQUIRES_ALL_CROSSING_ELEMENTS_DIAGNOSTIC

## 20260622T045350Z command-second-row-head-strip-v166
- Diagnostic: ops/bin/as6-diagnose-command-second-row-head-strip-v166
- Failure class: SECOND_ROW_COMMAND_CARD_HEAD_TRANSPARENT_LAYER_EXPOSES_BACKGROUND_STRIP

## 20260622T050147Z second-row-header-final-v167
- Diagnostic: ops/bin/as6-diagnose-second-row-header-final-v167
- Failure class: SECOND_ROW_HEADER_CONTROLS_OR_CHART_LAYER_STILL_DRAW_STRIP

## 20260622T051205Z real-edge-line-v168
- Diagnostic: ops/bin/as6-diagnose-real-edge-line-v168
- Failure class: REAL_EDGE_LINE_AT_COMMAND_SECOND_GRID_TOP_AND_SIDEBAR_HELP_BOTTOM

## 20260622T051443Z command-center-clean-final-v169
- Diagnostic: ops/bin/as6-diagnose-command-center-clean-final-v169
- Failure class: ACCUMULATED_STRIP_PATCHES_V151_V168_CREATED_CONFLICTING_VISUAL_LAYERS

## 20260622T052516Z remove-v149-fixed-mask-v170b
- Diagnostic: ops/bin/as6-diagnose-remove-v149-fixed-mask-v170b
- Failure class: V149_FIXED_BODY_AFTER_MASK_STILL_DRAWING_VISIBLE_STRIP

## 20260622T053239Z source-edge-line-v171
- Diagnostic: ops/bin/as6-diagnose-source-edge-line-v171
- Failure class: V169_AND_BASE_THEME_STILL_DRAW_REAL_CARD_HELP_BORDERS

## 20260622T053950Z real-progress-strip-v172
- Diagnostic: ops/bin/as6-diagnose-real-progress-strip-v172
- Failure class: REAL_PROGRESS_AND_CHART_LINES_LOOK_LIKE_PAGE_STRIP

## 20260622T061254Z sticky-quick-actions-strip-v173
- Diagnostic: ops/bin/as6-diagnose-sticky-quick-actions-strip-v173
- Failure class: QUICK_ACTIONS_STICKY_BOTTOM_BAR_DRAWING_HORIZONTAL_STRIP

## 20260622T064326Z command-center-no-strips-v174b
- Diagnostic: ops/bin/as6-diagnose-command-center-no-strips-v174b
- Failure class: MULTIPLE_ACCUMULATED_COMMAND_CENTER_STRIP_FIXES_AND_REAL_THEME_LINES

## 20260622T071747Z revenue-chart-line-v175b
- Diagnostic: ops/bin/as6-diagnose-revenue-chart-line-v175b
- Failure class: MOCK_CHART_SVG_OVERFLOW_VISIBLE_DRAWS_LONG_PURPLE_LINE

## 20260622T073257Z horizontal-scrollbar-layer-v176
- Diagnostic: ops/bin/as6-diagnose-horizontal-scrollbar-layer-v176
- Failure class: REAL_HORIZONTAL_SCROLLBAR_LAYER_VISIBLE_ACROSS_COMMAND_CENTER

## 20260622T084241Z css-wildcard-pseudoelement-collision
- Diagnostic: ops/bin/as6-diagnose-css-wildcard-pseudoelement-collision
- Failure class: GLOBAL_WILDCARD_CSS_PSEUDOELEMENT_COLLISION
- GitHub issue: #328
- Check: no [class*=stat|metric]::before/::after in shared CSS.

## 20260622T091756Z revenue-dynamics-etalon-v177c
- Diagnostic: ops/bin/as6-diagnose-revenue-dynamics-etalon-v177c
- Failure class: REVENUE_DYNAMICS_CHART_VISUAL_ETALON_DRIFT

## 20260622T093056Z command-center-early-no-strip-guard-v178b
- Diagnostic: ops/bin/as6-diagnose-command-center-early-no-strip-guard-v178b
- Failure class: COMMAND_CENTER_STRIP_FLASH_BEFORE_FINAL_CSS_LOADS
- Check: early index.html guard exists.

## 20260622T100111Z command-center-no-stat-metric-pseudo-v179
- Diagnostic: ops/bin/as6-diagnose-command-center-no-stat-metric-pseudo-v179
- Failure class: STAT_METRIC_PSEUDO_RULE_STILL_PRESENT_IN_COMPILED_CSS_OR_IMPORTED_SHARED_CSS
- Check: source shared CSS has no unscoped wildcard pseudo-elements.
- Check: compiled CSS has no unscoped wildcard pseudo-elements.

## 20260622T101335Z command-center-cache-flash-v180b
- Diagnostic: ops/bin/as6-diagnose-command-center-cache-flash-v180b
- Failure class: CACHE_OR_FIRST_PAINT_FLASH_STILL_UNCONFIRMED
- Check: production cache headers.
- Check: production asset references.
- Check: source flash candidates.

## 20260622T102016Z stat-card-after-flash-v181
- Diagnostic: ops/bin/as6-diagnose-stat-card-after-flash-v181
- Failure class: GLOBAL_STAT_CARD_AFTER_GLOW_FLASHES_BEFORE_COMMAND_CENTER_FINAL_CSS
- Check: no .stat-card::after/.violet::after/.pink::after glow in global styles.css.

## 20260622T102917Z command-center-route-flash-v182
- Diagnostic: ops/bin/as6-diagnose-command-center-route-flash-v182
- Failure class: COMMAND_CENTER_ROUTE_LOADING_FALLBACK_FLASH_BEFORE_PAGE_CSS_SETTLES
- Check: /command-center Suspense fallback is disabled.

## 20260622T104209Z command-center-first-paint-tracer-v183
- Diagnostic: ops/bin/as6-diagnose-command-center-first-paint-tracer-v183
- Failure class: FIRST_PAINT_FLASH_SOURCE_UNKNOWN_AFTER_CSS_AND_ROUTE_FIXES
- Check: DOM/CSS samples at immediate, raf1, 300ms, 800ms, 1500ms, 2500ms, 4000ms.

## 20260622T110801Z reference-guard-flash-v184
- Diagnostic: ops/bin/as6-diagnose-reference-guard-flash-v184
- Failure class: REFERENCE_GUARD_IMPORTED_BEFORE_REACT_AND_CAUSED_FIRST_PAINT_LAYOUT_FLASH
- Check: reference guard import removed from main.jsx.
- Check: temporary V183 tracer import removed.

## 20260622T112233Z first-paint-neutralize-backgrounds-v185
- Diagnostic: ops/bin/as6-diagnose-first-paint-neutralize-backgrounds-v185
- Failure class: UNKNOWN_FIRST_PAINT_VISUAL_FLASH_AFTER_GUARD_REMOVAL
- Check: early first-paint neutralizer exists.

## 20260622T114157Z real-edge-server-v187
- Diagnostic: ops/bin/as6-diagnose-real-edge-server-v187
- Failure class: HTTPS_RESPONSE_NOT_SERVED_BY_PATCHED_CONTAINER_NGINX
- Check: host ports.
- Check: docker port mappings.
- Check: external vs container-local headers.
- Check: nginx configs across containers.

## 20260622T115432Z body-has-flash-layers-v188
- Diagnostic: ops/bin/as6-diagnose-body-has-flash-layers-v188
- Failure class: BODY_HAS_COMMAND_CENTER_CSS_LAYERS_RECALCULATE_LAYOUT_AFTER_FIRST_PAINT
- Check: v174b/v176 body:has CSS imports removed from main.jsx.
- Check: obsolete reference guard runtime file removed.

## 20260622T121514Z command-center-route-stable-paint-v189
- Diagnostic: ops/bin/as6-diagnose-command-center-route-stable-paint-v189
- Failure class: COMMAND_CENTER_FIRST_PAINT_STABILIZATION_DEPENDED_ON_CHILD_PAGE_CLASS
- Check: AppShell has data-route=command-center on first render.
- Check: stable paint CSS uses route-level selector.
- Check: no body:has in V189 CSS.

## 20260622T122326Z command-center-bootlock-v190
- Diagnostic: ops/bin/as6-diagnose-command-center-bootlock-v190
- Failure class: COMMAND_CENTER_FIRST_PAINT_FLASH_BEFORE_REACT_LAYOUT_STABLE
- Check: early HTML bootlock exists.
- Check: AppShell unlocks after stable double requestAnimationFrame.

## 20260622T123520Z command-center-strong-bootlock-v191
- Diagnostic: ops/bin/as6-diagnose-command-center-strong-bootlock-v191
- Failure class: COMMAND_CENTER_FLASH_NOT_INSIDE_ROOT_OR_ROOT_BOOTLOCK_TOO_WEAK
- Check: strong HTML bootlock exists.
- Check: body children hidden during bootlock.
- Check: production HTML contains V191 bootlock.

## 20260622T124631Z command-center-deep-flash-v192
- Diagnostic: ops/bin/as6-diagnose-command-center-deep-flash-v192
- Failure class: FIRST_PAINT_FLASH_SOURCE_UNCONFIRMED_AFTER_FULL_DOM_BOOTLOCK
- Check: clean static isolation page exists.
- Check: production command-center contains V191 strong bootlock.
- Check: source suspicious selectors collected.

## 20260622T125839Z command-center-unlock-after-mount-v193
- Diagnostic: ops/bin/as6-diagnose-command-center-unlock-after-mount-v193
- Failure class: BOOTLOCK_UNLOCKED_IN_APPSHELL_BEFORE_COMMAND_CENTER_PAGE_MOUNTED
- Check: CommandCenterPage controls bootlock unlock.
- Check: AppShell no longer unlocks after 450ms.

## 20260622T130549Z purge-first-paint-layers-v194
- Diagnostic: ops/bin/as6-diagnose-purge-first-paint-layers-v194
- Failure class: ACCUMULATED_INDEX_FIRST_PAINT_DIAGNOSTIC_LAYERS_CAUSE_COMMAND_CENTER_FLASH
- Check: no temporary first-paint style/script blocks in index.html.
- Check: no body:has(.command-center-page) in index.html.

## 20260622T134005Z command-center-flash-source-finder-v195
- Diagnostic: ops/bin/as6-diagnose-command-center-flash-source-finder-v195
- Failure class: COMMAND_CENTER_FLASH_SOURCE_STILL_UNKNOWN_AFTER_ISOLATION_PAGE_CONFIRMED_APP_RUNTIME
- Check: static scan for fixed/top/global overlays.
- Check: runtime top-stack scan.
- Check: runtime stylesheet rule scan.

## 20260622T135931Z command-center-eager-route-v196
- Diagnostic: ops/bin/as6-diagnose-command-center-eager-route-v196
- Failure class: COMMAND_CENTER_LAZY_CHUNK_DELAY_CAUSED_VISIBLE_RUNTIME_FLASH
- Check: CommandCenterPage imported eagerly in App.jsx.
- Check: V195 runtime tracer removed.

## 20260622T142530Z html-route-stable-appshell-v197b
- Diagnostic: ops/bin/as6-diagnose-html-route-stable-appshell-v197b
- Failure class: REAL_APPSHELL_RENDERED_WITHOUT_COMMAND_ROUTE_CLASS
- Check: early html route class script.
- Check: stable AppShell CSS without body:has.
- Check: V195 tracer removed.

## 20260622T144605Z critical-first-paint-background-v198
- Diagnostic: ops/bin/as6-diagnose-critical-first-paint-background-v198
- Failure class: FIRST_FRAME_BACKGROUND_COLOR_DIFFERS_FROM_COMMAND_CENTER_APPSHELL
- Check: early index.html critical background.
- Check: source CSS background alignment.
- Check: V195/V197B runtime tracers removed.

## 20260622T151823Z command-center-stable-runtime-render-v199
- Diagnostic: ops/bin/as6-diagnose-command-center-stable-runtime-render-v199
- Failure class: COMMAND_CENTER_FALLBACK_TO_LIVE_DATA_FULL_RERENDER
- Check: no automatic Promise.allSettled hydration in CommandCenterPage.
- Check: apiLoading starts stable false.
- Check: V197B runtime route files removed.

## 20260622T154747Z command-center-sidebar-etalon-v200
- Diagnostic: ops/bin/as6-diagnose-command-center-sidebar-etalon-v200
- Failure class: COMMAND_CENTER_SIDEBAR_VISUAL_DRIFT_FROM_ETALON
- Check: sidebar etalon CSS imported.
- Check: sidebar width locked to 286px.
- Check: active Command Center gradient matches etalon.
- Check: no body:has in V200 CSS.

## 20260622T210438Z command-center-sidebar-final-etalon-v201
- Diagnostic: ops/bin/as6-diagnose-command-center-sidebar-final-etalon-v201
- Failure class: COMMAND_CENTER_SIDEBAR_SPACING_RADIUS_SCROLL_DRIFT_FROM_FINAL_ETALON
- Check: sidebar width locked to 300px.
- Check: sidebar scroll removed.
- Check: rounded corner radius applied.
- Check: no body:has in V201 CSS.

## 20260622T222438Z command-center-sidebar-source-v202
- Diagnostic: ops/bin/as6-diagnose-command-center-sidebar-source-v202
- Runtime tracer: ops/runtime-tracers/as6-command-center-sidebar-runtime-tracer-v202.js
- Failure classes:
  - COMMAND_CENTER_THEME_OVERRIDE_DRIFT
  - COMMAND_CENTER_MULTIPLE_STYLE_AUTHORITIES
  - SIDEBAR_SELECTOR_DRIFT
  - SIDEBAR_COMPUTED_STYLE_MISMATCH
  - SIDEBAR_GEOMETRY_OVERRIDE
  - SIDEBAR_DATA_ATTRIBUTE_DRIFT
- Checks:
  - Single source of truth: frontend/src/theme/as6Theme.css
  - Width: 300px
  - Radius: 0 26px 26px 0
  - No V200/V201 sidebar imports
  - Valid data-command-sidebar attribute

## 20260622T224402Z command-center-real-sidebar-v203
- Diagnostic: ops/bin/as6-diagnose-command-center-real-sidebar-v203
- Failure class: SIDEBAR_PATCH_TARGETED_WRONG_PARENT_SELECTOR_AND_OLD_IMPORTS_REMAINED
- Check: real selector aside.sidebar.command-sidebar targeted.
- Check: app-shell grid forced to 320px through direct sidebar parent match.
- Check: V200/V201 imports removed.
- Check: data-command-sidebar attribute corrected.

## 20260622T232241Z command-center-final-real-sidebar-v204
- Diagnostic: ops/bin/as6-diagnose-command-center-final-real-sidebar-v204
- Failure class: APPSHELL_LOST_COMMAND_SHELL_CLASS_AND_SIDEBAR_HEIGHT_FORCED_OVERLAP
- Check: command-shell restored in AppShell.
- Check: sidebar width 342px.
- Check: sidebar height auto with no overlap.
- Check: legacy V200/V201/V203 imports removed.

## 20260622T235248Z command-center-compact-sidebar-v205
- Diagnostic: ops/bin/as6-diagnose-command-center-compact-sidebar-v205
- Failure class: SIDEBAR_V204_OVERSIZED_SPACING_FONT_AND_WIDTH_DRIFT_FROM_ETALON
- Check: sidebar width 286px.
- Check: nav font 14px.
- Check: nav gap 8px.
- Check: compact owner/help cards.
- Check: stale V200/V201/V203 imports absent.

## 20260623T003529Z command-center-sidebar-annotated-fix-v206
- Diagnostic: ops/bin/as6-diagnose-command-center-sidebar-annotated-fix-v206
- Failure class: SIDEBAR_ANNOTATED_ETALON_MISMATCH_LOGO_FRAME_NAV_GAP_FAVORITES_FRAME_WIDTH_HELP_HEIGHT
- Check: sidebar width 266px.
- Check: logo frame/background removed.
- Check: nav gap 5px.
- Check: favorites frame/background removed.
- Check: help card compact height 54px.

## 20260623T005837Z command-center-sidebar-final-alignment-v207
- Diagnostic: ops/bin/as6-diagnose-command-center-sidebar-final-alignment-v207
- Runtime tracer: ops/runtime-tracers/as6-command-center-sidebar-alignment-tracer-v207.js
- Failure classes:
  - SIDEBAR_RIGHT_SEPARATOR_ARTIFACT
  - SIDEBAR_LOGO_CENTER_ALIGNMENT_DRIFT
  - SIDEBAR_NESTED_CONTAINER_ARTIFACT_DRIFT
- Checks:
  - sidebar-scroll/nav pseudo-elements disabled
  - logo centered with final offset correction
  - favorites pseudo-elements disabled

## 20260623T010945Z revenue-chart-full-height-v208
- Diagnostic: ops/bin/as6-diagnose-revenue-chart-full-height-v208
- Failure class: REVENUE_DYNAMICS_CHART_USED_ONLY_TOP_PART_OF_CARD_LEAVING_EMPTY_BOTTOM_SPACE
- Check: revenue card flex column.
- Check: chart min-height 205px.
- Check: bottom padding reduced.
- Check: SVG line stretched to full chart height.

## 20260623T014555Z handoff-docs-v209
- Diagnostic: ops/bin/as6-diagnose-handoff-docs-v209
- Failure class: NEW_CHAT_CONTEXT_REQUIRES_PROJECT_HANDOFF_SOURCE_OF_TRUTH
- Check: docs/AS6_HANDOFF.md exists.
- Check: docs/AS6_CURRENT_STATE.md exists.
- Check: docs/AS6_ARCHITECTURE.md exists.
- Check: docs/AS6_UI_ETALONS.md exists.
- Check: docs/AS6_CODEX_PROMPT.md exists.
- Automation: ops/bin/as6-update-handoff
