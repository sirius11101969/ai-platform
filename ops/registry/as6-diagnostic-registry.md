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
