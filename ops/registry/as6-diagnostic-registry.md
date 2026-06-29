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
