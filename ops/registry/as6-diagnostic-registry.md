# AS6 Diagnostic Registry

## AS6 Architecture Repository Enforcement v1
- diagnostic: executable Architecture-as-Code repository structure and deterministic validation wired into the existing pre-commit/push enforcement path
- artifact: architecture/validation/validate-architecture-repository.sh
- enforcement: ops/bin/as6-pre-commit-push-enforcement
- diagnostic_artifact: ops/diagnostics/as6-architecture-repository-v1.md
- root_cause: AS6_ARCHITECTURE_VALIDATION_NOT_ENFORCED
- failure_classes: AS6_ARCHITECTURE_REPOSITORY_MISSING, AS6_ARCHITECTURE_INVARIANT_DRIFT, AS6_ARCHITECTURE_OBJECT_UNREGISTERED, AS6_LIVING_SPACE_REGISTRY_DRIFT, AS6_MASTER_COMPONENT_REGISTRY_DRIFT, AS6_ARCHITECTURE_QUALITY_GATE_GAP, AS6_ARCHITECTURE_VALIDATION_GAP, AS6_ARCHITECTURE_ENFORCEMENT_BYPASS
- architecture_rules: AS6_ARCHITECTURE_REPOSITORY_REQUIRED_RULE, AS6_ARCHITECTURE_VALIDATOR_REQUIRED_RULE, AS6_ARCHITECTURE_VALIDATION_MUST_RUN_IN_EXISTING_ENFORCEMENT_RULE, AS6_NO_PARALLEL_ARCHITECTURE_VALIDATION_FRAMEWORK_RULE
- expected_results: AS6_ARCHITECTURE_REPOSITORY=PASS, AS6_ARCHITECTURE_INVARIANTS=PASS, AS6_LIVING_SPACE_REGISTRY=PASS, AS6_MASTER_SCREEN_LOCKED_COMPONENTS=PASS, AS6_ARCHITECTURE_QUALITY_GATES=PASS, AS6_ARCHITECTURE_REPOSITORY_READINESS=100%, AS6_ARCHITECTURE_ENFORCEMENT=PASS
- result: AS6_ARCHITECTURE_REPOSITORY_ENFORCEMENT=REGISTERED

## AS6 V88 Design Compiler
- diagnostic: compiler-style validation gate for all future Living Space states
- artifact: docs/architecture/13_DESIGN_COMPILER.md
- diagnostic_artifact: ops/diagnostics/as6-design-compiler-v88.md
- inherited_standards: Living Space Genome, Geometry Atlas, Spatial Composition System, Motion Transition System, Visual Grammar
- root_cause: AS6_DESIGN_COMPILER_NOT_REPOSITORY_REGISTERED
- failure_classes: AS6_DESIGN_COMPILER_NOT_REGISTERED, AS6_DESIGN_COMPILER_RULE_VIOLATION, AS6_VISUAL_GRAMMAR_VALIDATION_FAILED, AS6_MASTER_SCREEN_INHERITANCE_FAILED, AS6_DUPLICATE_STATE_GEOMETRY, AS6_PAGE_BASED_TRANSITION_DETECTED, AS6_MULTIPLE_PRIMARY_FOCUS, AS6_EMOTIONAL_INCONSISTENCY, AS6_BRAND_LANGUAGE_DRIFT, AS6_STATE_WITHOUT_COMPILER_REPORT
- architecture_rules: AS6_DESIGN_COMPILER_REQUIRED_RULE, AS6_STATE_MUST_PASS_ALL_COMPILER_MODULES_RULE, AS6_NO_STATE_WITHOUT_FORMULA_RULE, AS6_NO_STATE_WITHOUT_UNIQUE_GEOMETRY_RULE, AS6_NO_PAGE_SWITCH_TRANSITION_RULE, AS6_NO_MULTIPLE_PRIMARY_FOCUS_RULE, AS6_MASTER_SCREEN_3_COMPILER_GATE_RULE, AS6_ONE_SECOND_RECOGNITION_REQUIRED_RULE
- result: AS6_DESIGN_COMPILER_ADC_V88=REGISTERED
- next_stage: AS6_FOCUS_STATE_IMPLEMENTATION_BRIEF_V89

## AS6 V87 Visual Grammar
- diagnostic: formal visual grammar registration, visual alphabet, emotional dictionary, state formulas, composition gates
- artifact: docs/architecture/12_VISUAL_GRAMMAR.md
- diagnostic_artifact: ops/diagnostics/as6-visual-grammar-v87.md
- root_cause: AS6_VISUAL_GRAMMAR_NOT_REPOSITORY_REGISTERED
- failure_classes: AS6_VISUAL_GRAMMAR_NOT_REGISTERED, AS6_VISUAL_PRIMITIVE_UNCONTROLLED_DRIFT, AS6_STATE_FORMULA_MISSING_GAP, AS6_EMOTIONAL_MEANING_MISSING_GAP, AS6_COMPOSITION_RULE_VIOLATION, AS6_STATE_GEOMETRY_DUPLICATION_DRIFT
- architecture_rules: AS6_VISUAL_GRAMMAR_REQUIRED_RULE, AS6_APPROVED_VISUAL_PRIMITIVES_ONLY_RULE, AS6_STATE_FORMULA_REQUIRED_RULE, AS6_EMOTIONAL_MEANING_REQUIRED_RULE, AS6_ONE_CENTER_COMPOSITION_RULE, AS6_GEOMETRY_DUPLICATION_PREVENTION_RULE
- result: AS6_VISUAL_GRAMMAR_V87=REGISTERED
- next_stage: AS6_DESIGN_COMPILER_ADC_V88

## AS6 V86 Living Space Design System
- diagnostic: Living Space design architecture repository registration, Master Screen 3 inheritance, unique geometry gate, motion continuity gate
- artifacts: docs/architecture/08_LIVING_SPACE_GENOME.md, docs/architecture/09_GEOMETRY_ATLAS.md, docs/architecture/10_SPATIAL_COMPOSITION_SYSTEM.md, docs/architecture/11_MOTION_TRANSITION_SYSTEM.md
- diagnostic_artifact: ops/diagnostics/as6-living-space-design-system-v86.md
- root_cause: AS6_LIVING_SPACE_DESIGN_SYSTEM_NOT_REPOSITORY_REGISTERED
- failure_classes: AS6_LIVING_SPACE_STANDARD_NOT_REGISTERED, AS6_GEOMETRY_STATE_DUPLICATION_RISK, AS6_PAGE_BASED_INTERFACE_DRIFT, AS6_MOTION_CONTINUITY_GAP, AS6_MASTER_SCREEN_INHERITANCE_GAP
- architecture_rules: AS6_NO_NEW_PAGE_WITHOUT_LIVING_SPACE_STATE_RULE, AS6_MASTER_SCREEN_3_INHERITANCE_RULE, AS6_UNIQUE_CENTRAL_GEOMETRY_RULE, AS6_BRAND_CONSTANT_STATE_VARIABLE_RULE, AS6_MOTION_AS_STATE_TRANSFORMATION_RULE
- result: AS6_LIVING_SPACE_DESIGN_SYSTEM_V86=REGISTERED
- next_stage: AS6_VISUAL_STATE_IMPLEMENTATION_FROM_MASTER_SCREEN_3

## AS6 EPIC025 Public Brand Experience
- diagnostic: public home visual impact, blog visual content, CTA clarity, public route preservation
- result: AS6_EPIC025_PUBLIC_BRAND_EXPERIENCE=REGISTERED

## AS6 EPIC024 Public Brand Website Foundation
- diagnostic: public route ownership, app workspace route, blog slug structure, public navigation
- result: AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION=REGISTERED

## AS6 EPIC023 Architecture Reset Implementation
- diagnostic: frontend route ownership, CRM redirect, living-space dedupe, alias redirect, rollback preservation
- result: AS6_EPIC023_ARCHITECTURE_RESET_IMPLEMENTATION=REGISTERED

## AS6 EPIC022 AS6 ONE Branded Landing and Route Repair
- diagnostic: root route, CRM route, production bundle, and SPA fallback inspection
- result: AS6_ONE_BRANDED_ENTRYPOINT_CONNECTED

## AS6 EPIC022 CRM ONE Workspace Migration
- diagnostic: frontend route and living-space registry inspection
- result: AS6_CRM_ONE_WORKSPACE_ROUTE=REGISTERED

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
## AS6 Living Workspace v1
- diagnostic: authenticated Living home product dashboard
- diagnostic_artifact: ops/diagnostics/as6-living-workspace-v1.md
- control: ops/bin/as6-control-living-workspace-v1
- aec: ops/governance/as6-living-workspace-v1-aec.md
- failure_classes: AS6_LIVING_HOME_PRODUCT_DASHBOARD_GAP, AS6_WORKSPACE_MODULE_DISCOVERY_GAP, AS6_RECENT_ACTIVITY_VISIBILITY_GAP, AS6_AI_CONDUCTOR_PRIMARY_ENTRY_GAP, AS6_WORKSPACE_STATUS_SUMMARY_GAP, AS6_LIVING_HOME_RESPONSIVE_DENSITY_GAP
- result: AS6_LIVING_WORKSPACE_V1=REGISTERED

## AS6 Living Space Engine v1
- diagnostic: reusable data-driven engine and twelve-space product registry
- artifact: frontend/src/living/product-v2/LivingSpaceEngine.jsx
- registry: frontend/src/living/product-v2/livingSpaceRegistry.js
- failure_classes: AS6_LIVING_SPACE_ENGINE_MISSING, AS6_SPACE_DEFINITION_HARDCODED_IN_SHELL, AS6_NEW_SPACE_LAYOUT_DUPLICATION_RISK, AS6_SPACE_VISUAL_GRAMMAR_REUSE_GAP, AS6_SPACE_REGISTRY_COVERAGE_GAP, AS6_TWELVE_SPACE_ROADMAP_NOT_EXECUTABLE
- result: AS6_LIVING_SPACE_ENGINE_V1=REGISTERED

## AS6 Living Documents Real Data v1
- diagnostic: real workspace-isolated documents rendered through a dedicated read-only Living Space
- artifacts: frontend/src/living/product-v2/LivingDocumentsSpace.jsx, frontend/src/living/product-v2/LivingDocumentsSpace.css
- diagnostic_artifact: ops/diagnostics/as6-living-documents-real-data-v1.md
- control: ops/bin/as6-control-living-documents-real-data-v1
- failure_classes: AS6_DOCUMENT_SPACE_ENGINE_DATA_ADAPTER_GAP, AS6_DOCUMENT_SPACE_REAL_DATA_RENDERING_GAP, AS6_DOCUMENT_NODE_METRICS_PLACEHOLDER_GAP, AS6_DOCUMENT_ACTIVITY_TIMELINE_DATA_GAP, AS6_DOCUMENT_EMPTY_STATE_ENGINE_GAP, AS6_DOCUMENT_ERROR_STATE_ENGINE_GAP, AS6_DOCUMENT_READ_ONLY_ENGINE_CONTROL_GAP, AS6_DOCUMENT_WORKSPACE_ISOLATION_ENGINE_GAP, AS6_DOCUMENT_CONTROL_NESTED_QUOTE_SYNTAX_GAP, AS6_REPAIR_SCRIPT_TRAILING_QUOTE_SYNTAX_GAP
- result: AS6_LIVING_DOCUMENTS_REAL_DATA=REGISTERED

## AS6 Living Space Canonical v2
- diagnostic: canonical Master Screen inheritance restored across Living Space Engine and Documents real-data space
- artifacts: frontend/src/living/product-v2/LivingSpaceEngine.jsx, frontend/src/living/product-v2/LivingSpaceEngine.css, frontend/src/living/product-v2/LivingDocumentsSpace.jsx
- control: ops/bin/as6-control-living-space-canonical-v2
- result: AS6_LIVING_SPACE_CANONICAL_V2=REGISTERED

## AS6 Canonical Reference Reset v1
- diagnostic: obsolete Living shell removed as runtime owner; canonical reference application established
- artifacts: frontend/src/living/product-v2/LivingCanonicalApp.jsx, frontend/src/living/product-v2/LivingCanonicalApp.css
- removed: frontend/src/living/product-v2/LivingShellV2.jsx, frontend/src/living/product-v2/LivingShellV2.css, frontend/src/living/product-v2/LivingDocumentsSpace.css
- control: ops/bin/as6-control-canonical-reference-reset-v1
- result: AS6_CANONICAL_REFERENCE_RESET_V1=REGISTERED

## AS6 Public Brand Foundation v1
- AS6_PUBLIC_BRAND_FOUNDATION_V1=ops/diagnostics/as6-public-brand-foundation-v1.md

## AS6 Public Brand Master Screen v2
- AS6_PUBLIC_BRAND_MASTER_SCREEN_V2=ops/diagnostics/as6-public-brand-master-screen-v2.md

## AS6 Public Brand ONE v3
- AS6_PUBLIC_BRAND_ONE_V3=ops/diagnostics/as6-public-brand-one-v3.md

## AS6 Master Screen Reference Baseline v1
- AS6_MASTER_SCREEN_REFERENCE_BASELINE_V1=ops/diagnostics/as6-master-screen-reference-baseline-v1.md
- AS6_MASTER_SCREEN_RUNTIME_OWNER=frontend/src/living/product-v2/AS6MasterScreen.jsx
- AS6_MASTER_SCREEN_REFERENCE_STYLE=frontend/src/living/product-v2/AS6MasterScreenReference.css
- AS6_PROFILE_DISPLAY_NAME_OWNER=frontend/src/living/product-v2/LivingCanonicalApp.jsx

## AS6 Living Shell Foundation v1
- AS6_LIVING_SHELL_FOUNDATION_V1=ops/diagnostics/as6-living-shell-foundation-v1.md
- AS6_LIVING_SHELL_MODEL_OWNER=frontend/src/living/product-v2/livingShellFoundation.js
- AS6_LIVING_LOCALE_OWNER=frontend/src/living/product-v2/livingLocalization.js
- AS6_PROFILE_BRANDING_SETTINGS_OWNER=frontend/src/living/product-v2/LivingSettingsSpace.jsx
- AS6_PROFILE_PERSISTENCE_OWNER=backend/src/models/userModel.js
- AS6_WORKSPACE_BRANDING_PERSISTENCE_OWNER=backend/src/models/workspaceModel.js
- AS6_LIVING_SHELL_ARCHITECTURE=ops/architecture/as6-living-shell-foundation-v1.md

## AS6 Screen 1 Refinement v2
- diagnostic: neutral black theme, focus-only intent outline, stable workspace selection and unambiguous settings
- runtime_owners: frontend/src/living/product-v2/AS6MasterScreenReference.css, frontend/src/living/product-v2/LivingCanonicalApp.jsx, frontend/src/living/product-v2/LivingSettingsSpace.jsx
- diagnostic_artifacts: ops/diagnostics/as6-screen1-refinement-v2.md, ops/diagnostics/as6-screen1-interaction-multi-workspace-v1.mjs
- control: ops/bin/as6-control-screen1-interaction-multi-workspace-v1
- aec: ops/governance/as6-screen1-refinement-v2-aec.md
- result: AS6_SCREEN1_REFINEMENT_V2=REGISTERED

## AS6 rclone encrypted-header compatibility v1
- diagnostic: encrypted rclone configs with a leading comment must be accepted without weakening plaintext rejection
- diagnostic_artifact: ops/diagnostics/as6-rclone-encrypted-header-compat-v1.md
- checker: ops/bin/as6-rclone-config-encrypted-v1
- control: ops/bin/as6-control-offsite-backup-v1
- failure_classes: AS6_RCLONE_ENCRYPTED_CONFIG_HEADER_POSITION_DRIFT, AS6_RCLONE_CRYPT_ROOT_BOOTSTRAP_ORDER_GAP
- result: AS6_RCLONE_ENCRYPTED_HEADER_COMPAT=REGISTERED
