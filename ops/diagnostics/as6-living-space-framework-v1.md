# AS6 Living Space Framework v1

Status: PREVIEW_RUNTIME_WIRED / ENFORCEMENT_ADDED / BUILD_EVIDENCE_PENDING

## Diagnostics

The repository contained an experimental dark grid-based `LivingSpace.jsx` and a separate preview that bypassed the approved light Master Screen frame. This created legacy-shell adoption drift, duplicate runtime composition, and no deterministic enforcement of the locked input, metric, registry, and Master Screen tokens.

## Root cause

The approved design architecture existed in documentation and the initial framework source existed in code, but the preview runtime still consumed the legacy engine. The framework also lacked a shared geometry renderer and a repository-level control wired into the existing pre-commit/push enforcement path.

## Structure implemented

- `frontend/src/living/framework/tokens.js`
- `frontend/src/living/framework/spaceRegistry.js`
- `frontend/src/living/framework/LivingInput.jsx`
- `frontend/src/living/framework/LivingFrame.jsx`
- `frontend/src/living/framework/LivingGeometry.jsx`
- `frontend/src/living/framework/livingFramework.css`
- `frontend/src/living/framework/index.js`
- `frontend/src/living/preview/LivingSpacePreviewPage.jsx`
- `ops/bin/as6-control-living-space-framework-v1`

## Runtime change

The Living Space preview now uses one `LivingFrame`, one `LivingInput`, one `LivingGeometry`, and the canonical `livingSpaceRegistry` for Focus, CRM, Finance, and Documents. State switching changes the meaning and geometry inside one shared frame rather than loading separate page implementations.

The former dark implementation remains available as rollback code until visual regression and build evidence are complete.

## Diagnostics added

- detect use of the dark legacy Living Space shell as a new canonical screen;
- detect preview bypass of `LivingFrame`;
- detect independent regeneration of the bottom communication line;
- detect a visible enclosing input frame;
- detect state metric scale drift from the 18 px Master Screen role;
- detect unregistered Living Space IDs;
- detect missing unknown-space rejection;
- detect duplicate local space metadata outside the canonical runtime registry;
- detect page-based space implementations that bypass the shared frame;
- detect missing framework exports and missing geometry renderer;
- detect enforcement bypass.

## Failure classes

- `AS6_LIVING_FRAMEWORK_MISSING`
- `AS6_LEGACY_DARK_LIVING_SHELL_ADOPTION_DRIFT`
- `AS6_LIVING_PREVIEW_FRAMEWORK_BYPASS`
- `AS6_LIVING_INPUT_REGENERATION_DRIFT`
- `AS6_LIVING_INPUT_VISIBLE_FRAME_DRIFT`
- `AS6_LIVING_SPACE_RUNTIME_REGISTRY_DRIFT`
- `AS6_LIVING_SPACE_UNKNOWN_REJECTION_GAP`
- `AS6_SPACE_LOCAL_METADATA_DUPLICATION_DRIFT`
- `AS6_PAGE_BASED_LIVING_SPACE_IMPLEMENTATION_DRIFT`
- `AS6_LIVING_GEOMETRY_RENDERER_GAP`
- `AS6_LIVING_FRAMEWORK_EXPORT_GAP`
- `AS6_MASTER_SCREEN_TOKEN_DRIFT`
- `AS6_LIVING_SPACE_FRAMEWORK_ENFORCEMENT_BYPASS`

## Controls

1. New Living Spaces must resolve metadata through `getLivingSpaceDefinition`.
2. Shared frame composition must use `LivingFrame`.
3. Approved preview states must render through `LivingGeometry` inside the shared frame.
4. Bottom communication must use `LivingInput` and must not expose an enclosing border.
5. Master Screen checksum, 18 px state metric role, and no-frame input rule remain locked tokens.
6. `ops/bin/as6-control-living-space-framework-v1` validates structure, registry, exports, tokens, preview wiring, and unknown-state rejection.
7. The framework control runs from `ops/bin/as6-pre-commit-push-enforcement`.
8. Existing production routes are not migrated until build, visual validation, rollback, and production checks pass.

## AEC rules

- reject a new space implementation that duplicates the shared frame;
- reject an input field with an enclosing border, outline, card, or perimeter shadow;
- reject an unknown or unregistered space ID;
- reject a preview or production state that bypasses `LivingFrame`;
- reject adoption of the legacy dark shell as the approved Master Screen implementation;
- reject missing shared framework exports;
- reject direct production migration without visual regression evidence and rollback preservation.

## Current validation state

- framework source structure: PASS by deterministic static control definition;
- canonical space metadata for Focus, CRM, Finance, Documents: PASS;
- Projects planned state registered: PASS;
- shared geometry renderer: IMPLEMENTED;
- preview runtime wiring: IMPLEMENTED;
- Locked Living Input implementation: PASS;
- pre-commit/push enforcement wiring: IMPLEMENTED;
- legacy rollback source preserved: YES;
- local build execution evidence: PENDING;
- visual regression evidence: PENDING;
- production route migration: NOT STARTED.

## Readiness

`AS6_LIVING_SPACE_FRAMEWORK_FOUNDATION_READINESS=100%`

`AS6_LIVING_SPACE_FRAMEWORK_PREVIEW_RUNTIME_READINESS=100%`

`AS6_LIVING_SPACE_FRAMEWORK_PRODUCTION_READINESS=70%`
