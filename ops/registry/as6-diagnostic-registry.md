# AS6 Diagnostic Registry

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
- public_home: /
- public_blog: /blog
- app_workspace: /app
- crm_workspace: /as6-crm
- root_cause: AS6_PUBLIC_BRAND_EXPERIENCE_WEAK
- failure_classes: AS6_PUBLIC_SITE_LOW_VISUAL_IMPACT_GAP, AS6_BLOG_VISUAL_CONTENT_GAP, AS6_PUBLIC_CTA_CLARITY_GAP
- architecture_rules: AS6_PUBLIC_HOME_MUST_BE_BRAND_WEBSITE, AS6_APP_MUST_STAY_UNDER_APP_ROUTE, AS6_BLOG_MUST_BE_VISUAL_AND_SEO_READY
- result: AS6_EPIC025_PUBLIC_BRAND_EXPERIENCE=REGISTERED
- next_stage: AS6_EPIC025_PUBLIC_BRAND_VISUAL_VALIDATION

## AS6 EPIC024 Public Brand Website Foundation
- diagnostic: public route ownership, app workspace route, blog slug structure, public navigation
- public_home: /
- public_blog: /blog
- public_blog_slug: /blog/:slug
- public_docs: /docs
- public_pricing: /pricing
- public_about: /about
- public_contact: /contact
- app_workspace: /app
- crm_workspace: /as6-crm
- root_cause: AS6_PUBLIC_WEBSITE_ENTRYPOINT_MISSING
- failure_classes: AS6_LANDING_APP_MIXED_WITH_PUBLIC_SITE_GAP, AS6_BLOG_CONTENT_ENGINE_MISSING_GAP, AS6_PUBLIC_BRAND_NAVIGATION_GAP
- architecture_rules: AS6_ROOT_MUST_BE_PUBLIC_BRAND_WEBSITE, AS6_APP_WORKSPACE_MUST_BE_UNDER_APP_ROUTE, AS6_BLOG_MUST_SUPPORT_SEO_POST_STRUCTURE
- result: AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION=REGISTERED
- next_stage: AS6_EPIC024_PUBLIC_WEBSITE_VISUAL_VALIDATION

## AS6 EPIC023 Architecture Reset Implementation
- diagnostic: frontend route ownership, CRM redirect, living-space dedupe, alias redirect, rollback preservation
- root_route: /
- crm_route: /as6-crm
- crm_redirect: /crm -> /as6-crm
- as6_one_alias: /as6-one -> /
- legacy_rollback: /as6-sales
- root_cause: AS6_PARALLEL_UI_ARCHITECTURE_DRIFT
- failure_classes: AS6_MULTIPLE_PRIMARY_SHELLS_GAP, AS6_MULTIPLE_CRM_ENTRYPOINTS_GAP, AS6_ROUTE_OWNERSHIP_DRIFT, AS6_PRODUCTION_VISUAL_VALIDATION_GAP
- architecture_rules: AS6_SINGLE_PRIMARY_SHELL_RULE, AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE, AS6_PRODUCTION_VISUAL_VALIDATION_REQUIRED_RULE, AS6_NO_NEW_SHELL_WITHOUT_ARCHITECTURE_APPROVAL_RULE
- result: AS6_EPIC023_ARCHITECTURE_RESET_IMPLEMENTATION=REGISTERED
- next_stage: AS6_EPIC023_PRODUCTION_VISUAL_VALIDATION

## AS6 EPIC022 AS6 ONE Branded Landing and Route Repair
- diagnostic: root route, CRM route, production bundle, and SPA fallback inspection
- root_route: /
- crm_route: /as6-crm
- legacy_rollback: /as6-sales
- legacy_alias: /crm
- root_cause: AS6_ONE_BRANDED_ENTRYPOINT_NOT_CONNECTED
- failure_classes: AS6_PRODUCTION_ROUTE_NOT_VISIBLE_GAP, AS6_LANDING_OLD_BRAND_DRIFT, AS6_CRM_ONE_ROUTE_DEPLOYMENT_GAP
- result: AS6_ONE_BRANDED_ENTRYPOINT_CONNECTED
- next_stage: AS6_EPIC022_AS6_ONE_PRODUCTION_VISUAL_VALIDATION

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
