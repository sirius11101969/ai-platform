# AS6 Diagnostic Registry

## AS6 EPIC022 CRM ONE Workspace Migration
- diagnostic: frontend route and living-space registry inspection
- route: /as6-crm
- shell: AS6Shell
- rollback: /as6-sales
- result: AS6_CRM_ONE_WORKSPACE_ROUTE=REGISTERED
- failure_class: AS6_CRM_OLD_SHELL_ADOPTION_DRIFT
- architecture_rule: AS6_CRM_MUST_USE_AS6_ONE_WORKSPACE

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

## AS6_WORKSPACE_IMPLEMENTATION_V1
- Diagnostic artifact: runtime/as6-workspace-v1/
- Root cause: docs/AS6_WORKSPACE_V1_ROOT_CAUSE.md
- UI component: frontend/src/components/as6/AS6Workspace.jsx
- Style artifact: frontend/src/styles/as6-workspace.css

## AS6_WORKSPACE_ROUTE_INTEGRATION_SAFE_PATCH

- Diagnostic artifact: runtime/as6-workspace-route-integration-safe-patch/
- Failure diagnosed: duplicate AS6WorkspacePage imports caused Vite build failure.
- Validation: import count equals 1.
- Validation: /as6-workspace route count equals 1.
- Validation: frontend production build PASS.

## AS6_CRM_WORKSPACE_MIGRATION

- Diagnostic artifact: runtime/as6-crm-workspace-migration/
- Root cause: docs/AS6_CRM_WORKSPACE_MIGRATION_ROOT_CAUSE.md
- Validation: CRMWorkspacePage exists.
- Validation: /crm-workspace route count equals 1.
- Validation: frontend build PASS.

## AS6_OS_FOUNDATION_V1
- Diagnostic artifact: runtime/as6-os-foundation-v1/
- Root cause: docs/AS6_OS_FOUNDATION_V1_ROOT_CAUSE.md
- Validation: AS6 OS route count equals 1.
- Validation: AS6 OS import count equals 1.
- Validation: frontend production build PASS.

## AS6_V243_CRM_WORKSPACE_CLIENT_POLISH_FIX

- Diagnostic artifact: runtime/as6-v243-crm-workspace-client-polish-fix/
- Root cause: docs/AS6_V243_CRM_WORKSPACE_CLIENT_POLISH_FIX_ROOT_CAUSE.md
- Validation: CRMPage restored from HEAD before patch.
- Validation: CSS import count equals 1.
- Validation: frontend production build PASS.

## AS6_OS_BRAND_SYSTEM_REFINEMENT
- Diagnostic artifact: runtime/as6-os-brand-system-refinement/
- Root cause: docs/AS6_OS_BRAND_SYSTEM_REFINEMENT_ROOT_CAUSE.md
- Governance: ops/governance/as6-os-brand-system-refinement-governance.md
- Validation: CSS layer exists.
- Validation: CRMPage imports brand layer exactly once.
- Validation: frontend production build PASS.

## AS6_OS_ASSISTANT_COMMAND_LAYER
- Diagnostic artifact: runtime/as6-os-assistant-command-layer/
- Root cause: docs/AS6_OS_ASSISTANT_COMMAND_LAYER_ROOT_CAUSE.md
- Governance: ops/governance/as6-os-assistant-command-layer-governance.md
- Validation: CSS layer exists.
- Validation: CRMPage imports command layer exactly once.
- Validation: frontend production build PASS.
- UI page changed: /crm.

## AS6_OS_INTERACTIVE_COMMAND_PALETTE
- Diagnostic artifact: runtime/as6-os-interactive-command-palette/
- Root cause: docs/AS6_OS_INTERACTIVE_COMMAND_PALETTE_ROOT_CAUSE.md
- Governance: ops/governance/as6-os-interactive-command-palette-governance.md
- Validation: AS6CommandPalette component exists.
- Validation: CRMPage imports AS6CommandPalette exactly once.
- Validation: CRMPage renders AS6CommandPalette exactly once.
- Validation: frontend production build PASS.
- UI page changed: /crm.

## AS6_CRM_BRAND_REWRITE_V1
- Diagnostic artifact: runtime/as6-crm-brand-rewrite-v1/
- Root cause: docs/AS6_CRM_BRAND_REWRITE_V1_ROOT_CAUSE.md
- Governance: ops/governance/as6-crm-brand-rewrite-v1-governance.md
- Validation: /crm-v2 route count equals 1.
- Validation: CRMBrandV2Page import count equals 1.
- Validation: frontend production build PASS.
- UI page changed: /crm-v2.
- UI page not changed: /crm.

## AS6_CRM_V2_PRODUCTION_DEPLOY_VALIDATION

- Diagnostic artifact: runtime/as6-crm-v2-production-deploy-validation/
- Root cause: docs/AS6_CRM_V2_PRODUCTION_DEPLOY_VALIDATION_ROOT_CAUSE.md
- Validation: source route evidence captured.
- Validation: dist marker evidence captured.
- Validation: nginx/root diagnostics captured.
- Validation: local and public HTTP headers captured.

## AS6_CRM_V2_PROTECTED_ROUTE_FIX
- Diagnostic artifact: runtime/as6-crm-v2-protected-route-fix/
- Root cause: docs/AS6_CRM_V2_PROTECTED_ROUTE_FIX_ROOT_CAUSE.md
- Governance: ops/governance/as6-crm-v2-protected-route-fix-governance.md
- Validation: /crm-v2 route count equals 1.
- Validation: /crm-v2 uses ProtectedRoute.
- Validation: frontend production build PASS.

## AS6_DOCKER_FRONTEND_DIST_SYNC

- Diagnostic artifact: runtime/as6-docker-frontend-dist-sync/
- Root cause: docs/AS6_DOCKER_FRONTEND_DIST_SYNC_ROOT_CAUSE.md
- Governance: ops/governance/as6-docker-frontend-dist-sync-governance.md
- Validation: host frontend/dist contains /crm-v2 markers.
- Validation: Docker Nginx html contains /crm-v2 markers after sync.
- Validation: Docker Nginx config test PASS.

## AS6_SHELL_FOUNDATION

- Diagnostic artifact: runtime/as6-shell-foundation/
- Root cause: docs/genesis/08_AS6_SHELL_FOUNDATION_ROOT_CAUSE.md
- Validation: frontend build and guardian.

## AS6_VITE_CONFIG_SYNTAX_REPAIR

- Diagnostic artifact: runtime/as6-vite-config-syntax-repair/
- Root cause: docs/genesis/10_AS6_VITE_CONFIG_SYNTAX_REPAIR_ROOT_CAUSE.md
- Validation: frontend build PASS.
- Validation: no Circular chunk warning.
- Validation: AS6 Guardian SAFE_TO_MERGE.

## AS6_ONE_SHELL_ADAPTER_V85B_REPAIR
- Repair diagnostic: clean-worktree guard correctly stopped V85.
- Registered untracked artifacts from previous governance/root-cause cycles.
- Added AS6 ONE Shell Adapter contract validation.

## AS6_ONE_SHELL_ADAPTER_V85C_BUILD_PATH_REPAIR
- Diagnostic added: package.json location detection before npm build.
- Diagnostic added: build directory evidence.
- Control added: AS6_ONE_SHELL_ADAPTER_V85B must remain PASS before commit.

## AS6_ONE_SHELL_ADAPTER_V85D_BUILD_SCRIPT_REPAIR
- Diagnostic added: detect package.json with explicit build script.
- Diagnostic added: prevent selecting package without build script.
- Control reused: AS6_ONE_SHELL_ADAPTER_V85B must remain PASS.

## AS6_ONE_SHELL_ADAPTER_V85E_BUILD_SELECTOR_FINAL
- Diagnostic added: prune all node_modules package.json candidates.
- Diagnostic added: prefer app-level frontend package.json.
- Diagnostic added: reject node_modules build directory.
- Diagnostic added: avoid committing ignored runtime directory.

## AS6_ONE_SHELL_REAL_WIRING_V86
- Diagnostic: ops/bin/as6-diagnose-one-shell-real-wiring-v86
- Control: ops/bin/as6-control-one-shell-real-wiring-v86
- Added real route wiring validation for /as6-one -> AS6OneShellAdapter -> AS6Shell.
- Added failure class: AS6_ONE_SHELL_ROUTE_WIRING_DRIFT.
- Added failure class: AS6_ONE_BUSINESS_LOGIC_REWRITE_DRIFT.

## AS6_ONE_SHELL_EXPORT_REPAIR_V86B
- Diagnostic added: AS6Shell export style detection.
- Diagnostic added: AS6OneShellAdapter import style validation.
- Failure class added: AS6_SHELL_EXPORT_INTERFACE_DRIFT.
- Failure class added: AS6_ONE_SHELL_IMPORT_STYLE_MISMATCH.

## AS6_CONTEXT_BAR_INTELLIGENCE_RAIL_CONTRACT_V87
- Diagnostic: ops/bin/as6-diagnose-context-rail-contract-v87
- Control: ops/bin/as6-control-context-rail-contract-v87
- Contract: frontend/src/as6/shell/AS6ShellZones.contract.md
- Added shell-zone contract validation.
- Added adapter zone mode validation.
- Added failure class: AS6_CONTEXT_RAIL_ZONE_DRIFT.
- Added failure class: AS6_LIVING_SPACE_ADAPTER_ZONE_POLICY.

## AS6_CRM_LIVING_SPACE_ADAPTER_V88
- Diagnostic: ops/bin/as6-diagnose-crm-living-space-adapter-v88
- Control: ops/bin/as6-control-crm-living-space-adapter-v88
- Adapter: frontend/src/as6-sales/AS6SalesShellAdapter.jsx
- Contract: frontend/src/as6-sales/AS6SalesShellAdapter.contract.md
- Added /as6-sales route validation.
- Added CRM Living Space adapter validation.
- Added failure class: AS6_CRM_LIVING_SPACE_ROUTE_DRIFT.
- Added failure class: AS6_CRM_BUSINESS_LOGIC_REWRITE_RISK.

## AS6_CRM_LIVING_SPACE_ROUTE_JSX_REPAIR_V88B
- Diagnostic: ops/bin/as6-diagnose-crm-living-space-route-jsx-v88b
- Control: ops/bin/as6-control-crm-living-space-route-jsx-v88b
- Added route JSX sibling validation.
- Added failure class: AS6_ROUTE_JSX_NESTING_DRIFT.
- Added failure class: AS6_ROUTE_PATCHER_PARTIAL_ELEMENT_MATCH.

## AS6_CRM_LAZY_IMPORT_CONSOLIDATION_V89
- Diagnostic: ops/bin/as6-diagnose-crm-lazy-import-v89
- Control: ops/bin/as6-control-crm-lazy-import-v89
- Added duplicate CRM dynamic/static import detection.
- Added failure class: AS6_CRM_DUPLICATE_DYNAMIC_STATIC_IMPORT_DRIFT.
- Added failure class: AS6_SALES_ADAPTER_ENTRY_BYPASS.

## AS6_LIVING_SPACE_REGISTRY_V90
- Diagnostic: ops/bin/as6-diagnose-living-space-registry-v90
- Control: ops/bin/as6-control-living-space-registry-v90
- Registry: frontend/src/as6/living-spaces/as6LivingSpaceRegistry.js
- Contract: frontend/src/as6/living-spaces/AS6LivingSpaceRegistry.contract.md
- Added Living Space registry validation.
- Added failure class: AS6_LIVING_SPACE_REGISTRY_DRIFT.
- Added failure class: AS6_MANUAL_ROUTE_DRIFT.

## AS6_REGISTRY_DRIVEN_ROUTE_RENDERING_V91
- Diagnostic: ops/bin/as6-diagnose-registry-driven-routes-v91
- Control: ops/bin/as6-control-registry-driven-routes-v91
- Route module: frontend/src/as6/living-spaces/AS6LivingSpaceRoutes.jsx
- Registry: frontend/src/as6/living-spaces/as6LivingSpaceRegistry.js
- Added registry-driven route rendering validation.
- Added failure class: AS6_REGISTRY_ROUTE_RENDERING_DRIFT.
- Added failure class: AS6_APP_MANUAL_LIVING_SPACE_ROUTE_DRIFT.

## AS6_REGISTRY_DRIVEN_AUTH_ROUTE_REPAIR_V91B
- Diagnostic: ops/bin/as6-diagnose-registry-auth-routes-v91b
- Control: ops/bin/as6-control-registry-auth-routes-v91b
- Added auth-aware registry route rendering validation.
- Added failure class: AS6_REGISTRY_AUTH_POLICY_DRIFT.
- Added failure class: AS6_MANUAL_AUTH_WRAPPED_ROUTE_DRIFT.

## AS6_LEGACY_V90_DIAGNOSTIC_REPAIR_V91C
- Diagnostic: ops/bin/as6-diagnose-legacy-v90-diagnostic-repair-v91c
- Control: ops/bin/as6-control-legacy-v90-diagnostic-repair-v91c
- Repaired legacy diagnostic: ops/bin/as6-diagnose-living-space-registry-v90
- Added registry-driven compatibility to V90 diagnostic.
- Added failure class: AS6_LEGACY_DIAGNOSTIC_ROUTE_MODEL_DRIFT.

## AS6_LEGACY_V89_DIAGNOSTIC_REPAIR_V91D
- Diagnostic: ops/bin/as6-diagnose-legacy-v89-diagnostic-repair-v91d
- Control: ops/bin/as6-control-legacy-v89-diagnostic-repair-v91d
- Repaired legacy diagnostic: ops/bin/as6-diagnose-crm-lazy-import-v89
- Added registry-driven compatibility to V89 CRM lazy import diagnostic.
- Added failure class: AS6_LEGACY_CRM_ENTRY_DIAGNOSTIC_ROUTE_MODEL_DRIFT.

## AS6_LEGACY_V87_DIAGNOSTIC_REPAIR_V91E
- Diagnostic: ops/bin/as6-diagnose-legacy-v87-diagnostic-repair-v91e
- Control: ops/bin/as6-control-legacy-v87-diagnostic-repair-v91e
- Repaired legacy diagnostic: ops/bin/as6-diagnose-context-rail-contract-v87
- Added registry-driven compatibility to V87 Context/Rail diagnostic.
- Added failure class: AS6_LEGACY_CONTEXT_RAIL_DIAGNOSTIC_ROUTE_MODEL_DRIFT.

## AS6_AUTH_WRAPPER_MODULE_REPAIR_V91F
- Diagnostic: ops/bin/as6-diagnose-auth-wrapper-module-v91f
- Control: ops/bin/as6-control-auth-wrapper-module-v91f
- Auth module: frontend/src/as6/auth/AS6RouteAuth.jsx
- Added shared RequireAuth/ProtectedRoute validation.
- Added failure class: AS6_AUTH_WRAPPER_MODULE_DRIFT.

## AS6_AUTH_WRAPPER_FINAL_DEDUPE_V91F
- Diagnostic: ops/bin/as6-diagnose-auth-wrapper-final-dedupe-v91f
- Control: ops/bin/as6-control-auth-wrapper-final-dedupe-v91f
- Added duplicate auth symbol detection.
- Added failure class: AS6_AUTH_WRAPPER_DUPLICATE_SYMBOL_DRIFT.

## AS6_PRECOMMIT_SECRET_HOOK_REPAIR_V91I
- Diagnostic: ops/bin/as6-diagnose-precommit-secret-hook-v91i
- Control: ops/bin/as6-control-precommit-secret-hook-v91i
- Added failure class: AS6_PRECOMMIT_SECRET_SCAN_CONTEXT_FALSE_POSITIVE.

## AS6_PRECOMMIT_HARD_SECRET_SCAN_REPAIR_V91J
- Diagnostic: ops/bin/as6-diagnose-precommit-hook-hard-secret-scan-v91j
- Control: ops/bin/as6-control-precommit-hook-hard-secret-scan-v91j
- Added failure class: AS6_PRECOMMIT_ACTIVE_HOOK_SECRET_SCAN_DRIFT.

## AS6_SECRET_SCAN_REGEX_NARROW_V91K
- Diagnostic: ops/bin/as6-diagnose-secret-scan-regex-narrow-v91k
- Control: ops/bin/as6-control-secret-scan-regex-narrow-v91k
- Added failure class: AS6_SECRET_SCAN_BROAD_REGEX_FALSE_POSITIVE.

## AS6_DYNAMIC_LIVING_SPACE_ENGINE_V92
- Diagnostic: ops/bin/as6-diagnose-dynamic-living-space-engine-v92
- Control: ops/bin/as6-control-dynamic-living-space-engine-v92
- Engine: frontend/src/as6/living-spaces/as6LivingSpaceEngine.js
- Contract: frontend/src/as6/living-spaces/AS6LivingSpaceEngine.contract.md
- Added failure class: AS6_LIVING_SPACE_ENGINE_DRIFT.
- Added failure class: AS6_LIVING_SPACE_MENU_METADATA_GAP.

## AS6_REGISTRY_DRIVEN_NAVIGATION_UI_V93
- Diagnostic: ops/bin/as6-diagnose-registry-navigation-ui-v93
- Control: ops/bin/as6-control-registry-navigation-ui-v93
- Navigation UI: frontend/src/as6/living-spaces/AS6LivingSpaceNav.jsx
- Contract: frontend/src/as6/living-spaces/AS6LivingSpaceNav.contract.md
- Added failure class: AS6_REGISTRY_NAVIGATION_UI_DRIFT.

## AS6_ACTIVE_LIVING_SPACE_CONTEXT_BAR_V94
- Diagnostic: ops/bin/as6-diagnose-active-living-space-context-bar-v94
- Control: ops/bin/as6-control-active-living-space-context-bar-v94
- Context Bar: frontend/src/as6/living-spaces/AS6ActiveLivingSpaceContextBar.jsx
- Contract: frontend/src/as6/living-spaces/AS6ActiveLivingSpaceContextBar.contract.md
- Added failure class: AS6_ACTIVE_CONTEXT_BAR_DRIFT.

## AS6_ACTIVE_CONTEXT_BAR_CONTROL_ALIAS_REPAIR_V94B
- Repaired control: ops/bin/as6-control-active-living-space-context-bar-v94
- Added alias: ops/bin/as6-control-registry-driven-navigation-ui-v93
- Added failure class: AS6_CONTROL_DEPENDENCY_NAME_DRIFT.

## AS6_DYNAMIC_INTELLIGENCE_RAIL_V95
- Diagnostic: ops/bin/as6-diagnose-dynamic-intelligence-rail-v95
- Control: ops/bin/as6-control-dynamic-intelligence-rail-v95
- Intelligence Rail: frontend/src/as6/living-spaces/AS6DynamicIntelligenceRail.jsx
- Contract: frontend/src/as6/living-spaces/AS6DynamicIntelligenceRail.contract.md
- Added failure class: AS6_DYNAMIC_INTELLIGENCE_RAIL_DRIFT.

## AS6_SHELL_LAYOUT_POLISH_RESPONSIVE_COMPOSITION_V96
- Diagnostic: ops/bin/as6-diagnose-shell-layout-polish-v96
- Control: ops/bin/as6-control-shell-layout-polish-v96
- Shell CSS: frontend/src/as6/shell/AS6Shell.css
- Contract: frontend/src/as6/shell/AS6ShellLayout.contract.md
- Added failure class: AS6_SHELL_LAYOUT_COMPOSITION_DRIFT.

## AS6_GLOBAL_COMMAND_PALETTE_V97
- Diagnostic: ops/bin/as6-diagnose-global-command-palette-v97
- Control: ops/bin/as6-control-global-command-palette-v97
- Command Palette: frontend/src/as6/commands/AS6GlobalCommandPalette.jsx
- Contract: frontend/src/as6/commands/AS6GlobalCommandPalette.contract.md
- Added failure class: AS6_GLOBAL_COMMAND_PALETTE_DRIFT.

## AS6_UNIVERSAL_WORKSPACE_MANAGER_V98
- Diagnostic: ops/bin/as6-diagnose-universal-workspace-manager-v98
- Control: ops/bin/as6-control-universal-workspace-manager-v98
- Workspace Manager: frontend/src/as6/workspace/as6WorkspaceManager.js
- Contract: frontend/src/as6/workspace/AS6WorkspaceManager.contract.md
- Added failure class: AS6_WORKSPACE_MANAGER_DRIFT.

## AS6_WORKSPACE_PERSISTENCE_MULTI_SESSION_ENGINE_V99
- Diagnostic: ops/bin/as6-diagnose-workspace-persistence-v99
- Control: ops/bin/as6-control-workspace-persistence-v99
- Workspace Storage: frontend/src/as6/workspace/as6WorkspaceStorage.js
- Contract: frontend/src/as6/workspace/AS6WorkspacePersistence.contract.md
- Added failure class: AS6_WORKSPACE_PERSISTENCE_DRIFT.

## AS6_RUNTIME_ORCHESTRATOR_V100
- Diagnostic: ops/bin/as6-diagnose-runtime-orchestrator-v100
- Control: ops/bin/as6-control-runtime-orchestrator-v100
- Runtime: frontend/src/as6/runtime/as6Runtime.js
- Contract: frontend/src/as6/runtime/AS6Runtime.contract.md
- Added failure class: AS6_RUNTIME_ORCHESTRATOR_DRIFT.

## AS6_EVENT_BUS_V101
- Diagnostic: ops/bin/as6-diagnose-event-bus-v101
- Control: ops/bin/as6-control-event-bus-v101
- Event Bus: frontend/src/as6/runtime/as6EventBus.js
- Contract: frontend/src/as6/runtime/AS6EventBus.contract.md
- Added failure class: AS6_EVENT_BUS_DRIFT.

## AS6_CONTROL_RUNNER_DAG_V102
- Diagnostic: ops/bin/as6-diagnose-control-runner-dag-v102
- Control: ops/bin/as6-control-control-runner-dag-v102
- Runner: ops/bin/as6-control-runner
- Manifest: ops/registry/as6-control-dependency-manifest.tsv
- Added failure class: AS6_CONTROL_RUNNER_DUPLICATE_EXECUTION_DRIFT.

## AS6_CONTROL_RUNNER_CI_INTEGRATION_V103
- Diagnostic: ops/bin/as6-diagnose-control-runner-ci-integration-v103
- Control: ops/bin/as6-control-control-runner-ci-integration-v103
- Validate entrypoint: ops/bin/as6-validate
- Runner: ops/bin/as6-control-runner
- Added failure class: AS6_VALIDATE_ENTRYPOINT_DRIFT.

## AS6_CI_WORKFLOW_WIRING_V104
- Diagnostic: ops/bin/as6-diagnose-ci-workflow-wiring-v104
- Control: ops/bin/as6-control-ci-workflow-wiring-v104
- Workflow: .github/workflows/as6-validate.yml
- Validate entrypoint: ops/bin/as6-validate
- Added failure class: AS6_CI_WORKFLOW_WIRING_DRIFT.

## AS6_CI_STATUS_BADGE_VALIDATION_GOVERNANCE_V105
- Diagnostic: ops/bin/as6-diagnose-ci-status-badge-governance-v105
- Control: ops/bin/as6-control-ci-status-badge-governance-v105
- README badge: README.md
- Governance doc: ops/governance/as6-ci-validation-governance-v105.md
- Added failure class: AS6_CI_STATUS_BADGE_DRIFT.

## AS6_RELEASE_READINESS_GATE_V106
- Diagnostic: ops/bin/as6-diagnose-release-readiness-gate-v106
- Control: ops/bin/as6-control-release-readiness-gate-v106
- Release gate: ops/bin/as6-release-gate
- Validate entrypoint: ops/bin/as6-validate
- Added failure class: AS6_RELEASE_GATE_DRIFT.

## AS6_ARCHITECTURE_DRIFT_DETECTOR_V107
- Diagnostic: ops/bin/as6-diagnose-architecture-drift-detector-v107
- Control: ops/bin/as6-control-architecture-drift-detector-v107
- Detector: ops/bin/as6-detect-architecture-drift
- Added failure class: AS6_ARCHITECTURE_DRIFT_DETECTOR_DRIFT.
- Added failure class: AS6_UNREGISTERED_ROUTE_DRIFT.
- Added failure class: AS6_UNREGISTERED_CONTROL_DRIFT.

## AS6_SERVICE_REGISTRY_V108
- Diagnostic: ops/bin/as6-diagnose-service-registry-v108
- Control: ops/bin/as6-control-service-registry-v108
- Registry: frontend/src/as6/services/as6ServiceRegistry.js
- Engine: frontend/src/as6/services/as6ServiceEngine.js
- Added failure class: AS6_SERVICE_REGISTRY_DRIFT.

## AS6_PLUGIN_SDK_V109
- Diagnostic: ops/bin/as6-diagnose-plugin-sdk-v109
- Control: ops/bin/as6-control-plugin-sdk-v109
- Plugin Registry: frontend/src/as6/plugins/as6PluginRegistry.js
- Plugin SDK: frontend/src/as6/plugins/as6PluginSDK.js
- Added failure class: AS6_PLUGIN_SDK_DRIFT.

## AS6_SERVICE_DEPENDENCY_GRAPH_V110
- Diagnostic: ops/bin/as6-diagnose-service-dependency-graph-v110
- Control: ops/bin/as6-control-service-dependency-graph-v110
- Graph: frontend/src/as6/dependencies/as6ServiceDependencyGraph.js
- Engine: frontend/src/as6/dependencies/as6DependencyEngine.js
- Added failure class: AS6_SERVICE_DEPENDENCY_GRAPH_DRIFT.

## AS6_PLUGIN_LOADER_V111
- Diagnostic: ops/bin/as6-diagnose-plugin-loader-v111
- Control: ops/bin/as6-control-plugin-loader-v111
- Loader: frontend/src/as6/plugins/as6PluginLoader.js
- Contract: frontend/src/as6/plugins/AS6PluginLoader.contract.md
- Added failure class: AS6_PLUGIN_LOADER_DRIFT.

## AS6_CAPABILITY_RESOLVER_V112

Diagnostic:
ops/bin/as6-diagnose-capability-resolver-v112

Control:
ops/bin/as6-control-capability-resolver-v112

## AS6_CAPABILITY_REGISTRY_V113
- Diagnostic: ops/bin/as6-diagnose-capability-registry-v113
- Control: ops/bin/as6-control-capability-registry-v113
- Registry: frontend/src/as6/capabilities/as6CapabilityRegistry.js
- Engine: frontend/src/as6/capabilities/as6CapabilityEngine.js
- Added failure class: AS6_CAPABILITY_REGISTRY_DRIFT.

## AS6_PERMISSION_ENGINE_V114
Diagnostic:
ops/bin/as6-diagnose-permission-engine-v114

Control:
ops/bin/as6-control-permission-engine-v114

## AS6_POLICY_ENGINE_V115
- Diagnostic: ops/bin/as6-diagnose-policy-engine-v115
- Control: ops/bin/as6-control-policy-engine-v115
- Engine: frontend/src/as6/security/as6PolicyEngine.js
- Contract: frontend/src/as6/security/AS6PolicyEngine.contract.md
- Added failure class: AS6_POLICY_ENGINE_DRIFT.

## AS6_CONTROL_CHAIN_DEDUPE_V116
- Diagnostic: ops/bin/as6-diagnose-control-chain-dedupe-v116
- Control: ops/bin/as6-control-control-chain-dedupe-v116
- Scope: control files V106-V115.
- Added failure class: AS6_CONTROL_DIRECT_CHAIN_DRIFT.
- Added failure class: AS6_NESTED_RELEASE_GATE_DRIFT.

## AS6_BUILD_ONCE_VALIDATION_V117
- Diagnostic: ops/bin/as6-diagnose-build-once-validation-v117
- Control: ops/bin/as6-control-build-once-validation-v117
- Added failure class: AS6_BUILD_ONCE_VALIDATION_DRIFT.

## AS6_RELEASE_EVIDENCE_MANIFEST_V118
- Diagnostic: ops/bin/as6-diagnose-release-evidence-manifest-v118
- Control: ops/bin/as6-control-release-evidence-manifest-v118
- Evidence tool: ops/bin/as6-release-evidence
- Added failure class: AS6_RELEASE_EVIDENCE_MANIFEST_DRIFT.

## AS6_RELEASE_EVIDENCE_GATE_V119
- Diagnostic: ops/bin/as6-diagnose-release-evidence-gate-v119
- Control: ops/bin/as6-control-release-evidence-gate-v119
- Gate: ops/bin/as6-release-evidence-gate
- Added failure class: AS6_RELEASE_EVIDENCE_GATE_DRIFT.

## AS6_RELEASE_COMMAND_V120
- Diagnostic: ops/bin/as6-diagnose-release-command-v120
- Control: ops/bin/as6-control-release-command-v120
- Release command: ops/bin/as6-release
- Added failure class: AS6_RELEASE_COMMAND_DRIFT.

## AS6_RELEASE_SNAPSHOT_GATE_V122
- Diagnostic: ops/bin/as6-diagnose-release-snapshot-gate-v122
- Control: ops/bin/as6-control-release-snapshot-gate-v122
- Gate: ops/bin/as6-release-snapshot-gate
- Added failure class: AS6_RELEASE_SNAPSHOT_GATE_DRIFT.

## AS6_PLATFORM_V2_LIVING_SPACES_SPEC_P1
- Diagnostic: ops/bin/as6-diagnose-living-spaces-spec-p1
- Control: ops/bin/as6-control-living-spaces-spec-p1
- Spec: docs/platform-v2/living-spaces-2.0-spec.md
- Schema: frontend/src/as6/spaces/as6SpaceManifest.schema.js
- Added failure class: AS6_LIVING_SPACE_2_SPEC_DRIFT.

## AS6_PLATFORM_V2_CRM_LIVING_SPACE_RUNTIME_P2
- Diagnostic: ops/bin/as6-diagnose-crm-living-space-runtime-p2
- Control: ops/bin/as6-control-crm-living-space-runtime-p2
- Runtime: frontend/src/as6/spaces/crm/as6CrmLivingSpaceRuntime.js
- Contract: frontend/src/as6/spaces/crm/AS6CrmLivingSpaceRuntime.contract.md
- Added failure class: AS6_CRM_LIVING_SPACE_RUNTIME_DRIFT.

## AS6_PLATFORM_V2_CRM_RUNTIME_UI_INTEGRATION_P3
- Diagnostic: ops/bin/as6-diagnose-crm-runtime-ui-integration-p3
- Control: ops/bin/as6-control-crm-runtime-ui-integration-p3
- Bridge: frontend/src/as6/spaces/crm/AS6CrmRuntimeBridge.jsx
- Shell integration: frontend/src/as6-sales/AS6SalesShellAdapter.jsx
- Added failure class: AS6_CRM_RUNTIME_UI_INTEGRATION_DRIFT.

## AS6_PLATFORM_V2_AI_CONTEXT_ENGINE_P4
- Diagnostic: ops/bin/as6-diagnose-ai-context-engine-p4
- Control: ops/bin/as6-control-ai-context-engine-p4
- Engine: frontend/src/as6/ai/context/AS6AIContextEngine.js
- Bridge: frontend/src/as6/ai/context/AS6AIContextBridge.js
- Added failure class: AS6_AI_CONTEXT_DRIFT.

## AS6_PLATFORM_V2_AI_ACTION_ENGINE_P5
- Diagnostic: ops/bin/as6-diagnose-ai-action-engine-p5
- Control: ops/bin/as6-control-ai-action-engine-p5
- Engine: frontend/src/as6/ai/actions/AS6AIActionEngine.js
- CRM actions: frontend/src/as6/ai/actions/AS6CrmAIActions.js
- Added failure class: AS6_AI_ACTION_ENGINE_DRIFT.

## AS6_PLATFORM_V2_UNIVERSAL_SERVICE_BUS_P6
- Diagnostic: ops/bin/as6-diagnose-universal-service-bus-p6
- Control: ops/bin/as6-control-universal-service-bus-p6
- Bus: frontend/src/as6/bus/AS6UniversalServiceBus.js
- Bridge: frontend/src/as6/bus/AS6ServiceBusBridge.js
- Added failure class: AS6_UNIVERSAL_SERVICE_BUS_DRIFT.

## AS6_PLATFORM_V2_UNIVERSAL_WIDGET_RUNTIME_P7
- Diagnostic: ops/bin/as6-diagnose-universal-widget-runtime-p7
- Control: ops/bin/as6-control-universal-widget-runtime-p7
- Runtime: frontend/src/as6/widgets/AS6WidgetRuntime.js
- Registry: frontend/src/as6/widgets/AS6WidgetRegistry.js
- Added failure class: AS6_UNIVERSAL_WIDGET_RUNTIME_DRIFT.

## AS6_PLATFORM_V2_WORKSPACE_LAYOUT_RUNTIME_P8
- Runtime: frontend/src/as6/workspaces/AS6WorkspaceRuntime.js
- Control: ops/bin/as6-control-workspace-layout-runtime-p8

## AS6_PLATFORM_V2_TENANT_BOUNDARY_ENGINE_P9
- Diagnostic: ops/bin/as6-diagnose-tenant-boundary-engine-p9
- Control: ops/bin/as6-control-tenant-boundary-engine-p9
- Runtime: frontend/src/as6/tenant/AS6TenantRuntime.js
- Boundary: frontend/src/as6/tenant/AS6OrganizationBoundary.js
- Policy: frontend/src/as6/tenant/AS6TenantPolicy.js
- Added failure class: AS6_TENANT_BOUNDARY_DRIFT.

## AS6_PLATFORM_V2_PLUGIN_MARKETPLACE_RUNTIME_P10
- Diagnostic: ops/bin/as6-diagnose-plugin-marketplace-runtime-p10
- Control: ops/bin/as6-control-plugin-marketplace-runtime-p10
- Runtime: frontend/src/as6/plugins/AS6PluginRuntime.js
- Marketplace: frontend/src/as6/plugins/AS6PluginMarketplace.js
- Added failure class: AS6_PLUGIN_MARKETPLACE_RUNTIME_DRIFT.

## AS6_PLATFORM_V2_PUBLIC_EXTENSION_SDK_P11
- Diagnostic: ops/bin/as6-diagnose-public-extension-sdk-p11
- Control: ops/bin/as6-control-public-extension-sdk-p11
- SDK: frontend/src/as6/sdk/plugin/AS6PluginSDK.js
- Docs: docs/platform-v2/sdk/public-extension-sdk-p11.md
- Added failure class: AS6_PUBLIC_EXTENSION_SDK_DRIFT.

## AS6_PLATFORM_V2_CREATE_PLUGIN_CLI_P12
- Diagnostic: ops/bin/as6-diagnose-create-plugin-cli-p12
- Control: ops/bin/as6-control-create-plugin-cli-p12
- CLI: ops/bin/as6-create-plugin
- Generated plugin diagnostic: ops/bin/as6-diagnose-generated-plugin
- Added failure class: AS6_CREATE_PLUGIN_CLI_DRIFT.

## AS6_PLATFORM_V2_PLUGIN_REGISTRY_DISCOVERY_P13
- Diagnostic: ops/bin/as6-diagnose-plugin-registry-discovery-p13
- Control: ops/bin/as6-control-plugin-registry-discovery-p13
- Discovery: frontend/src/as6/plugins/AS6PluginDiscovery.js
- Registry: frontend/src/as6/plugins/AS6PluginRegistry.js
- Added failure class: AS6_PLUGIN_REGISTRY_DISCOVERY_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_UI_DEVELOPER_CONSOLE_P14
- Diagnostic: ops/bin/as6-diagnose-marketplace-ui-developer-console-p14
- Control: ops/bin/as6-control-marketplace-ui-developer-console-p14
- UI: frontend/src/as6/plugins/ui/AS6MarketplaceDeveloperConsole.jsx
- Console: frontend/src/as6/plugins/ui/AS6MarketplaceDeveloperConsole.contract.md
- Added failure class: AS6_MARKETPLACE_UI_DEVELOPER_CONSOLE_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_ROUTE_NAVIGATION_P15
- Diagnostic: ops/bin/as6-diagnose-marketplace-route-navigation-p15
- Control: ops/bin/as6-control-marketplace-route-navigation-p15
- Page: frontend/src/as6/plugins/marketplace-route/AS6MarketplacePage.jsx
- Navigation: frontend/src/as6/plugins/marketplace-route/AS6MarketplaceNavigation.js
- Added failure class: AS6_MARKETPLACE_ROUTE_NAVIGATION_DRIFT.

## AS6_PLATFORM_V2_DYNAMIC_SHELL_INTEGRATION_P16
- Diagnostic: ops/bin/as6-diagnose-dynamic-shell-integration-p16
- Control: ops/bin/as6-control-dynamic-shell-integration-p16
- Registry: frontend/src/as6/shell/dynamic/AS6DynamicShellRegistry.js
- Bridge: frontend/src/as6/shell/dynamic/AS6DynamicShellBridge.jsx
- Added failure class: AS6_DYNAMIC_SHELL_INTEGRATION_DRIFT.

## AS6_PLATFORM_V2_SHELL_RUNTIME_INTEGRATION_P17
- Diagnostic: ops/bin/as6-diagnose-shell-runtime-integration-p17
- Control: ops/bin/as6-control-shell-runtime-integration-p17
- Runtime: frontend/src/as6/shell/runtime/AS6ShellRuntimeIntegration.jsx
- Shell index export: frontend/src/as6/shell/index.js
- Added failure class: AS6_SHELL_RUNTIME_INTEGRATION_DRIFT.

## AS6_PLATFORM_V2_APP_RUNTIME_INTEGRATION_P18
- Diagnostic: ops/bin/as6-diagnose-app-runtime-integration-p18
- Control: ops/bin/as6-control-app-runtime-integration-p18
- App runtime: frontend/src/as6/app/AS6AppRuntimeIntegration.jsx
- App index export: frontend/src/as6/app/index.js
- Added failure class: AS6_APP_RUNTIME_INTEGRATION_DRIFT.

## AS6_PLATFORM_V2_REAL_APP_WIRING_P19
- Diagnostic: ops/bin/as6-diagnose-real-app-wiring-p19
- Control: ops/bin/as6-control-real-app-wiring-p19
- Wiring: frontend/src/as6/app/wiring/AS6RealAppWiring.jsx
- App index export: frontend/src/as6/app/index.js
- Added failure class: AS6_REAL_APP_WIRING_DRIFT.

## AS6_PLATFORM_V2_DIRECT_APP_INTEGRATION_P20
- Diagnostic: ops/bin/as6-diagnose-direct-app-integration-p20
- Control: ops/bin/as6-control-direct-app-integration-p20
- App: frontend/src/App.jsx
- Added failure class: AS6_DIRECT_APP_INTEGRATION_DRIFT.

## AS6_PLATFORM_V2_SIDEBAR_MENU_VISIBLE_PLACEMENT_P21
- Diagnostic: ops/bin/as6-diagnose-sidebar-menu-visible-placement-p21
- Control: ops/bin/as6-control-sidebar-menu-visible-placement-p21
- Sidebar: frontend/src/components/as6-workspace/AS6Sidebar.jsx
- Added failure class: AS6_SIDEBAR_MENU_VISIBLE_PLACEMENT_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_E2E_PLUGIN_VALIDATION_P22
- Diagnostic: ops/bin/as6-diagnose-marketplace-e2e-plugin-validation-p22
- Control: ops/bin/as6-control-marketplace-e2e-plugin-validation-p22
- Smoke plugin: frontend/src/as6/plugins/generated/p22-marketplace-smoke
- Added failure class: AS6_MARKETPLACE_E2E_PLUGIN_VALIDATION_DRIFT.

## AS6_PLATFORM_V2_GENERATED_PLUGIN_AUTO_DISCOVERY_P23
- Diagnostic: ops/bin/as6-diagnose-generated-plugin-auto-discovery-p23
- Control: ops/bin/as6-control-generated-plugin-auto-discovery-p23
- Generated index: frontend/src/as6/plugins/generated/index.js
- Generated manifest: frontend/src/as6/plugins/generated/generated-plugin-manifest.json
- Added failure class: AS6_GENERATED_PLUGIN_AUTO_DISCOVERY_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_INSTALL_PERSISTENCE_P24
- Diagnostic: ops/bin/as6-diagnose-marketplace-install-persistence-p24
- Control: ops/bin/as6-control-marketplace-install-persistence-p24
- Runtime: frontend/src/as6/plugins/AS6PluginRuntime.js
- Added failure class: AS6_MARKETPLACE_INSTALL_PERSISTENCE_DRIFT.

## AS6_PLATFORM_V2_PLUGIN_VERSION_UPDATE_MANAGER_P25
- Diagnostic: ops/bin/as6-diagnose-plugin-version-update-manager-p25
- Control: ops/bin/as6-control-plugin-version-update-manager-p25
- Runtime: frontend/src/as6/plugins/AS6PluginRuntime.js
- Marketplace: frontend/src/as6/plugins/AS6PluginMarketplace.js
- Added failure class: AS6_PLUGIN_VERSION_UPDATE_MANAGER_DRIFT.

## AS6_PLATFORM_V2_REMOTE_MARKETPLACE_CATALOG_P26A
- Diagnostic: ops/bin/as6-diagnose-remote-marketplace-catalog-p26a
- Control: ops/bin/as6-control-remote-marketplace-catalog-p26a
- Catalog: frontend/src/as6/plugins/AS6RemoteMarketplaceCatalog.js
- Added failure class: AS6_REMOTE_MARKETPLACE_CATALOG_DRIFT.

## AS6_PLATFORM_V2_REMOTE_CATALOG_UI_INTEGRATION_P26B
- Diagnostic: ops/bin/as6-diagnose-remote-catalog-ui-integration-p26b
- Control: ops/bin/as6-control-remote-catalog-ui-integration-p26b
- UI: frontend/src/as6/plugins/ui/AS6MarketplaceDeveloperConsole.jsx
- Added failure class: AS6_REMOTE_CATALOG_UI_INTEGRATION_DRIFT.

## AS6_PLATFORM_V2_SIGNED_PLUGIN_PACKAGES_TRUST_VALIDATION_P27
- Diagnostic: ops/bin/as6-diagnose-signed-plugin-packages-trust-validation-p27
- Control: ops/bin/as6-control-signed-plugin-packages-trust-validation-p27
- Trust: frontend/src/as6/plugins/AS6PluginTrust.js
- Marketplace: frontend/src/as6/plugins/AS6PluginMarketplace.js
- Added failure class: AS6_SIGNED_PLUGIN_PACKAGES_TRUST_VALIDATION_DRIFT.

## AS6_PLATFORM_V2_CRYPTOGRAPHIC_SIGNATURE_VERIFICATION_P28
- Diagnostic: ops/bin/as6-diagnose-cryptographic-signature-verification-p28
- Control: ops/bin/as6-control-cryptographic-signature-verification-p28
- Trust: frontend/src/as6/plugins/AS6PluginTrust.js
- Added failure class: AS6_CRYPTOGRAPHIC_SIGNATURE_VERIFICATION_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_TRUST_UI_INSTALLATION_POLICY_P29
- Diagnostic: ops/bin/as6-diagnose-marketplace-trust-ui-installation-policy-p29
- Control: ops/bin/as6-control-marketplace-trust-ui-installation-policy-p29
- Policy: frontend/src/as6/plugins/AS6MarketplaceTrustPolicy.js
- Marketplace: frontend/src/as6/plugins/AS6PluginMarketplace.js
- UI: frontend/src/as6/plugins/ui/AS6MarketplaceDeveloperConsole.jsx
- Added failure class: AS6_MARKETPLACE_TRUST_UI_INSTALLATION_POLICY_DRIFT.

## AS6_PLATFORM_V2_SIGNED_PACKAGE_MANAGER_P30
- Diagnostic: ops/bin/as6-diagnose-signed-package-manager-p30
- Control: ops/bin/as6-control-signed-package-manager-p30
- Package Manager: frontend/src/as6/plugins/AS6PluginPackageManager.js
- Marketplace: frontend/src/as6/plugins/AS6PluginMarketplace.js
- Added failure class: AS6_SIGNED_PACKAGE_MANAGER_DRIFT.

## AS6_PLATFORM_V2_PUBLIC_MARKETPLACE_P31
- Diagnostic: ops/bin/as6-diagnose-public-marketplace-p31
- Control: ops/bin/as6-control-public-marketplace-p31
- Public Marketplace: frontend/src/as6/plugins/AS6PublicMarketplace.js
- Added failure class: AS6_PUBLIC_MARKETPLACE_DRIFT.

## AS6_PLATFORM_V2_DEVELOPER_PORTAL_P32
- Diagnostic: ops/bin/as6-diagnose-developer-portal-p32
- Control: ops/bin/as6-control-developer-portal-p32
- Developer Portal: frontend/src/as6/plugins/AS6DeveloperPortal.js
- Added failure class: AS6_DEVELOPER_PORTAL_DRIFT.

## AS6_PLATFORM_V2_DEVELOPER_PORTAL_IMPORT_REPAIR_P32B
- Diagnostic: ops/bin/as6-diagnose-developer-portal-import-repair-p32b
- Control: ops/bin/as6-control-developer-portal-import-repair-p32b
- Repaired: frontend/src/as6/plugins/AS6DeveloperPortal.js
- Added failure class: AS6_DEVELOPER_PORTAL_SDK_IMPORT_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_ADMINISTRATION_P33
- Diagnostic: ops/bin/as6-diagnose-marketplace-administration-p33
- Control: ops/bin/as6-control-marketplace-administration-p33
- Administration: frontend/src/as6/plugins/AS6MarketplaceAdministration.js
- Added failure class: AS6_MARKETPLACE_ADMINISTRATION_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_PRODUCTION_SERVICES_P34
- Diagnostic: ops/bin/as6-diagnose-marketplace-production-services-p34
- Control: ops/bin/as6-control-marketplace-production-services-p34
- Production Services: frontend/src/as6/plugins/AS6MarketplaceProductionServices.js
- Added failure class: AS6_MARKETPLACE_PRODUCTION_SERVICES_DRIFT.

## AS6_PLATFORM_V2_MARKETPLACE_GA_P35
- Diagnostic: ops/bin/as6-diagnose-marketplace-ga-p35
- Control: ops/bin/as6-control-marketplace-ga-p35
- GA: frontend/src/as6/plugins/AS6MarketplaceGA.js
- Freeze manifest: ops/governance/as6-marketplace-ga-freeze-manifest-p35.md
- Added failure class: AS6_MARKETPLACE_GA_DRIFT.

## AS6_BUSINESS_WORKSPACE_FOUNDATION_B1
- Diagnostic: ops/bin/as6-diagnose-business-workspace-foundation-b1
- Control: ops/bin/as6-control-business-workspace-foundation-b1
- Runtime: frontend/src/as6/business-workspace/AS6BusinessWorkspaceRuntime.js
- API: frontend/src/as6/business-workspace/AS6BusinessWorkspaceAPI.js
- Added failure class: AS6_BUSINESS_WORKSPACE_FOUNDATION_DRIFT.

## AS6_BUSINESS_UNIVERSAL_NAVIGATION_B2
- Diagnostic: ops/bin/as6-diagnose-universal-navigation-b2
- Control: ops/bin/as6-control-universal-navigation-b2
- Runtime: frontend/src/as6/business-navigation/AS6BusinessNavigationRuntime.js
- API: frontend/src/as6/business-navigation/AS6BusinessNavigationAPI.js
- Added failure class: AS6_BUSINESS_UNIVERSAL_NAVIGATION_DRIFT.

## AS6_EPIC001_BUSINESS_HOME_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic001-business-home-foundation
- Control: ops/bin/as6-control-epic001-business-home-foundation
- AXS: frontend/src/as6/experience-system
- Business Home: frontend/src/as6/business-home
- Added failure class: AS6_AXS_FOUNDATION_DRIFT.

## AS6_EPIC001_BUSINESS_HOME_ROUTE_INTEGRATION
- Diagnostic: ops/bin/as6-diagnose-business-home-route-integration
- Control: ops/bin/as6-control-business-home-route-integration
- Route: /business-home
- File: frontend/src/App.jsx
- Added failure class: AS6_BUSINESS_HOME_ROUTE_GAP.

## AS6_EPIC001_BUSINESS_HOME_LIVE_DATA
- Diagnostic: ops/bin/as6-diagnose-business-home-live-data
- Control: ops/bin/as6-control-business-home-live-data
- Aggregator: frontend/src/as6/business-home/AS6BusinessHomeLiveData.js
- Added failure class: AS6_BUSINESS_HOME_STATIC_DATA_DRIFT.

## EPIC-007 PR4 — Workspace Personalization Diagnostics

- AS6_WORKSPACE_PROFILE_GAP.
- AS6_WORKSPACE_ROLE_BINDING_GAP.
- AS6_WORKSPACE_PREFERENCES_GAP.
- AS6_ROLE_BASED_WORKSPACE_GAP.
- AS6_PERSONALIZED_AI_CONTEXT_GAP.
- AS6_WORKSPACE_PERSONALIZATION_STORAGE_DRIFT.
- AS6_SINGLE_AI_WORKSPACE_INVARIANT_GAP.

## EPIC-007 PR5 — Module Integration Diagnostics

- AS6_WORKSPACE_MODULE_REGISTRY_GAP.
- AS6_WORKSPACE_MODULE_SLOT_BINDING_GAP.
- AS6_WORKSPACE_MODULE_ROUTE_COMPATIBILITY_GAP.
- AS6_WORKSPACE_MODULE_INTEGRATION_DRIFT.
- AS6_WORKSPACE_MODULE_STORAGE_DRIFT.

## EPIC-007 Complete Diagnostics

- AS6_EPIC007_WORKSPACE_COMPLETE_GAP.
- AS6_WORKSPACE_ERA_TRANSITION_GAP.
- AS6_EXECUTIVE_INTELLIGENCE_BASELINE_GAP.
- AS6_INTELLIGENCE_USES_PLATFORM_PRINCIPLE_GAP.
- AS6_WORKSPACE_COMPLETION_STORAGE_DRIFT.

## EPIC-008 PR1 — Context Intelligence Diagnostics

- AS6_CONTEXT_INTELLIGENCE_GAP.
- AS6_CONTEXT_INTELLIGENCE_WORKSPACE_BINDING_GAP.
- AS6_CONTEXT_INTELLIGENCE_MODULE_BINDING_GAP.
- AS6_CONTEXT_INTELLIGENCE_EXECUTION_BINDING_GAP.
- AS6_CONTEXT_INTELLIGENCE_STORAGE_DRIFT.

## EPIC-008 PR2 — Recommendation Engine Diagnostics

- AS6_RECOMMENDATION_ENGINE_GAP.
- AS6_RECOMMENDATION_CONTEXT_BINDING_GAP.
- AS6_RECOMMENDATION_GOVERNANCE_BINDING_GAP.
- AS6_RECOMMENDATION_EXECUTION_BINDING_GAP.
- AS6_RECOMMENDATION_EXPLAINABILITY_GAP.
- AS6_RECOMMENDATION_STORAGE_DRIFT.
- AS6_INTELLIGENCE_FRAGMENTATION_DRIFT.

## AS6_EPIC008_PR3_SCENARIO_PLANNER

- Diagnostic: ops/bin/as6-diagnose-scenario-planner-pr3
- Control: ops/bin/as6-control-scenario-planner-pr3
- Runtime artifacts: runtime/as6-epic008-pr3-scenario-planner/20260702T105445Z
- Failure class: AS6_SCENARIO_PLANNER_MISSING
- Root cause: Executive Intelligence needed planning layer after Recommendation Engine.
- Storage drift control: no localStorage, no sessionStorage, no indexedDB.

## AS6_EPIC008_PR4_PREDICTIVE_EXECUTION

- Diagnostic: ops/bin/as6-diagnose-epic-scope-drift-pr4
- Diagnostic: ops/bin/as6-diagnose-predictive-execution-pr4
- Control: ops/bin/as6-control-predictive-execution-pr4
- Failure class: AS6_EPIC_SCOPE_DRIFT
- Failure class: AS6_PREDICTIVE_EXECUTION_MISSING
- Runtime artifacts: runtime/as6-epic008-pr4-predictive-execution/20260702T110054Z

## AS6_EPIC008_PR5_EXECUTIVE_AUDIT_TRAIL

- Diagnostic: ops/bin/as6-diagnose-executive-audit-trail-pr5
- Control: ops/bin/as6-control-executive-audit-trail-pr5
- Runtime artifacts: runtime/as6-epic008-pr5-executive-audit-trail/20260702T111021Z
- Failure class: AS6_EXECUTIVE_AUDIT_TRAIL_MISSING
- Failure class: AS6_REASON_TRACE_GAP
- Failure class: AS6_DECISION_HISTORY_GAP
- Failure class: AS6_PREDICTION_EXECUTION_LINK_GAP
- Failure class: AS6_DECISION_ID_TRACE_GAP
- Root cause: Predictive and execution decisions exist without explainable decision history.

## AS6_EPIC008_PR6_EXECUTIVE_FEEDBACK_LOOP

- Diagnostic: ops/bin/as6-diagnose-executive-feedback-loop-pr6
- Control: ops/bin/as6-control-executive-feedback-loop-pr6
- Runtime artifacts: runtime/as6-epic008-pr6-executive-feedback-loop/20260702T112643Z
- Failure class: AS6_EXECUTIVE_FEEDBACK_LOOP_MISSING
- Failure class: AS6_DECISION_OUTCOME_TRACE_GAP
- Failure class: AS6_RECOMMENDATION_FEEDBACK_BINDING_GAP
- Failure class: AS6_SCENARIO_FEEDBACK_BINDING_GAP
- Failure class: AS6_PREDICTION_ACCURACY_GAP
- Root cause: Executive Audit Trail explains decisions, but AS6 does not yet convert outcomes into analytical feedback.

## AS6_EPIC008_PR7_EXECUTIVE_DECISION_QUALITY_SCORE

- Diagnostic: ops/bin/as6-diagnose-executive-decision-quality-score-pr7
- Control: ops/bin/as6-control-executive-decision-quality-score-pr7
- Runtime artifacts: runtime/as6-epic008-pr7-executive-decision-quality-score/20260702T113308Z
- Failure class: AS6_EXECUTIVE_DECISION_QUALITY_SCORE_MISSING
- Failure class: AS6_DECISION_QUALITY_MODEL_GAP
- Failure class: AS6_FEEDBACK_QUALITY_BINDING_GAP
- Failure class: AS6_DECISION_SCORE_TRACE_GAP
- Failure class: AS6_QUALITY_SCORE_EXPLAINABILITY_GAP
- Root cause: Executive Feedback Loop exists, but AS6 does not yet compute explainable decision quality score.

## AS6_EPIC008_PR8_EXECUTIVE_INTELLIGENCE_DASHBOARD

- Diagnostic: ops/bin/as6-diagnose-executive-intelligence-dashboard-pr8
- Control: ops/bin/as6-control-executive-intelligence-dashboard-pr8
- Runtime artifacts: runtime/as6-epic008-pr8-executive-intelligence-dashboard/20260702T114312Z
- Failure class: AS6_EXECUTIVE_INTELLIGENCE_DASHBOARD_MISSING
- Failure class: AS6_EXECUTIVE_MODULE_AGGREGATION_GAP
- Failure class: AS6_DECISION_ID_DASHBOARD_TRACE_GAP
- Failure class: AS6_EXECUTIVE_DASHBOARD_NO_STORAGE_DRIFT
- Failure class: AS6_EXECUTIVE_DASHBOARD_MUTATION_RISK
- Root cause: Executive Intelligence modules exist without unified visualization dashboard.

## AS6_EPIC008_EXECUTIVE_INTELLIGENCE_HARDENING

- Diagnostic: ops/bin/as6-diagnose-executive-intelligence-hardening
- Control: ops/bin/as6-control-executive-intelligence-hardening
- Runtime artifacts: runtime/as6-epic008-executive-intelligence-hardening/20260702T115713Z
- Failure class: AS6_EXECUTIVE_INTELLIGENCE_REGRESSION_RISK
- Failure class: AS6_DECISION_ID_CHAIN_CONSISTENCY_GAP
- Failure class: AS6_EXECUTIVE_DASHBOARD_RUNTIME_TRACE_GAP
- Failure class: AS6_EXECUTIVE_MODULE_CONTRACT_DRIFT
- Failure class: AS6_EXECUTIVE_GOVERNANCE_COVERAGE_GAP
- AEC: ops/governance/as6-executive-intelligence-hardening-aec.md
- Root cause: ops/governance/as6-executive-intelligence-hardening-root-cause.md

## AS6_EPIC008_PRODUCTION_READINESS_REVIEW

- Review report: docs/reviews/as6-epic008-production-readiness-review.md
- Baseline manifest: docs/baselines/as6-baseline-executive-intelligence-v1.md
- Compatibility matrix: docs/baselines/as6-baseline-executive-intelligence-v1-compatibility-matrix.md
- Immutability rule: ops/governance/as6-baseline-immutability-rule-executive-intelligence-v1.md
- Runtime artifacts: runtime/as6-epic008-production-readiness-review/20260702T121307Z

## AS6_PRR_TOOLING_FIND_OPTION_ORDER_MAINTENANCE

- Diagnostic: ops/bin/as6-diagnose-prr-tooling-find-option-order
- Control: ops/bin/as6-control-prr-tooling-find-option-order
- Governance rule: ops/governance/as6-tooling-maintenance-rule.md
- Root cause: ops/governance/as6-prr-tooling-find-option-order-root-cause.md
- AEC: ops/governance/as6-prr-tooling-find-option-order-aec.md
- Runtime artifacts: runtime/as6-prr-tooling-find-option-order-maintenance/20260702T123035Z
- Failure class: AS6_PRR_TOOLING_FIND_OPTION_ORDER_WARNING
- Change class: MAINTENANCE
- Scope: TOOLING
- Baseline impact: NONE
- Compatibility: UNCHANGED

## AS6_ENGINEERING_META_ARCHITECTURE_CANON

- Diagnostic: ops/bin/as6-diagnose-engineering-meta-architecture
- Control: ops/bin/as6-control-engineering-meta-architecture
- Governance Map: docs/standards/as6-project-governance-map.md
- Meta-Architecture: docs/standards/as6-engineering-meta-architecture.md
- ADR: docs/adr/as6-adr-engineering-meta-architecture-canon.md
- Root cause: ops/governance/as6-engineering-meta-architecture-root-cause.md
- AEC: ops/governance/as6-engineering-meta-architecture-aec.md
- Runtime artifacts: runtime/as6-engineering-meta-architecture-canon/20260702T133426Z
- Failure class: AS6_ENGINEERING_META_ARCHITECTURE_MISSING
- Failure class: AS6_NORMATIVE_SYSTEM_STRUCTURE_GAP
- Failure class: AS6_AUTHORITY_TRACEABILITY_OVERLAP
- Failure class: AS6_META_ARCHITECTURE_SUPERSTANDARD_RISK
- Failure class: AS6_META_ARCHITECTURE_MINIMALITY_GAP

## AS6_REFERENCE_META_MODEL_CANON

- Diagnostic: ops/bin/as6-diagnose-reference-meta-model
- Control: ops/bin/as6-control-reference-meta-model
- Reference Meta-Model: docs/standards/as6-reference-meta-model.md
- Engineering Meta-Architecture alignment: docs/standards/as6-engineering-meta-architecture.md
- ADR: docs/adr/as6-adr-reference-meta-model-canon.md
- Root cause: ops/governance/as6-reference-meta-model-root-cause.md
- AEC: ops/governance/as6-reference-meta-model-aec.md
- Runtime artifacts: runtime/as6-reference-meta-model-canon/20260702T135858Z
- Failure class: AS6_REFERENCE_META_MODEL_MISSING
- Failure class: AS6_DESCRIPTIVE_VOCABULARY_GAP
- Failure class: AS6_SEMANTIC_RELATION_GAP
- Failure class: AS6_SYNTAX_DEPENDENCY_RISK
- Failure class: AS6_META_MODEL_SUPERSTANDARD_RISK
- Failure class: AS6_EXPRESSIVENESS_STABILITY_GAP

## NEXT_MAJOR_EPIC_SELECTION

- Diagnostic: ops/bin/as6-diagnose-next-major-epic-selection
- Control: ops/bin/as6-control-next-major-epic-selection
- Portfolio Decision Record: docs/planning/as6-next-major-epic-selection-pdr.md
- EPIC Charter: docs/planning/as6-epic009-operating-system-unification-charter.md
- ADR: docs/adr/as6-adr-epic009-operating-system-unification.md
- Architecture Review: docs/planning/as6-epic009-architecture-review.md
- Diagnostics Plan: docs/planning/as6-epic009-diagnostics-plan.md
- Validation Plan: docs/planning/as6-epic009-validation-plan.md
- Definition of Done: docs/planning/as6-epic009-definition-of-done.md
- Rollback Strategy: docs/planning/as6-epic009-rollback-strategy.md
- Baseline Compatibility: docs/planning/as6-epic009-baseline-compatibility-review.md
- Runtime artifacts: runtime/as6-next-major-epic-selection/20260702T141519Z
- Failure classes: portfolio decision missing, selection gap, charter missing, ADR missing, scope gap, diagnostics gap, validation gap, DoD gap, rollback gap, baseline compatibility gap, authorization missing.

## AS6_EPIC009_DIAGNOSTICS

- Diagnostic: ops/bin/as6-diagnose-epic009-diagnostics
- Control: ops/bin/as6-control-epic009-diagnostics
- Diagnostics report: docs/epic009/as6-epic009-diagnostics-report.md
- Root cause: ops/governance/as6-epic009-diagnostics-root-cause.md
- AEC: ops/governance/as6-epic009-diagnostics-aec.md
- Runtime artifacts: runtime/as6-epic009-diagnostics/20260702T142726Z
- Failure classes: diagnostic baseline missing, workspace hosting model unknown, OS navigation structure unknown, design system compatibility unknown, component reuse baseline unknown, CRM migration path unknown, executive baseline mutation risk, reference meta-model mutation risk.

## AS6_EPIC009_ARCHITECTURE_REVIEW

- Diagnostic: ops/bin/as6-diagnose-epic009-architecture-review
- Control: ops/bin/as6-control-epic009-architecture-review
- Architecture Review: docs/epic009/as6-epic009-architecture-review.md
- ADR: docs/adr/as6-adr-epic009-operating-system-architecture.md
- Compatibility Contracts: docs/epic009/as6-epic009-compatibility-contracts.md
- Solution Design Input: docs/epic009/as6-epic009-solution-design-input.md
- Runtime artifacts: runtime/as6-epic009-architecture-review/20260702T145434Z

## AS6_EPIC009_SOLUTION_DESIGN

- Diagnostic: ops/bin/as6-diagnose-epic009-solution-design
- Control: ops/bin/as6-control-epic009-solution-design
- Solution Design Package: docs/epic009/as6-epic009-solution-design-package.md
- Operating System Specification: docs/epic009/as6-operating-system-specification.md
- Capability Map: docs/epic009/as6-operating-system-capability-map.md
- Workspace Architecture: docs/epic009/as6-workspace-architecture.md
- Platform Contracts: docs/epic009/as6-platform-contracts.md
- Operating Experience: docs/epic009/as6-operating-experience-specification.md
- Runtime Observability: docs/epic009/as6-runtime-observability-model.md
- Compatibility Migration: docs/epic009/as6-compatibility-migration-package.md
- Implementation Blueprint: docs/epic009/as6-epic009-implementation-blueprint.md
- Runtime artifacts: runtime/as6-epic009-solution-design/20260702T151931Z

## AS6_EPIC009_IMPLEMENTATION_PLAN

- Diagnostic: ops/bin/as6-diagnose-epic009-implementation-plan
- Control: ops/bin/as6-control-epic009-implementation-plan
- Implementation Plan Package: docs/epic009/as6-epic009-implementation-plan-package.md
- Master Implementation Plan: docs/epic009/as6-epic009-master-implementation-plan.md
- Slice Roadmap: docs/epic009/as6-epic009-slice-roadmap.md
- Dependency Matrix: docs/epic009/as6-epic009-dependency-matrix.md
- Capability Slice Matrix: docs/epic009/as6-epic009-capability-slice-matrix.md
- ADR Slice Matrix: docs/epic009/as6-epic009-adr-slice-matrix.md
- Validation Matrix: docs/epic009/as6-epic009-validation-matrix.md
- Runtime Evidence Matrix: docs/epic009/as6-epic009-runtime-evidence-matrix.md
- Definition of Done Matrix: docs/epic009/as6-epic009-definition-of-done-matrix.md
- Runtime artifacts: runtime/as6-epic009-implementation-plan/20260702T153538Z

## AS6 Git Ignore Conflict Prevention
- FAILURE_CLASS=AS6_GIT_IGNORE_CONFLICT
- ROOT_CAUSE=release automation attempted to stage ignored runtime evidence.
- PREVENTIVE_CONTROL=exclude runtime from normal git add or use git add -f only by explicit policy.
- STAGE=AS6_EPIC009_SLICE01_OS_FOUNDATION

## AS6 EPIC009 Slice 05 Diagnostic Registry
- STAGE=AS6_EPIC009_SLICE05_PLATFORM_SERVICES
- DIAGNOSTIC=ops/bin/as6-diagnose-epic009-slice05-platform-services
- CONTROL=ops/bin/as6-control-epic009-slice05-platform-services
- RUNTIME_TRACER=traceAS6PlatformService
- FAILURE_CLASS=AS6_PLATFORM_SERVICE_DEFINITION_INVALID
- FAILURE_CLASS=AS6_PLATFORM_SERVICE_NOT_FOUND

## AS6 EPIC009 Slice 06 Diagnostic Registry
- STAGE=AS6_EPIC009_SLICE06_OPERATING_EXPERIENCE
- DIAGNOSTIC=ops/bin/as6-diagnose-epic009-slice06-operating-experience
- CONTROL=ops/bin/as6-control-epic009-slice06-operating-experience
- RUNTIME_TRACER=traceAS6OperatingExperience
- HEALTH_SNAPSHOT=getAS6RuntimeHealthSnapshot
- FAILURE_CLASS=AS6_OPERATING_BOOTSTRAP_INVALID
- FAILURE_CLASS=AS6_OPERATING_SESSION_DRIFT

## AS6 EPIC009 PRR Diagnostic Registry
- STAGE=AS6_EPIC009_PRODUCTION_READINESS_REVIEW
- DIAGNOSTIC=ops/bin/as6-diagnose-epic009-production-readiness-review
- CONTROL=ops/bin/as6-control-epic009-production-readiness-review
- FAILURE_CLASS=AS6_PRR_BASELINE_SIDE_EFFECT_FORBIDDEN
- FAILURE_CLASS=AS6_PRR_READINESS_GATE_FAILED

## AS6 EPIC009 Baseline Diagnostic Registry
- STAGE=AS6_EPIC009_BASELINE_OPERATING_SYSTEM_V1
- BASELINE=AS6_OPERATING_SYSTEM_V1
- SOURCE_PRR=AS6_EPIC009_PRODUCTION_READINESS_REVIEW
- FAILURE_CLASS=AS6_BASELINE_WITHOUT_APPROVED_PRR
- FAILURE_CLASS=AS6_BASELINE_IMPLEMENTATION_MUTATION_FORBIDDEN

## AS6 Next Major EPIC Selection Diagnostic Registry
- STAGE=NEXT_MAJOR_EPIC_SELECTION
- SELECTED_EPIC=AS6_EPIC010_WORKSPACE_EXPERIENCE
- FAILURE_CLASS=AS6_EPIC_SELECTION_WITH_IMPLEMENTATION_AUTHORIZATION
- FAILURE_CLASS=AS6_EPIC_SELECTION_WITHOUT_OWNING_BASELINE
- FAILURE_CLASS=AS6_EPIC_SELECTION_WITHOUT_AFFECTED_COMPONENTS

## AS6 EPIC010 Workspace Experience Planning Diagnostic Registry
- STAGE=AS6_EPIC010_WORKSPACE_EXPERIENCE_PLANNING
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-workspace-experience-planning
- CONTROL=ops/bin/as6-control-epic010-workspace-experience-planning
- FAILURE_CLASS=AS6_CONTROL_SCOPE_FALSE_POSITIVE

## AS6 EPIC010 Slice 01 Diagnostic Registry
- STAGE=AS6_EPIC010_SLICE01_WORKSPACE_EXPERIENCE_FOUNDATION
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-slice01-workspace-experience-foundation
- CONTROL=ops/bin/as6-control-epic010-slice01-workspace-experience-foundation
- RUNTIME_TRACER=traceAS6WorkspaceExperience
- HEALTH_SNAPSHOT=getAS6WorkspaceHealthSnapshot
- FAILURE_CLASS=AS6_WORKSPACE_CONTEXT_MISSING
- FAILURE_CLASS=AS6_WORKSPACE_SERVICE_BINDING_MISSING
- FAILURE_CLASS=AS6_WORKSPACE_BASELINE_MUTATION_FORBIDDEN

## AS6 EPIC010 Slice 02 Diagnostic Registry
- STAGE=AS6_EPIC010_SLICE02_WORKSPACE_LAYOUT
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-slice02-workspace-layout
- CONTROL=ops/bin/as6-control-epic010-slice02-workspace-layout
- RUNTIME_TRACER=traceAS6WorkspaceLayout
- HEALTH_SNAPSHOT=getAS6WorkspaceLayoutHealthSnapshot
- FAILURE_CLASS=AS6_LAYOUT_CONTRACT_MISSING
- FAILURE_CLASS=AS6_LAYOUT_REGISTRY_DRIFT
- FAILURE_CLASS=AS6_LAYOUT_CONTROLLER_STATE_DUPLICATION

## AS6 EPIC010 Slice 03 Diagnostic Registry
- STAGE=AS6_EPIC010_SLICE03_WORKSPACE_NAVIGATION
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-slice03-workspace-navigation
- CONTROL=ops/bin/as6-control-epic010-slice03-workspace-navigation
- RUNTIME_TRACER=traceAS6WorkspaceNavigation
- HEALTH_SNAPSHOT=getAS6WorkspaceNavigationHealthSnapshot
- FAILURE_CLASS=AS6_NAVIGATION_CONTRACT_MISSING
- FAILURE_CLASS=AS6_NAVIGATION_RESOLVER_DRIFT
- FAILURE_CLASS=AS6_NAVIGATION_ITEM_NOT_FOUND

## AS6_EPIC010_SLICE04_WORKSPACE_PANELS
- Diagnostic: ops/bin/as6-diagnose-epic010-slice04-workspace-panels
- Control: ops/bin/as6-control-epic010-slice04-workspace-panels
- Failure Class: AS6_WORKSPACE_PANELS_MISSING
- Failure Class: AS6_PANEL_CONTRACT_MISSING
- Failure Class: AS6_PANEL_RESOLVER_DRIFT
- Failure Class: AS6_PANEL_SLOT_COLLISION

## AS6 EPIC010 Slice 05 Diagnostic Registry
- STAGE=AS6_EPIC010_SLICE05_COMMAND_PALETTE
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-slice05-command-palette
- CONTROL=ops/bin/as6-control-epic010-slice05-command-palette
- RUNTIME_TRACER=traceAS6CommandPalette
- HEALTH_SNAPSHOT=getAS6CommandPaletteHealthSnapshot
- FAILURE_CLASS=AS6_COMMAND_CONTRACT_MISSING
- FAILURE_CLASS=AS6_COMMAND_RESOLVER_DRIFT
- FAILURE_CLASS=AS6_COMMAND_NOT_FOUND

## AS6 EPIC010 Slice 06 Diagnostic Registry
- STAGE=AS6_EPIC010_SLICE06_WORKSPACE_ASSISTANT_SURFACE
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-slice06-workspace-assistant-surface
- CONTROL=ops/bin/as6-control-epic010-slice06-workspace-assistant-surface
- RUNTIME_TRACER=traceAS6WorkspaceAssistant
- HEALTH_SNAPSHOT=getAS6WorkspaceAssistantHealthSnapshot
- FAILURE_CLASS=AS6_ASSISTANT_CONTRACT_MISSING
- FAILURE_CLASS=AS6_ASSISTANT_CONTEXT_DRIFT
- FAILURE_CLASS=AS6_ASSISTANT_SURFACE_RESOLUTION_FAILURE

## AS6_EPIC010_SLICE07_WORKSPACE_INTEGRATION
- Diagnostic: ops/bin/as6-diagnose-epic010-slice07-workspace-integration
- Control: ops/bin/as6-control-epic010-slice07-workspace-integration
- Failure Class: AS6_WORKSPACE_INTEGRATION_MISSING
- Failure Class: AS6_INTEGRATION_CONTRACT_MISSING
- Failure Class: AS6_INTEGRATION_HEALTH_GAP

## AS6 EPIC010 PRR Diagnostic Registry
- STAGE=AS6_EPIC010_PRODUCTION_READINESS_REVIEW
- DIAGNOSTIC=ops/bin/as6-diagnose-epic010-production-readiness-review
- CONTROL=ops/bin/as6-control-epic010-production-readiness-review
- FAILURE_CLASS=AS6_PRR_BASELINE_SIDE_EFFECT_FORBIDDEN
- FAILURE_CLASS=AS6_WORKSPACE_PRR_READINESS_GATE_FAILED
- FAILURE_CLASS=AS6_BASELINE_COMMIT_MISMATCH

- FAILURE_CLASS=AS6_DIAGNOSTIC_CONTRACT_DRIFT

## AS6 EPIC010 Workspace Experience V1 Baseline Diagnostic Registry
- STAGE=AS6_EPIC010_BASELINE_WORKSPACE_EXPERIENCE_V1
- BASELINE=AS6_WORKSPACE_EXPERIENCE_V1
- PRR_APPROVED_COMMIT=e235e69dc881259e1eede8db16461cd46a385020
- BASELINE_MUST_MATCH_PRR_COMMIT=TRUE
- FAILURE_CLASS=AS6_BASELINE_WITHOUT_PRR_APPROVAL
- FAILURE_CLASS=AS6_BASELINE_COMMIT_MISMATCH

## AS6 Next Major EPIC Selection After EPIC010 Diagnostic Registry
- STAGE=NEXT_MAJOR_EPIC_SELECTION
- DIAGNOSTIC=ops/bin/as6-diagnose-next-major-epic-selection-after-epic010
- CONTROL=ops/bin/as6-control-next-major-epic-selection-after-epic010
- FAILURE_CLASS=AS6_EPIC_SELECTION_WITHOUT_BASELINE
- FAILURE_CLASS=AS6_IMPLEMENTATION_STARTED_BEFORE_PLANNING

## AS6 EPIC011 Application Foundation Planning Diagnostic Registry
- STAGE=AS6_EPIC011_APPLICATION_FOUNDATION_PLANNING
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-application-foundation-planning
- CONTROL=ops/bin/as6-control-epic011-application-foundation-planning
- FAILURE_CLASS=AS6_APPLICATION_PLANNING_INCOMPLETE
- FAILURE_CLASS=AS6_APPLICATION_BASELINE_COMPATIBILITY_MISSING
- FAILURE_CLASS=AS6_APPLICATION_IMPLEMENTATION_WITHOUT_AUTHORIZATION

## AS6 EPIC011 Slice 01 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE01_APPLICATION_FOUNDATION
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice01-application-foundation
- CONTROL=ops/bin/as6-control-epic011-slice01-application-foundation
- RUNTIME_TRACER=traceAS6Application
- HEALTH_SNAPSHOT=getAS6ApplicationHealthSnapshot
- FAILURE_CLASS=AS6_APPLICATION_CONTRACT_MISSING
- FAILURE_CLASS=AS6_APPLICATION_CONTEXT_DRIFT
- FAILURE_CLASS=AS6_APPLICATION_REGISTRY_COLLISION

## AS6 EPIC011 Slice 02 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE02_APPLICATION_HOST
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice02-application-host
- CONTROL=ops/bin/as6-control-epic011-slice02-application-host
- RUNTIME_TRACER=traceAS6ApplicationHost
- HEALTH_SNAPSHOT=getAS6ApplicationHostHealthSnapshot
- FAILURE_CLASS=AS6_APPLICATION_DESCRIPTOR_INVALID
- FAILURE_CLASS=AS6_APPLICATION_CAPABILITY_CONFLICT
- FAILURE_CLASS=AS6_APPLICATION_DEPENDENCY_CYCLE
- FAILURE_CLASS=AS6_APPLICATION_RUNTIME_MANIFEST_INVALID
- FAILURE_CLASS=AS6_APPLICATION_CAPABILITY_RESOLUTION_FAILURE

## AS6 EPIC011 Slice 03 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE03_APPLICATION_SHELL
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice03-application-shell
- CONTROL=ops/bin/as6-control-epic011-slice03-application-shell
- RUNTIME_TRACER=traceAS6ApplicationShell
- HEALTH_SNAPSHOT=getAS6ApplicationShellHealthSnapshot
- FAILURE_CLASS=AS6_APPLICATION_MOUNT_CONFLICT
- FAILURE_CLASS=AS6_APPLICATION_SLOT_CONTRACT_VIOLATION
- FAILURE_CLASS=AS6_APPLICATION_COMPOSITION_DRIFT
- FAILURE_CLASS=AS6_APPLICATION_REGION_RESOLUTION_FAILURE
- FAILURE_CLASS=AS6_APPLICATION_REGION_CAPABILITY_MISMATCH

## AS6 EPIC011 Slice 04 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE04_APPLICATION_RUNTIME_SERVICES
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice04-runtime-services
- CONTROL=ops/bin/as6-control-epic011-slice04-runtime-services
- RUNTIME_TRACER=traceAS6RuntimeServices
- HEALTH_SNAPSHOT=getAS6RuntimeServicesHealthSnapshot
- FAILURE_CLASS=AS6_RUNTIME_SERVICE_CONTRACT_MISMATCH
- FAILURE_CLASS=AS6_RUNTIME_DEPENDENCY_RESOLUTION_FAILURE
- FAILURE_CLASS=AS6_RUNTIME_EVENT_ROUTING_FAILURE
- FAILURE_CLASS=AS6_RUNTIME_SERVICE_CAPABILITY_CONFLICT
- FAILURE_CLASS=AS6_RUNTIME_CONTEXT_BRIDGE_FAILURE

## AS6 EPIC011 Slice 05 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE05_APPLICATION_EXTENSION_POINTS
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice05-extension-points
- CONTROL=ops/bin/as6-control-epic011-slice05-extension-points
- RUNTIME_TRACER=traceAS6Extension
- HEALTH_SNAPSHOT=getAS6ExtensionHealthSnapshot
- FAILURE_CLASS=AS6_EXTENSION_POINT_CONTRACT_MISMATCH
- FAILURE_CLASS=AS6_EXTENSION_CAPABILITY_CONFLICT
- FAILURE_CLASS=AS6_EXTENSION_RESOLUTION_FAILURE
- FAILURE_CLASS=AS6_EXTENSION_POLICY_VIOLATION
- FAILURE_CLASS=AS6_EXTENSION_VERSION_INCOMPATIBILITY
- FAILURE_CLASS=AS6_EXTENSION_LIFECYCLE_CONFLICT

## AS6 EPIC011 Slice 06 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE06_APPLICATION_SERVICES
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice06-application-services
- CONTROL=ops/bin/as6-control-epic011-slice06-application-services
- RUNTIME_TRACER=traceAS6ApplicationService
- HEALTH_SNAPSHOT=getAS6ApplicationServiceHealthSnapshot
- FAILURE_CLASS=AS6_SERVICE_CONTRACT_MISMATCH
- FAILURE_CLASS=AS6_SERVICE_DEPENDENCY_CYCLE
- FAILURE_CLASS=AS6_SERVICE_CAPABILITY_CONFLICT
- FAILURE_CLASS=AS6_SERVICE_CONTEXT_RESOLUTION_FAILURE
- FAILURE_CLASS=AS6_SERVICE_INITIALIZATION_ORDER_FAILURE
- FAILURE_CLASS=AS6_SERVICE_SHUTDOWN_ORDER_FAILURE
- FAILURE_CLASS=AS6_SERVICE_REGISTRATION_DUPLICATE

## AS6 EPIC011 Slice 07 Diagnostic Registry
- STAGE=AS6_EPIC011_SLICE07_APPLICATION_INTEGRATION
- DIAGNOSTIC=ops/bin/as6-diagnose-epic011-slice07-application-integration
- CONTROL=ops/bin/as6-control-epic011-slice07-application-integration
- RUNTIME_TRACER=traceAS6ApplicationIntegration
- HEALTH_SNAPSHOT=getAS6ApplicationIntegrationHealthSnapshot
- FAILURE_CLASS=AS6_APPLICATION_INTEGRATION_CONTRACT_MISMATCH
- FAILURE_CLASS=AS6_APPLICATION_BOOTSTRAP_SEQUENCE_FAILURE
- FAILURE_CLASS=AS6_APPLICATION_RUNTIME_MANIFEST_INCONSISTENT
- FAILURE_CLASS=AS6_INTEGRATION_COORDINATOR_POLICY_VIOLATION
- FAILURE_CLASS=AS6_RUNTIME_MANIFEST_DRIFT
- FAILURE_CLASS=AS6_SUBSYSTEM_BOOTSTRAP_ORDER_DRIFT
- FAILURE_CLASS=AS6_SUBSYSTEM_REGISTRY_DRIFT
- FAILURE_CLASS=AS6_UNIFIED_HEALTH_INCOMPLETE
- FAILURE_CLASS=AS6_INTEGRATION_DEPENDENCY_CYCLE

## AS6 Next Major EPIC Selection After EPIC011
- STAGE=NEXT_MAJOR_EPIC_SELECTION
- SELECTED_EPIC=AS6_EPIC012_CRM_FOUNDATION
- EPIC_TYPE=APPLICATION
- DIAGNOSTIC=ops/bin/as6-diagnose-next-major-epic-selection-after-epic011
- CONTROL=ops/bin/as6-control-next-major-epic-selection-after-epic011
- FAILURE_CLASS=AS6_APPLICATION_EPIC_PLATFORM_MUTATION_ATTEMPT
- FAILURE_CLASS=AS6_EPIC_TYPE_MISSING
- FAILURE_CLASS=AS6_PORTFOLIO_DECISION_MISSING

## AS6 EPIC012 CRM Foundation Planning
- STAGE=AS6_EPIC012_CRM_FOUNDATION_PLANNING
- EPIC_TYPE=APPLICATION
- DIAGNOSTIC=ops/bin/as6-diagnose-epic012-crm-foundation-planning
- CONTROL=ops/bin/as6-control-epic012-crm-foundation-planning
- FAILURE_CLASS=AS6_CRM_FOUNDATION_PLANNING_GAP
- FAILURE_CLASS=AS6_APPLICATION_EPIC_PLATFORM_MUTATION_ATTEMPT
- FAILURE_CLASS=AS6_CRM_BASELINE_COMPATIBILITY_GAP

## AS6 EPIC012 Slice 01 CRM Foundation
- STAGE=AS6_EPIC012_SLICE01_CRM_FOUNDATION
- DIAGNOSTIC=ops/bin/as6-diagnose-epic012-slice01-crm-foundation
- CONTROL=ops/bin/as6-control-epic012-slice01-crm-foundation
- RUNTIME_TRACER=traceAS6Crm
- HEALTH_SNAPSHOT=getAS6CrmHealthSnapshot
- FAILURE_CLASS=AS6_CRM_CONTRACT_MISSING
- FAILURE_CLASS=AS6_CRM_ENTITY_MODEL_DRIFT
- FAILURE_CLASS=AS6_CRM_CAPABILITY_CONFLICT
- FAILURE_CLASS=AS6_APPLICATION_DESCRIPTOR_VERSION_DRIFT
- FAILURE_CLASS=AS6_APPLICATION_MANIFEST_INCOMPLETE
- FAILURE_CLASS=AS6_PUBLIC_API_SURFACE_DRIFT
- FAILURE_CLASS=AS6_HEALTH_CONTRACT_INCOMPLETE

## AS6 Guardian External Infrastructure Failure Repair
- FAILURE_CLASS=AS6_GUARDIAN_EXTERNAL_INFRASTRUCTURE_FAILURE
- ROOT_CAUSE=Guardian treated transient external Docker Registry failure as project failure.
- DIAGNOSTIC=ops/bin/as6-diagnose-guardian-external-infra-repair
- CONTROL=ops/bin/as6-control-guardian-external-infra-repair
- PREVENTION=classify external registry failures and allow recovered same-run retry result.

## AS6 EPIC012 Slice 02 CRM Entity Runtime
- STAGE=AS6_EPIC012_SLICE02_CRM_ENTITY_RUNTIME
- DIAGNOSTIC=ops/bin/as6-diagnose-epic012-slice02-crm-entity-runtime
- CONTROL=ops/bin/as6-control-epic012-slice02-crm-entity-runtime
- RUNTIME_TRACER=traceAS6CrmEntity
- HEALTH_SNAPSHOT=getAS6CrmEntityHealthSnapshot
- FAILURE_CLASS=AS6_CRM_ENTITY_CONTRACT_MISSING
- FAILURE_CLASS=AS6_CRM_ENTITY_FIELD_CONTRACT_MISSING
- FAILURE_CLASS=AS6_CRM_ENTITY_FIELD_RESOLUTION_FAILURE
- FAILURE_CLASS=AS6_CRM_ENTITY_RUNTIME_STORAGE_DRIFT

## AS6 EPIC012 Slice 03 CRM Domain Model
- STAGE=AS6_EPIC012_SLICE03_CRM_DOMAIN_MODEL
- DIAGNOSTIC=ops/bin/as6-diagnose-epic012-slice03-crm-domain-model
- CONTROL=ops/bin/as6-control-epic012-slice03-crm-domain-model
- RUNTIME_TRACER=traceAS6CrmDomain
- HEALTH_SNAPSHOT=getAS6CrmDomainHealthSnapshot
- FAILURE_CLASS=AS6_CRM_DOMAIN_CONTRACT_MISSING
- FAILURE_CLASS=AS6_CRM_RELATIONSHIP_CONFLICT
- FAILURE_CLASS=AS6_CRM_DOMAIN_DESCRIPTOR_INVALID
- FAILURE_CLASS=AS6_CRM_DOMAIN_MANIFEST_DRIFT
- FAILURE_CLASS=AS6_CRM_AGGREGATE_CONTRACT_MISSING
- FAILURE_CLASS=AS6_CRM_RELATIONSHIP_CONTRACT_MISSING

## AS6_EPIC012_SLICE04_CRM_CONTACTS_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-crm-contacts-foundation
- Control: ops/bin/as6-control-crm-contacts-foundation
- Added checks: 12 Contacts Foundation files, no storage, no API calls, no workflow, no platform mutation.
- Failure classes: DIAGNOSTIC_ORDER_DRIFT, CRM_CONTACTS_STORAGE_DRIFT, CRM_CONTACTS_API_DRIFT, CRM_CONTACTS_WORKFLOW_DRIFT, CRM_CONTACTS_PLATFORM_MUTATION_DRIFT.

## AS6_EPIC012_SLICE05_CRM_CONTACTS_UI_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-crm-contacts-ui-foundation
- Control: ops/bin/as6-control-crm-contacts-ui-foundation
- Added checks: UI shell, list, row/card, empty state, diagnostic panel, no storage, no API calls.
- Failure classes: CRM_CONTACTS_UI_STRUCTURE_DRIFT, CRM_CONTACTS_UI_STORAGE_DRIFT, CRM_CONTACTS_UI_API_DRIFT.

## AS6_EPIC012_SLICE06_CRM_CONTACTS_WORKSPACE_INTEGRATION
- Diagnostic: ops/bin/as6-diagnose-crm-contacts-workspace-integration
- Control: ops/bin/as6-control-crm-contacts-workspace-integration
- Added checks: workspace panel, navigation, state resolver, health snapshot, no storage, no API, no workflow.
- Failure classes: CRM_CONTACTS_WORKSPACE_PANEL_DRIFT, CRM_CONTACTS_WORKSPACE_NAVIGATION_DRIFT, CRM_CONTACTS_WORKSPACE_STATE_DRIFT, CRM_CONTACTS_WORKSPACE_DIAGNOSTIC_DRIFT.

## AS6_EPIC012_SLICE07_CRM_CONTACTS_CRM_LAYOUT_BRIDGE
- Diagnostic: ops/bin/as6-diagnose-crm-contacts-crm-layout-bridge
- Control: ops/bin/as6-control-crm-contacts-crm-layout-bridge
- Added checks: CRM layout bridge, existing workspace panel reuse, navigation reuse, breadcrumbs, active section, unified states, no isolated container, no storage, no API, no workflow.
- Failure classes: CRM_CONTACTS_LAYOUT_BRIDGE_DRIFT, CRM_CONTACTS_ISOLATED_CONTAINER_DRIFT, CRM_CONTACTS_BREADCRUMB_DRIFT, CRM_CONTACTS_ACTIVE_SECTION_DRIFT, CRM_CONTACTS_LAYOUT_STATE_DRIFT.

## AS6_EPIC012_SLICE08_CRM_CONTACTS_LIVE_LAYOUT_MOUNT
- Diagnostic: ops/bin/as6-diagnose-crm-contacts-live-layout-mount
- Control: ops/bin/as6-control-crm-contacts-live-layout-mount
- Added checks: live CRMPage mount, production CRM layout reuse, layout snapshot connection, Contacts UI mount, no storage, no API, no workflow.
- Failure classes: CRM_CONTACTS_LIVE_MOUNT_DRIFT, CRM_CONTACTS_PRODUCTION_LAYOUT_MOUNT_DRIFT, CRM_CONTACTS_PARALLEL_SHELL_DRIFT, CRM_CONTACTS_LIVE_SNAPSHOT_DRIFT.

## AS6_EPIC012_SLICE09_CRM_CONTACTS_PRODUCTION_POLISH
- Diagnostic: ops/bin/as6-diagnose-crm-contacts-production-polish
- Control: ops/bin/as6-control-crm-contacts-production-polish
- Added checks: accessibility labels, stable states, reduced motion support, production style scope, no runtime fetch, no runtime storage, no heavy dependency, no storage, no API, no workflow.
- Failure classes: CRM_CONTACTS_ACCESSIBILITY_DRIFT, CRM_CONTACTS_PRODUCTION_STYLE_DRIFT, CRM_CONTACTS_STATE_RESILIENCE_DRIFT, CRM_CONTACTS_PERFORMANCE_BUDGET_DRIFT, CRM_CONTACTS_HEAVY_DEPENDENCY_DRIFT.

## AS6_EPIC012_SLICE10_CRM_CONTACTS_FINAL_VALIDATION
- Diagnostic: runtime/as6-epic012-slice10-crm-contacts-final-validation/final-validation-report.txt
- Control: all CRM Contacts diagnostics and controls from Slice 04 through Slice 09 passed.
- Added checks: live mount, production layout marker, accessibility labels, reduced motion, registry coverage, no forbidden runtime usage, no heavy dependency, frontend build.
- Failure classes covered: CRM_CONTACTS_FINAL_VALIDATION_DRIFT, CRM_CONTACTS_REGISTRY_COVERAGE_DRIFT, CRM_CONTACTS_LIVE_MOUNT_REGRESSION, CRM_CONTACTS_PRODUCTION_ACCESSIBILITY_REGRESSION.

## AS6_EPIC013_CRM_NEXT_MODULE_PLANNING
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-next-module-planning
- Control: ops/bin/as6-control-epic013-crm-next-module-planning
- Added checks: EPIC013 planning doc, selected next module, slice chain, invariants, EPIC012 production validation dependency.
- Failure classes: CRM_NEXT_MODULE_SELECTION_DRIFT, EPIC012_DEPENDENCY_EVIDENCE_DRIFT, CRM_MODULE_SEQUENCE_DRIFT.

## AS6_EPIC013_SLICE01_CRM_COMPANIES_DOMAIN_MODEL
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-domain-model
- Control: ops/bin/as6-control-epic013-crm-companies-domain-model
- Runtime tracer: frontend/src/crm/companies/domain/crmCompanyRuntimeTracer.js
- AEC rules: ops/aec/as6-epic013-crm-companies-domain-model-aec.md
- Added checks: identity, statuses, categories, lifecycle, declarative contact link, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_COMPANIES_DOMAIN_MODEL_GAP, CRM_COMPANIES_STORAGE_DRIFT, CRM_COMPANIES_API_DRIFT, CRM_COMPANIES_WORKFLOW_DRIFT, CRM_COMPANIES_CONTACT_LINK_COUPLING_DRIFT, CRM_COMPANIES_RUNTIME_TRACER_GAP.

## AS6_EPIC013_SLICE02_CRM_COMPANIES_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-foundation
- Control: ops/bin/as6-control-epic013-crm-companies-foundation
- Runtime tracer: frontend/src/crm/companies/foundation/crmCompanyFoundationTracer.js
- AEC rules: ops/aec/as6-epic013-crm-companies-foundation-aec.md
- Added checks: registry, manifest, capabilities, runtime, resolver, navigation, panels, diagnostics, health snapshot, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_COMPANIES_FOUNDATION_GAP, CRM_COMPANIES_REGISTRY_DRIFT, CRM_COMPANIES_MANIFEST_DRIFT, CRM_COMPANIES_RUNTIME_DRIFT, CRM_COMPANIES_RESOLVER_DRIFT, CRM_COMPANIES_NAVIGATION_DRIFT, CRM_COMPANIES_PANEL_DRIFT, CRM_COMPANIES_HEALTH_SNAPSHOT_DRIFT.

## AS6_EPIC013_SLICE03_CRM_COMPANIES_UI_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-ui-foundation
- Control: ops/bin/as6-control-epic013-crm-companies-ui-foundation
- Runtime tracer: frontend/src/crm/companies/ui/CompaniesUiRuntimeTracer.js
- AEC rules: ops/aec/as6-epic013-crm-companies-ui-foundation-aec.md
- Added checks: UI foundation, header, actions placeholder, list, card, empty/loading/ready/error states, diagnostics panel, UI tracer, UI health snapshot, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_COMPANIES_UI_COMPONENT_MISSING, CRM_COMPANIES_UI_STATE_DRIFT, CRM_COMPANIES_UI_HEALTH_DRIFT, CRM_COMPANIES_UI_RUNTIME_TRACER_GAP, CRM_COMPANIES_DESIGN_SYSTEM_DRIFT.

## AS6_EPIC013_SLICE04_CRM_COMPANIES_WORKSPACE_INTEGRATION
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-workspace-integration
- Control: ops/bin/as6-control-epic013-crm-companies-workspace-integration
- Runtime tracer: frontend/src/crm/companies/workspace/crmCompaniesWorkspaceTracer.js
- AEC rules: ops/aec/as6-epic013-crm-companies-workspace-integration-aec.md
- Added checks: workspace panel, workspace navigation, workspace state resolver, foundation snapshot, UI snapshot, workspace tracer, shared CRM workspace pattern, no parallel shell, no storage, no API, no workflow.
- Failure classes: CRM_COMPANIES_WORKSPACE_INTEGRATION_GAP, CRM_COMPANIES_WORKSPACE_PANEL_DRIFT, CRM_COMPANIES_WORKSPACE_NAVIGATION_DRIFT, CRM_COMPANIES_WORKSPACE_STATE_DRIFT, CRM_COMPANIES_PARALLEL_SHELL_DRIFT.

## AS6_EPIC013_SLICE05_CRM_COMPANIES_CRM_LAYOUT_BRIDGE
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-crm-layout-bridge
- Control: ops/bin/as6-control-epic013-crm-companies-crm-layout-bridge
- Runtime tracer: frontend/src/crm/companies/layout/crmCompaniesLayoutTracer.js
- Safe grep helper: ops/bin/as6-grep-safe
- AEC rules: ops/aec/as6-epic013-crm-companies-crm-layout-bridge-aec.md
- Added checks: CRM Layout Bridge, existing Workspace, Header, Sidebar, breadcrumbs, active section, unified states, no parallel layout/shell, no own router/store, health snapshot, no storage, no API, no workflow.
- Failure classes: CRM_COMPANIES_LAYOUT_BRIDGE_GAP, CRM_COMPANIES_LAYOUT_DRIFT, CRM_COMPANIES_BREADCRUMB_DRIFT, CRM_COMPANIES_ACTIVE_SECTION_DRIFT, CRM_COMPANIES_PARALLEL_LAYOUT_DRIFT, CRM_COMPANIES_OWN_ROUTER_DRIFT, CRM_COMPANIES_OWN_STORE_DRIFT.

## AS6_EPIC013_SLICE06_CRM_COMPANIES_LIVE_LAYOUT_MOUNT
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-live-layout-mount
- Control: ops/bin/as6-control-epic013-crm-companies-live-layout-mount
- Live mount: frontend/src/crm/companies/live/CrmCompaniesLiveLayoutMount.jsx
- CRMPage evidence: runtime/as6-epic013-slice06-crm-companies-live-layout-mount/CRMPage.diff.txt
- AEC rules: ops/aec/as6-epic013-crm-companies-live-layout-mount-aec.md
- Added checks: live CRMPage mount, production CRM layout reuse, layout snapshot connection, Companies UI mount, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_COMPANIES_LIVE_MOUNT_GAP, CRM_COMPANIES_LIVE_MOUNT_DRIFT, CRM_COMPANIES_PRODUCTION_LAYOUT_MOUNT_DRIFT, CRM_COMPANIES_PARALLEL_SHELL_DRIFT, CRM_COMPANIES_LIVE_SNAPSHOT_DRIFT.

## AS6_EPIC013_SLICE07_CRM_COMPANIES_PRODUCTION_POLISH
- Diagnostic: ops/bin/as6-diagnose-epic013-crm-companies-production-polish
- Control: ops/bin/as6-control-epic013-crm-companies-production-polish
- Production tracer: frontend/src/crm/companies/production/crmCompaniesProductionTracer.js
- AEC rules: ops/aec/as6-epic013-crm-companies-production-polish-aec.md
- Added checks: accessibility labels, production style scope, reduced motion, production health snapshot, no runtime fetch, no runtime storage, no heavy dependency, no storage, no API, no workflow.
- Failure classes: CRM_COMPANIES_PRODUCTION_POLISH_GAP, CRM_COMPANIES_ACCESSIBILITY_DRIFT, CRM_COMPANIES_PRODUCTION_STYLE_DRIFT, CRM_COMPANIES_STATE_RESILIENCE_DRIFT, CRM_COMPANIES_PERFORMANCE_BUDGET_DRIFT, CRM_COMPANIES_HEAVY_DEPENDENCY_DRIFT.

## AS6_EPIC013_SLICE08_CRM_COMPANIES_FINAL_VALIDATION
- Diagnostic: runtime/as6-epic013-slice08-crm-companies-final-validation/final-validation-report.txt
- Control: all EPIC013 Companies diagnostics and controls from Planning through Slice 07 passed.
- AEC rules: ops/aec/as6-epic013-crm-companies-final-validation-aec.md
- Added checks: full diagnostic chain, registry coverage, governance coverage, live mount, production polish, runtime tracer, health snapshot, no forbidden runtime usage, no heavy dependency, frontend build.
- Failure classes: CRM_COMPANIES_FINAL_VALIDATION_GAP, CRM_COMPANIES_FINAL_VALIDATION_DRIFT, CRM_COMPANIES_REGISTRY_COVERAGE_DRIFT, CRM_COMPANIES_LIVE_MOUNT_REGRESSION, CRM_COMPANIES_PRODUCTION_POLISH_REGRESSION.

## AS6_EPIC_COMPLETION_MARKER_GUARD
- Diagnostic: ops/bin/as6-diagnose-epic-completion-markers
- Control: ops/bin/as6-control-epic-completion-marker-guard
- AEC rules: ops/aec/as6-epic-completion-marker-guard-aec.md
- Added checks: AS6_DONE, production status flag, restore tag at HEAD, runtime evidence, project state evidence.
- Failure classes: EPIC_COMPLETION_MARKER_GAP, EPIC_RESTORE_TAG_GAP, EPIC_STATUS_FLAG_GAP, EPIC_RUNTIME_EVIDENCE_GAP, TRUNCATED_FINAL_LOG_GAP.

## AS6_EPIC014_CRM_NEXT_MODULE_SELECTION
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-next-module-selection
- Control: ops/bin/as6-control-epic014-crm-next-module-selection
- AEC rules: ops/aec/as6-epic014-crm-next-module-selection-aec.md
- Added checks: Deals / Opportunities selection, Contacts foundation reuse, Companies foundation reuse, existing CRM Workspace/Layout, as6-grep-safe, Epic Completion Marker Guard, no parallel shell/router/store.
- Failure classes: CRM_EPIC014_NEXT_MODULE_SELECTION_GAP, CRM_DEALS_SELECTION_DRIFT, CRM_DEALS_CONTACTS_REUSE_GAP, CRM_DEALS_COMPANIES_REUSE_GAP, CRM_DEALS_PARALLEL_SHELL_DRIFT.

## AS6_EPIC014_SLICE01_CRM_DEALS_DOMAIN_MODEL
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-domain-model
- Control: ops/bin/as6-control-epic014-crm-deals-domain-model
- Runtime tracer: frontend/src/crm/deals/domain/crmDealRuntimeTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-domain-model-aec.md
- Added checks: identity, status, pipeline, stage, lifecycle, company link, contact link, domain contract, descriptor, runtime tracer, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_DEALS_DOMAIN_MODEL_GAP, CRM_DEALS_IDENTITY_DRIFT, CRM_DEALS_STATUS_DRIFT, CRM_DEALS_PIPELINE_DRIFT, CRM_DEALS_STAGE_DRIFT, CRM_DEALS_LIFECYCLE_DRIFT, CRM_DEALS_LINKAGE_DRIFT.

## AS6_EPIC014_SLICE02_CRM_DEALS_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-foundation
- Control: ops/bin/as6-control-epic014-crm-deals-foundation
- Runtime tracer: frontend/src/crm/deals/foundation/crmDealFoundationTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-foundation-aec.md
- Added checks: registry, manifest, capabilities, runtime, resolver, navigation, panels, foundation descriptor, diagnostics, health snapshot, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_DEALS_FOUNDATION_GAP, CRM_DEALS_REGISTRY_DRIFT, CRM_DEALS_MANIFEST_DRIFT, CRM_DEALS_RUNTIME_DRIFT, CRM_DEALS_RESOLVER_DRIFT, CRM_DEALS_NAVIGATION_DRIFT, CRM_DEALS_PANEL_DRIFT, CRM_DEALS_HEALTH_SNAPSHOT_DRIFT.

## AS6_EPIC014_SLICE03_CRM_DEALS_UI_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-ui-foundation
- Control: ops/bin/as6-control-epic014-crm-deals-ui-foundation
- Runtime tracer: frontend/src/crm/deals/ui/DealsUiRuntimeTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-ui-foundation-aec.md
- Added checks: UI states, header, actions, list, card, empty/loading/error/ready states, diagnostics panel, UI health snapshot, design-system scope, no storage, no API, no workflow, no heavy dependency.
- Failure classes: CRM_DEALS_UI_FOUNDATION_GAP, CRM_DEALS_UI_STATE_DRIFT, CRM_DEALS_UI_COMPONENT_DRIFT, CRM_DEALS_UI_HEALTH_SNAPSHOT_DRIFT, CRM_DEALS_UI_DESIGN_SYSTEM_DRIFT.

## AS6_EPIC014_SLICE04_CRM_DEALS_WORKSPACE_INTEGRATION
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-workspace-integration
- Control: ops/bin/as6-control-epic014-crm-deals-workspace-integration
- Runtime tracer: frontend/src/crm/deals/workspace/crmDealsWorkspaceTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-workspace-integration-aec.md
- Added checks: workspace panel, workspace navigation, workspace state resolver, UI foundation connection, foundation/UI health snapshot, workspace runtime tracer, no storage, no API, no workflow, no own router/store.
- Failure classes: CRM_DEALS_WORKSPACE_INTEGRATION_GAP, CRM_DEALS_WORKSPACE_PANEL_DRIFT, CRM_DEALS_WORKSPACE_NAVIGATION_DRIFT, CRM_DEALS_WORKSPACE_STATE_DRIFT, CRM_DEALS_WORKSPACE_HEALTH_SNAPSHOT_DRIFT, CRM_DEALS_PARALLEL_SHELL_DRIFT.

## AS6_EPIC014_SLICE05_CRM_DEALS_CRM_LAYOUT_BRIDGE
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-crm-layout-bridge
- Control: ops/bin/as6-control-epic014-crm-deals-crm-layout-bridge
- Runtime tracer: frontend/src/crm/deals/layout/crmDealsLayoutTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-crm-layout-bridge-aec.md
- Added checks: CRM Layout Bridge, layout model, layout state, breadcrumbs, active section, existing Workspace/Header/Sidebar reuse, layout health snapshot, no storage, no API, no workflow, no own router/store.
- Failure classes: CRM_DEALS_CRM_LAYOUT_BRIDGE_GAP, CRM_DEALS_LAYOUT_MODEL_DRIFT, CRM_DEALS_LAYOUT_STATE_DRIFT, CRM_DEALS_BREADCRUMB_DRIFT, CRM_DEALS_ACTIVE_SECTION_DRIFT, CRM_DEALS_PARALLEL_LAYOUT_DRIFT.

## AS6_EPIC014_SLICE05_CRM_DEALS_CRM_LAYOUT_BRIDGE_REPAIR
- Diagnostic repair: ops/bin/as6-diagnose-epic014-crm-deals-crm-layout-bridge.
- Added failure class: CRM_DEALS_LAYOUT_BRIDGE_DIAGNOSTIC_MARKER_DRIFT.

## AS6_EPIC014_SLICE06_CRM_DEALS_LIVE_LAYOUT_MOUNT
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-live-layout-mount
- Control: ops/bin/as6-control-epic014-crm-deals-live-layout-mount
- Runtime tracer: frontend/src/crm/deals/live/crmDealsLiveLayoutMountTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-live-layout-mount-aec.md
- Added checks: live layout mount, CRMPage mount, production layout marker, live contract, no duplicate route, no duplicate panel, existing CRM Layout/Workspace reuse, no storage, no API, no workflow.
- Failure classes: CRM_DEALS_LIVE_LAYOUT_MOUNT_GAP, CRM_DEALS_LIVE_MOUNT_REGRESSION, CRM_DEALS_DUPLICATE_ROUTE_DRIFT, CRM_DEALS_DUPLICATE_PANEL_DRIFT, CRM_DEALS_LIVE_LAYOUT_MARKER_DRIFT.

## AS6_EPIC014_SLICE06_CRM_DEALS_LIVE_LAYOUT_MOUNT_REPAIR
- Diagnostic repair: CRMPage live mount import pattern drift.
- Added failure class: CRM_DEALS_LIVE_LAYOUT_MOUNT_IMPORT_PATTERN_DRIFT.

## AS6_EPIC014_SLICE07_CRM_DEALS_PRODUCTION_POLISH
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-production-polish
- Control: ops/bin/as6-control-epic014-crm-deals-production-polish
- Runtime tracer: frontend/src/crm/deals/production/crmDealsProductionTracer.js
- AEC rules: ops/aec/as6-epic014-crm-deals-production-polish-aec.md
- Added checks: production contract, production diagnostics, production health snapshot, visible focus, ARIA/accessibility contract, prefers-reduced-motion, no runtime fetch, no runtime storage, no heavy dependency, no own router/store.
- Failure classes: CRM_DEALS_PRODUCTION_POLISH_GAP, CRM_DEALS_ACCESSIBILITY_DRIFT, CRM_DEALS_MOTION_DRIFT, CRM_DEALS_PERFORMANCE_DRIFT, CRM_DEALS_PRODUCTION_CONTRACT_DRIFT.

## AS6_EPIC014_SLICE08_CRM_DEALS_FINAL_VALIDATION
- Diagnostic: ops/bin/as6-diagnose-epic014-crm-deals-final-validation
- Control: ops/bin/as6-control-epic014-crm-deals-final-validation
- AEC rules: ops/aec/as6-epic014-crm-deals-final-validation-aec.md
- Governance: ops/governance/as6-epic014-crm-deals-final-validation-governance.md
- Final marker: AS6_EPIC014_CRM_DEALS=PRODUCTION_VALIDATED
- Added checks: full EPIC014 diagnostic chain, production validation marker, completion marker guard, registry coverage, final invariants.
- Failure classes: CRM_DEALS_FINAL_VALIDATION_GAP, CRM_DEALS_PRODUCTION_VALIDATION_MARKER_GAP, CRM_DEALS_FINAL_REGISTRY_DRIFT, CRM_DEALS_FINAL_COMPLETION_MARKER_GAP.

## AS6_EPIC015_CRM_NEXT_MODULE_SELECTION
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-next-module-selection
- Control: ops/bin/as6-control-epic015-crm-next-module-selection
- AEC rules: ops/aec/as6-epic015-crm-next-module-selection-aec.md
- Governance: ops/governance/as6-epic015-crm-next-module-selection-governance.md
- Selected module: CRM_ACTIVITIES_TASKS
- Next stage: AS6_EPIC015_SLICE01_CRM_ACTIVITIES_TASKS_DOMAIN_MODEL
- Added checks: previous EPIC production evidence, selected module, reuse Contacts/Companies/Deals, existing CRM Workspace/Layout, as6-grep-safe, completion marker guard.
- Failure classes: CRM_EPIC015_NEXT_MODULE_SELECTION_REQUIRED, CRM_ACTIVITIES_TASKS_SELECTION_GAP, CRM_ACTIVITIES_TASKS_REUSE_FOUNDATION_GAP.

## AS6_EPIC015_SLICE01_CRM_ACTIVITIES_TASKS_DOMAIN_MODEL
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-domain-model
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-domain-model
- Runtime tracer: frontend/src/crm/activities/domain/crmActivityRuntimeTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-domain-model-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-domain-model-governance.md
- Added checks: activity identity, task identity, types, statuses, priorities, lifecycle, deadline/reminder, company/contact/deal links, no storage, no API, no business workflow.
- Failure classes: CRM_ACTIVITIES_TASKS_DOMAIN_MODEL_GAP, CRM_ACTIVITY_IDENTITY_DRIFT, CRM_TASK_IDENTITY_DRIFT, CRM_ACTIVITY_LINK_DRIFT, CRM_ACTIVITY_DEADLINE_REMINDER_DRIFT.

## AS6_EPIC015_SLICE02_CRM_ACTIVITIES_TASKS_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-foundation
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-foundation
- Runtime tracer: frontend/src/crm/activities/foundation/crmActivityFoundationTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-foundation-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-foundation-governance.md
- Added checks: capabilities, manifest, registry, runtime, resolver, navigation, panels, descriptor, health snapshot, runtime tracer, no storage, no API, no business workflow.
- Failure classes: CRM_ACTIVITIES_TASKS_FOUNDATION_GAP, CRM_ACTIVITIES_REGISTRY_DRIFT, CRM_ACTIVITIES_RUNTIME_DRIFT, CRM_ACTIVITIES_NAVIGATION_DRIFT, CRM_ACTIVITIES_FOUNDATION_HEALTH_DRIFT.

## AS6_EPIC015_SLICE03_CRM_ACTIVITIES_TASKS_UI_FOUNDATION
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-ui-foundation
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-ui-foundation
- Runtime tracer: frontend/src/crm/activities/ui/ActivitiesUiRuntimeTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-ui-foundation-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-ui-foundation-governance.md
- Added checks: header, actions, timeline, tasks list, activity card, task card, loading/empty/ready/error states, diagnostics panel, UI tracer, UI health snapshot, CSS foundation.
- Failure classes: CRM_ACTIVITIES_TASKS_UI_FOUNDATION_GAP, CRM_ACTIVITIES_UI_STATE_DRIFT, CRM_ACTIVITIES_UI_TRACER_DRIFT, CRM_ACTIVITIES_UI_HEALTH_DRIFT, CRM_ACTIVITIES_UI_CSS_DRIFT.

## AS6_EPIC015_SLICE04_CRM_ACTIVITIES_TASKS_WORKSPACE_INTEGRATION
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-workspace-integration
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-workspace-integration
- Runtime tracer: frontend/src/crm/activities/workspace/crmActivitiesWorkspaceTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-workspace-integration-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-workspace-integration-governance.md
- Added checks: workspace integration, panel, navigation, state resolver, diagnostics, health snapshot, workspace tracer, existing CRM Workspace/Layout reuse.
- Failure classes: CRM_ACTIVITIES_TASKS_WORKSPACE_INTEGRATION_GAP, CRM_ACTIVITIES_WORKSPACE_PANEL_DRIFT, CRM_ACTIVITIES_WORKSPACE_NAVIGATION_DRIFT, CRM_ACTIVITIES_WORKSPACE_HEALTH_DRIFT, CRM_ACTIVITIES_WORKSPACE_TRACER_DRIFT.

## AS6_EPIC015_SLICE05_CRM_ACTIVITIES_TASKS_CRM_LAYOUT_BRIDGE
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-crm-layout-bridge
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-crm-layout-bridge
- Runtime tracer: frontend/src/crm/activities/layout/crmActivitiesLayoutRuntimeTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-crm-layout-bridge-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-crm-layout-bridge-governance.md
- Added checks: CRM Layout Bridge, layout model, layout state resolver, breadcrumbs, active section, diagnostics, health snapshot, layout tracer, existing CRM Layout/Workspace/Header/Sidebar reuse.
- Failure classes: CRM_ACTIVITIES_TASKS_CRM_LAYOUT_BRIDGE_GAP, CRM_ACTIVITIES_LAYOUT_MODEL_DRIFT, CRM_ACTIVITIES_LAYOUT_STATE_DRIFT, CRM_ACTIVITIES_BREADCRUMB_DRIFT, CRM_ACTIVITIES_LAYOUT_HEALTH_DRIFT.

## AS6_EPIC015_SLICE06_CRM_ACTIVITIES_TASKS_LIVE_LAYOUT_MOUNT
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-live-layout-mount
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-live-layout-mount
- Runtime tracer: frontend/src/crm/activities/live/crmActivitiesLiveLayoutMountTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-live-layout-mount-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-live-layout-mount-governance.md
- Added checks: Live Layout Mount, CRMPage integration, live contract, diagnostics, health snapshot, tracer, existing CRM Layout/Workspace/Header/Sidebar reuse.
- Failure classes: CRM_ACTIVITIES_TASKS_LIVE_LAYOUT_MOUNT_GAP, CRM_ACTIVITIES_LIVE_MOUNT_IMPORT_DRIFT, CRM_ACTIVITIES_LIVE_MOUNT_HEALTH_DRIFT, CRM_ACTIVITIES_LIVE_MOUNT_TRACER_DRIFT, CRM_ACTIVITIES_CRM_PAGE_MOUNT_DRIFT.

## AS6_EPIC015_SLICE07_CRM_ACTIVITIES_TASKS_PRODUCTION_POLISH
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-production-polish
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-production-polish
- Runtime tracer: frontend/src/crm/activities/production/crmActivitiesProductionTracer.js
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-production-polish-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-production-polish-governance.md
- Added checks: production contract, production diagnostics, production health snapshot, production tracer, ARIA, visible focus, reduced motion, CSS containment, no runtime fetch/storage, no heavy dependencies.
- Failure classes: CRM_ACTIVITIES_TASKS_PRODUCTION_POLISH_GAP, CRM_ACTIVITIES_PRODUCTION_ACCESSIBILITY_DRIFT, CRM_ACTIVITIES_PRODUCTION_MOTION_DRIFT, CRM_ACTIVITIES_PRODUCTION_PERFORMANCE_DRIFT, CRM_ACTIVITIES_PRODUCTION_HEALTH_DRIFT.

## AS6_EPIC015_SLICE08_CRM_ACTIVITIES_TASKS_FINAL_VALIDATION
- Diagnostic: ops/bin/as6-diagnose-epic015-crm-activities-tasks-final-validation
- Control: ops/bin/as6-control-epic015-crm-activities-tasks-final-validation
- AEC rules: ops/aec/as6-epic015-crm-activities-tasks-final-validation-aec.md
- Governance: ops/governance/as6-epic015-crm-activities-tasks-final-validation-governance.md
- Final marker: AS6_EPIC015_CRM_ACTIVITIES_TASKS=PRODUCTION_VALIDATED
- Completion guard: ops/bin/as6-control-epic-completion-marker-guard
- Added checks: all EPIC015 slice diagnostics, completion markers, registry coverage, governance, state, final build, secret scan, commit, push and restore tag.
- Failure classes: CRM_ACTIVITIES_TASKS_FINAL_VALIDATION_GAP, CRM_ACTIVITIES_FINAL_COMPLETION_MARKER_DRIFT, CRM_ACTIVITIES_FINAL_REGISTRY_DRIFT, CRM_ACTIVITIES_FINAL_COVERAGE_DRIFT, CRM_ACTIVITIES_FINAL_GOVERNANCE_DRIFT.

## AS6_EPIC015_SLICE08_FINAL_VALIDATION_HEREDOC_INTERRUPT_REPAIR
- Repair: AS6_EPIC015_SLICE08_FINAL_VALIDATION_HEREDOC_INTERRUPT_REPAIR
- Failure class: CRM_ACTIVITIES_FINAL_VALIDATION_HEREDOC_INTERRUPT
- Prevention: final validation repair reruns diagnostics, build, secret scan, commit, push and restore tag after terminal heredoc interruption.

## AS6 EPIC016 CRM Next Module Selection
- Diagnostic: docs/diagnostics/as6-epic016-crm-next-module-selection-diagnostics.md
- Failure class: AS6_CRM_NEXT_MODULE_SELECTION_GAP
- Result: PASS

## AS6 EPIC016 CRM Next Module Selection Repair
- Diagnostic: docs/diagnostics/as6-epic016-crm-next-module-selection-diagnostics.md
- Repair diagnostic: docs/diagnostics/as6-epic016-runtime-gitignore-repair-diagnostics.md
- Failure class: AS6_CRM_NEXT_MODULE_SELECTION_GAP
- Repair failure class: AS6_RUNTIME_GITIGNORE_ARTIFACT_STAGING_GAP
- Result: PASS

## AS6 EPIC016 CRM Followups Foundation
- Diagnostic: docs/diagnostics/as6-epic016-crm-followups-foundation-diagnostics.md
- Failure class: AS6_CRM_FOLLOWUPS_FOUNDATION_GAP
- Runtime diagnostic: AS6_CRM_FOLLOWUPS_FOUNDATION
- Result: PASS

## AS6 EPIC016 CRM Followups Workspace Integration
- Diagnostic: docs/diagnostics/as6-epic016-crm-followups-workspace-integration-diagnostics.md
- Failure class: AS6_CRM_FOLLOWUPS_WORKSPACE_INTEGRATION_GAP
- Runtime trace: workspace.integration.created
- Result: PASS

## AS6 EPIC016 CRM Followups UI Wiring
- Diagnostic: docs/diagnostics/as6-epic016-crm-followups-ui-wiring-diagnostics.md
- Repair diagnostic: docs/diagnostics/as6-epic016-jsx-node-check-repair-diagnostics.md
- Failure class: AS6_CRM_FOLLOWUPS_UI_WIRING_GAP
- Repair failure class: AS6_JSX_NODE_CHECK_UNSUPPORTED_EXTENSION_GAP
- Route-level UI wiring: frontend/src/pages/FollowupsPage.jsx
- Workspace surface: frontend/src/crm/followups/FollowupsWorkspaceSurface.jsx
- Result: PASS

## AS6 EPIC016 CRM Followups Final Validation
- Diagnostic: docs/diagnostics/as6-epic016-crm-followups-final-validation-diagnostics.md
- Failure class: AS6_CRM_FOLLOWUPS_FINAL_VALIDATION_GAP
- Production marker: AS6_EPIC016_CRM_FOLLOWUPS=PRODUCTION_VALIDATED
- Result: PASS

## AS6 EPIC017 CRM Next Module Selection
- Diagnostic: docs/diagnostics/as6-epic017-crm-next-module-selection-diagnostics.md
- Failure class: AS6_CRM_EPIC017_NEXT_MODULE_SELECTION_GAP
- Selected module: CRM_ANALYTICS
- Result: PASS

## AS6 EPIC017 CRM Analytics Foundation
- Diagnostic: docs/diagnostics/as6-epic017-crm-analytics-foundation-diagnostics.md
- Failure class: AS6_CRM_ANALYTICS_FOUNDATION_GAP
- Runtime diagnostic: AS6_CRM_ANALYTICS_FOUNDATION
- Result: PASS

## AS6 EPIC017 CRM Analytics UI Wiring
- Diagnostic: docs/diagnostics/as6-epic017-crm-analytics-ui-wiring-diagnostics.md
- Failure class: AS6_CRM_ANALYTICS_UI_WIRING_GAP
- Panel-level UI wiring: frontend/src/pages/crm/CRMAnalyticsPanel.jsx
- Workspace surface: frontend/src/crm/analytics/CRMAnalyticsWorkspaceSurface.jsx
- Result: PASS

## AS6 EPIC017 CRM Analytics Final Validation
- Diagnostic: docs/diagnostics/as6-epic017-crm-analytics-final-validation-diagnostics.md
- Failure class: AS6_CRM_ANALYTICS_FINAL_VALIDATION_GAP
- Production marker: AS6_EPIC017_CRM_ANALYTICS=PRODUCTION_VALIDATED
- Result: PASS

## AS6 EPIC018 CRM Next Module Selection
- Diagnostic: docs/diagnostics/as6-epic018-crm-next-module-selection-diagnostics.md
- Failure class: AS6_CRM_EPIC018_NEXT_MODULE_SELECTION_GAP
- Selected module: CRM_FILTERS
- Result: PASS

## AS6 EPIC018 CRM Filters Foundation
- Diagnostic: docs/diagnostics/as6-epic018-crm-filters-foundation-diagnostics.md
- Failure class: AS6_CRM_FILTERS_FOUNDATION_GAP
- Runtime diagnostic: AS6_CRM_FILTERS_FOUNDATION
- Result: PASS

## AS6 EPIC018 CRM Filters UI Wiring
- Diagnostic: docs/diagnostics/as6-epic018-crm-filters-ui-wiring-diagnostics.md
- Failure class: AS6_CRM_FILTERS_UI_WIRING_GAP
- Panel-level UI wiring: frontend/src/pages/crm/CRMFiltersPanel.jsx
- Workspace surface: frontend/src/crm/filters/CRMFiltersWorkspaceSurface.jsx
- Result: PASS

## AS6 EPIC018 CRM Filters Final Validation
- Diagnostic: docs/diagnostics/as6-epic018-crm-filters-final-validation-diagnostics.md
- Failure class: AS6_CRM_FILTERS_FINAL_VALIDATION_GAP
- Production marker: AS6_EPIC018_CRM_FILTERS=PRODUCTION_VALIDATED
- Result: PASS

## AS6 EPIC019 CRM Next Module Selection
- Diagnostic: docs/diagnostics/as6-epic019-crm-next-module-selection-diagnostics.md
- Failure class: AS6_CRM_EPIC019_NEXT_MODULE_SELECTION_GAP
- Selected module: CRM_KANBAN
- Result: PASS

## AS6 EPIC019 CRM Kanban Foundation
- Diagnostic: docs/diagnostics/as6-epic019-crm-kanban-foundation-diagnostics.md
- Failure class: AS6_CRM_KANBAN_FOUNDATION_GAP
- Runtime diagnostic: AS6_CRM_KANBAN_FOUNDATION
- Result: PASS

## AS6 EPIC019 CRM Kanban UI Wiring
- Diagnostic: docs/diagnostics/as6-epic019-crm-kanban-ui-wiring-diagnostics.md
- Failure class: AS6_CRM_KANBAN_UI_WIRING_GAP
- Panel-level UI wiring: frontend/src/pages/crm/CRMKanbanPanel.jsx
- Workspace surface: frontend/src/crm/kanban/CRMKanbanWorkspaceSurface.jsx
- Result: PASS

## AS6 EPIC019 CRM Kanban Final Validation
- Diagnostic: docs/diagnostics/as6-epic019-crm-kanban-final-validation-diagnostics.md
- Failure class: AS6_CRM_KANBAN_FINAL_VALIDATION_GAP
- Production marker: AS6_EPIC019_CRM_KANBAN=PRODUCTION_VALIDATED
- Result: PASS

## AS6 EPIC020 CRM Next Module Selection
- Diagnostic: docs/diagnostics/as6-epic020-crm-next-module-selection-diagnostics.md
- Failure class: AS6_CRM_EPIC020_NO_NEXT_PANEL_CANDIDATE_GAP
- Repair: AS6_EPIC020_NO_CRM_PANEL_CANDIDATE_REPAIR
- Result: PASS

## AS6 EPIC020 CRM Coverage Reconciliation
- Diagnostic: docs/diagnostics/as6-epic020-crm-coverage-reconciliation-diagnostics.md
- Failure class: AS6_CRM_COVERAGE_RECONCILIATION_GAP
- Repair class: AS6_CRM_LEGACY_DOMAIN_FILENAME_ASSUMPTION_GAP
- Result: PASS

## AS6 EPIC021 Project Direction Selection
- Diagnostic: docs/diagnostics/as6-epic021-project-direction-selection-diagnostics.md
- Failure class: AS6_PROJECT_DIRECTION_SELECTION_GAP
- Selected direction: AS6_DESIGN_SYSTEM_V1_COMPLETION
- Result: PASS

## AS6 Codex Local Skills
- Diagnostic: docs/diagnostics/as6-codex-local-skills-diagnostics.md
- Failure class: AS6_CODEX_LOCAL_SKILLS_GOVERNANCE_GAP
- Root cause: Local Codex skills/prompts were absent and AGENTS.md was missing at task start.
- Result: PASS

## AS6 EPIC021 Design System Filters Adoption Validation
- Diagnostic: docs/diagnostics/as6-epic021-design-system-filters-adoption-validation-diagnostics.md
- Failure class: AS6_DESIGN_SYSTEM_FILTERS_ADOPTION_VALIDATION_GAP
- Real visual migration: AS6Panel, AS6Toolbar, AS6Card, AS6Badge
- Legacy preservation: CRMFiltersLegacyPanel
- Result: PASS

## AS6 EPIC021 Design System Kanban Adoption
- Diagnostic: docs/diagnostics/as6-epic021-design-system-kanban-adoption-diagnostics.md
- Failure class: AS6_DESIGN_SYSTEM_KANBAN_ADOPTION_GAP
- Real visual migration: AS6Panel, AS6Toolbar, AS6Card, AS6Badge, AS6Button, AS6EmptyState
- Legacy preservation: CRMKanbanLegacyPanel
- Result: PASS
