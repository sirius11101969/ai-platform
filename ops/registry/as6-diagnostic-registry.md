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

## V222_41 Product Recommendation Card Reference Alignment

- Diagnostic: ops/bin/as6-diagnose-product-recommendation-card-v222-41

- Control: ops/bin/as6-control-product-recommendation-card-v222-41

- Runtime evidence: runtime/as6-v222-41/diagnostic-report.md

- Failure class: PRODUCT_RECOMMENDATION_INLINE_MICRO_LAYOUT_DRIFT

- Root cause: product_recommendation_card_was_constrained_by_inline_micro_width_and_padding

## V222_41 Product Recommendation Card Reference Alignment

- Diagnostic: ops/bin/as6-diagnose-product-recommendation-card-v222-41

- Control: ops/bin/as6-control-product-recommendation-card-v222-41

- Runtime evidence: runtime/as6-v222-41/diagnostic-report.md

- Failure class: PRODUCT_RECOMMENDATION_INLINE_MICRO_LAYOUT_DRIFT

- Repair class: DIAGNOSTIC_RUNTIME_BACKUP_SCOPE_FALSE_POSITIVE

## V222_42 Product Recommendation Inline Layout Removal

- Diagnostic: ops/bin/as6-diagnose-product-recommendation-inline-layout-v222-42

- Control: ops/bin/as6-control-product-recommendation-inline-layout-v222-42

- Runtime evidence: runtime/as6-v222-42/diagnostic-report.md

- Failure class: REACT_INLINE_LAYOUT_OVERRIDES_REFERENCE_CSS

- Root cause: react_inline_style_overrode_reference_css_for_product_recommendation_card

## V222_42 Repair — Product Recommendation CSS-Owned Component

- Diagnostic: ops/bin/as6-diagnose-product-recommendation-inline-layout-v222-42

- Control: ops/bin/as6-control-product-recommendation-inline-layout-v222-42

- Runtime evidence: runtime/as6-v222-42-repair/diagnostic-report.md

- Failure class: EXACT_BLOCK_PATCH_MISSED_INLINE_LAYOUT_DECLARATIONS

- Root cause: previous_patch_used_exact_block_replacement_but_component_style_blocks_did_not_match_exactly

## V222_42 Targeted Inline Guard Repair

- Diagnostic: ops/bin/as6-diagnose-product-recommendation-inline-layout-v222-42

- Control: ops/bin/as6-control-product-recommendation-inline-layout-v222-42

- Runtime evidence: runtime/as6-v222-42-targeted-repair/diagnostic-report.md

- Failure class: OVERBROAD_INLINE_STYLE_GUARD_FALSE_POSITIVE

- Root cause: previous_guard_blocked_legitimate_progress_chart_inline_styles

## V222_43 Real Recommended Product Card Owner Alignment

- Diagnostic: ops/bin/as6-diagnose-real-recommended-product-card-v222-43

- Control: ops/bin/as6-control-real-recommended-product-card-v222-43

- Runtime evidence: runtime/as6-v222-43/diagnostic-report.md

- Failure class: WRONG_VISUAL_COMPONENT_TARGETED

- Root cause: previous_repairs_targeted_AS6_recommendation_card_but_user_marked_recommended_product_card

## V222_44 Production Bundle Refresh

- Diagnostic: ops/bin/as6-diagnose-production-bundle-refresh-v222-44

- Control: ops/bin/as6-control-production-bundle-refresh-v222-44

- Runtime evidence: runtime/as6-v222-44/

- Failure class: STALE_PRODUCTION_FRONTEND_BUNDLE

## V222_45 Repair Copy Fresh Dist Into Nginx

- Diagnostic: ops/bin/as6-diagnose-copy-dist-into-nginx-v222-45

- Control: ops/bin/as6-control-copy-dist-into-nginx-v222-45

- Runtime evidence: runtime/as6-v222-45-copy-dist/

- Failure class: FRONTEND_PACKAGE_LOCK_DRIFT_BLOCKED_IMAGE_REBUILD

## V222_57 Etalon Recommendation Card Full Rewrite

- Diagnostic: ops/bin/as6-diagnose-etalon-recommendation-card-v222-57

- Control: ops/bin/as6-control-etalon-recommendation-card-v222-57

- Runtime evidence: runtime/as6-v222-57-repair/

- Failure class: NODE_EVAL_REGEX_ESCAPE_FAILURE_AND_LEGACY_CARD_CSS_CONFLICT

## V222_58 Design System Foundation

- Diagnostic: ops/bin/as6-diagnose-design-system-foundation-v222-58

- Control: ops/bin/as6-control-design-system-foundation-v222-58

- Runtime evidence: runtime/as6-v222-58/

- Failure class: FRAGMENTED_UI_VISUAL_LANGUAGE

## V222_60 Disk Maintenance Automation

- Diagnostic: ops/bin/as6-diagnose-disk-maintenance-v222-60

- Control: ops/bin/as6-control-disk-maintenance-v222-60

- Runtime evidence: runtime/as6-v222-60/

- Failure class: ROOT_DISK_BACKUP_ACCUMULATION

## V222_61 CRM Component Replacement

- Diagnostic: ops/bin/as6-diagnose-crm-component-replacement-v222-61

- Control: ops/bin/as6-control-crm-component-replacement-v222-61

- Runtime evidence: runtime/as6-v222-61-safe/

- Failure class: FRAGILE_JSX_TRACER_INJECTION

## V222_61 Repair — False Secret Modal Stack Marker

- Diagnostic: ops/bin/as6-diagnose-crm-false-secret-modal-stack-marker-v222-61

- Control: ops/bin/as6-control-crm-false-secret-modal-stack-marker-v222-61

- Runtime evidence: runtime/as6-v222-61-false-secret-repair/

- Failure class: SECRET_SCAN_FALSE_POSITIVE_MARKER_NAMING

## V222_62 CRM Visual Rewrite

- Diagnostic: ops/bin/as6-diagnose-crm-visual-rewrite-v222-62

- Control: ops/bin/as6-control-crm-visual-rewrite-v222-62

- Runtime evidence: runtime/as6-v222-62/

- Failure class: CRM_VISUAL_SURFACE_DRIFT_FROM_COMMAND_CENTER

## V223_00 CRM Pipeline Compact Design System

- Diagnostic: ops/bin/as6-diagnose-crm-pipeline-compact-v223-00

- Control: ops/bin/as6-control-crm-pipeline-compact-v223-00

- Runtime evidence: runtime/as6-v223-00/

- Failure class: CRM_PIPELINE_TALL_EMPTY_COLUMN_SURFACE

## V223_01 CRM Board Layout Fix

- Diagnostic: ops/bin/as6-diagnose-crm-board-layout-v223-01

- Control: ops/bin/as6-control-crm-board-layout-v223-01

- Runtime evidence: runtime/as6-v223-01/

- Failure class: CRM_BOARD_HORIZONTAL_SCROLL_LEAK_AND_NARROW_COLUMNS

## V223_02 CRM Final Density Tuning

- Diagnostic: ops/bin/as6-diagnose-crm-final-density-v223-02

- Control: ops/bin/as6-control-crm-final-density-v223-02

- Runtime evidence: runtime/as6-v223-02/

- Failure class: CRM_COLUMN_CAPSULE_AND_CARD_DENSITY_DRIFT

## V223_03 CRM Visual Polish

- Diagnostic: ops/bin/as6-diagnose-crm-visual-polish-v223-03

- Control: ops/bin/as6-control-crm-visual-polish-v223-03

- Runtime evidence: runtime/as6-v223-03/

- Failure class: CRM_VISUAL_POLISH_DRIFT

## V223_04 CRM Browser Visual Verification

- Diagnostic: ops/bin/as6-diagnose-crm-browser-visual-v223-04

- Control: ops/bin/as6-control-crm-browser-visual-v223-04

- Runtime evidence: runtime/as6-v223-04/

- Failure class: CRM_BROWSER_VISUAL_VERIFICATION_GAP

## AS6 Docs Bootstrap Hardening

- Diagnostic: ops/bin/as6-diagnose-docs-bootstrap-hardening
- Control: ops/bin/as6-control-docs-bootstrap-hardening
- Runtime evidence: runtime/as6-docs-bootstrap-hardening/

## AS6 Workspace Implementation V224
- Diagnostic: ops/bin/as6-diagnose-workspace-implementation-v224
- Control: ops/bin/as6-control-workspace-implementation-v224
- Runtime evidence: runtime/as6-v224-workspace/
- Failure class: AS6_WORKSPACE_CANONICAL_COMPONENT_GAP

## AS6 Sidebar Implementation V225
- Diagnostic: ops/bin/as6-diagnose-sidebar-implementation-v225
- Control: ops/bin/as6-control-sidebar-implementation-v225
- Runtime evidence: runtime/as6-v225-sidebar/
- Failure class: AS6_SIDEBAR_CANONICAL_COMPONENT_GAP

## AS6 Header Implementation V226
- Diagnostic: ops/bin/as6-diagnose-header-implementation-v226
- Control: ops/bin/as6-control-header-implementation-v226
- Runtime evidence: runtime/as6-v226-header/
- Failure class: AS6_HEADER_CANONICAL_COMPONENT_GAP
- Repair failure class: AS6_REGEX_PATCH_OPTIONAL_CHAINING_COLLISION

## AS6 Right Rail Implementation V227
- Diagnostic: ops/bin/as6-diagnose-right-rail-implementation-v227
- Control: ops/bin/as6-control-right-rail-implementation-v227
- Runtime evidence: runtime/as6-v227-right-rail/
- Failure class: AS6_RIGHT_RAIL_CANONICAL_COMPONENT_GAP

## AS6 Core Implementation V228
- Diagnostic: ops/bin/as6-diagnose-core-implementation-v228
- Control: ops/bin/as6-control-core-implementation-v228
- Runtime evidence: runtime/as6-v228-core/
- Failure class: AS6_CORE_CANONICAL_COMPONENT_GAP

## AS6 Assistant Implementation V229
- Diagnostic: ops/bin/as6-diagnose-assistant-implementation-v229
- Control: ops/bin/as6-control-assistant-implementation-v229
- Runtime evidence: runtime/as6-v229-assistant/
- Failure class: AS6_ASSISTANT_CANONICAL_COMPONENT_GAP

## AS6 Focus Implementation V230
- Diagnostic: ops/bin/as6-diagnose-focus-implementation-v230
- Control: ops/bin/as6-control-focus-implementation-v230
- Runtime evidence: runtime/as6-v230-focus/
- Failure class: AS6_FOCUS_CANONICAL_COMPONENT_GAP

## AS6 CRM Workspace Client Migration V231
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-client-migration-v231
- Control: ops/bin/as6-control-crm-workspace-client-migration-v231
- Runtime evidence: runtime/as6-v231-crm-workspace-client/
- Failure class: AS6_CRM_WORKSPACE_CLIENT_MIGRATION_GAP
- Repair failure class: AS6_REGEX_PATCH_OPTIONAL_CHAINING_COLLISION

## AS6 CRM Workspace Client Visual Refinement V232
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-visual-refinement-v232
- Control: ops/bin/as6-control-crm-workspace-visual-refinement-v232
- Runtime evidence: runtime/as6-v232-crm-workspace-visual/
- Failure class: AS6_CRM_WORKSPACE_VISUAL_REFINEMENT_GAP

## AS6 CRM Workspace Client Runtime Tracer V233
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-runtime-tracer-v233
- Control: ops/bin/as6-control-crm-workspace-runtime-tracer-v233
- Runtime evidence: runtime/as6-v233-crm-workspace-runtime-tracer/
- Failure class: AS6_CRM_WORKSPACE_RUNTIME_TRACE_GAP

## AS6 CRM Workspace Client Browser Validation V234
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-browser-validation-v234
- Control: ops/bin/as6-control-crm-workspace-browser-validation-v234
- Validation: ops/bin/as6-validate-crm-workspace-browser-v234
- Runtime evidence: runtime/as6-v234-crm-workspace-browser-validation/
- Failure class: AS6_CRM_WORKSPACE_BROWSER_VALIDATION_GAP

## AS6 CRM Workspace Client Production Check V235
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-production-check-v235
- Control: ops/bin/as6-control-crm-workspace-production-check-v235
- Production check: ops/bin/as6-production-check-crm-workspace-client-v235
- Runtime evidence: runtime/as6-v235-crm-workspace-production-check/
- Failure class: AS6_CRM_WORKSPACE_PRODUCTION_CHECK_GAP

## AS6 CRM Workspace Client UI Review V236
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-ui-review-v236
- Control: ops/bin/as6-control-crm-workspace-ui-review-v236
- Runtime evidence: runtime/as6-v236-crm-workspace-ui-review/
- Failure class: AS6_CRM_WORKSPACE_UI_REVIEW_GAP

## AS6 CRM Workspace Client Browser Visual Check V237
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-browser-visual-check-v237
- Control: ops/bin/as6-control-crm-workspace-browser-visual-check-v237
- Visual check: ops/bin/as6-visual-check-crm-workspace-client-v237
- Runtime evidence: runtime/as6-v237-crm-workspace-browser-visual-check/
- Failure class: AS6_CRM_WORKSPACE_BROWSER_VISUAL_CHECK_GAP

## AS6 CRM Workspace Production Deploy Drift Check V238
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-deploy-drift-v238
- Control: ops/bin/as6-control-crm-workspace-deploy-drift-v238
- Runtime evidence: runtime/as6-v238-crm-workspace-deploy-drift-check/
- Failure class: AS6_CRM_WORKSPACE_PRODUCTION_DEPLOY_DRIFT

## AS6 CRM Workspace Production Deploy Repair V239
- Diagnostic: ops/bin/as6-diagnose-crm-workspace-production-deploy-repair-v239
- Control: ops/bin/as6-control-crm-workspace-production-deploy-repair-v239
- Repair: ops/bin/as6-repair-crm-workspace-production-deploy-v239
- Runtime evidence: runtime/as6-v239-crm-workspace-production-deploy-repair/
- Failure class: AS6_CRM_WORKSPACE_PRODUCTION_DEPLOY_DRIFT

## AS6 Serving Root Forensics V240
- Diagnostic: ops/bin/as6-diagnose-serving-root-forensics-v240
- Control: ops/bin/as6-control-serving-root-forensics-v240
- Runtime evidence: runtime/as6-v240-serving-root-forensics/
- Failure class: AS6_PRODUCTION_SERVING_ROOT_UNKNOWN

## AS6 Docker Frontend Serving Root Repair V241
- Diagnostic: ops/bin/as6-diagnose-docker-frontend-serving-root-repair-v241
- Control: ops/bin/as6-control-docker-frontend-serving-root-repair-v241
- Repair: ops/bin/as6-repair-docker-frontend-serving-root-v241
- Runtime evidence: runtime/as6-v241-docker-frontend-serving-root-repair/
- Failure class: AS6_DOCKER_FRONTEND_SERVING_ROOT_DRIFT

## V242 CRM Workspace Production Visual Confirmation
- Control: ops/bin/as6-v242-confirm
- Runtime: runtime/as6-v242-close/
