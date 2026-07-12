# AS6 Living Space Framework v1

Status: FOUNDATION_IMPLEMENTED / RUNTIME_WIRING_PENDING

## Diagnostics

The repository already contained an experimental `frontend/src/living/engine/LivingSpace.jsx`, but it used a dark grid-based visual shell, a glass capsule title, and screen-local styling that conflict with the approved light Master Screen and Locked Master Components.

## Root cause

The visual standards, component rules, tokens, and interaction patterns were documented, but no canonical React framework layer exposed the approved Master Screen frame, shared space registry, locked input component, and implementation tokens as reusable code.

## Structure added

- `frontend/src/living/framework/tokens.js`
- `frontend/src/living/framework/spaceRegistry.js`
- `frontend/src/living/framework/LivingInput.jsx`
- `frontend/src/living/framework/LivingFrame.jsx`
- `frontend/src/living/framework/livingFramework.css`
- `frontend/src/living/framework/index.js`

## Diagnostics added

- detect use of dark legacy Living Space shell as a new canonical screen;
- detect independent regeneration of the bottom communication line;
- detect a visible enclosing input frame;
- detect state metric scale drift from the 18 px Master Screen role;
- detect unregistered Living Space IDs;
- detect duplicate local space metadata outside the canonical runtime registry;
- detect page-based space implementations that bypass `LivingFrame`.

## Failure classes

- `AS6_LIVING_FRAMEWORK_MISSING`
- `AS6_LEGACY_DARK_LIVING_SHELL_ADOPTION_DRIFT`
- `AS6_LIVING_INPUT_REGENERATION_DRIFT`
- `AS6_LIVING_INPUT_VISIBLE_FRAME_DRIFT`
- `AS6_LIVING_SPACE_RUNTIME_REGISTRY_DRIFT`
- `AS6_SPACE_LOCAL_METADATA_DUPLICATION_DRIFT`
- `AS6_PAGE_BASED_LIVING_SPACE_IMPLEMENTATION_DRIFT`
- `AS6_MASTER_SCREEN_TOKEN_DRIFT`

## Controls

1. New Living Spaces must resolve metadata through `getLivingSpaceDefinition`.
2. Shared frame composition must use `LivingFrame`.
3. Bottom communication must use `LivingInput` and must not expose an enclosing border.
4. Master Screen checksum, 18 px state metric role, and no-frame input rule remain locked tokens.
5. Existing production routes are not migrated until build, visual validation, rollback, and production checks pass.

## AEC rules

- reject a new space implementation that duplicates the shared frame;
- reject an input field with an enclosing border, outline, card, or perimeter shadow;
- reject an unknown or unregistered space ID;
- reject adoption of the legacy dark shell as the approved Master Screen implementation;
- reject direct production migration without visual regression evidence and rollback preservation.

## Current validation state

- framework source structure: PASS
- canonical space metadata for Focus, CRM, Finance, Documents: PASS
- Projects planned state registered: PASS
- Locked Living Input implementation: PASS
- production runtime migration: PENDING
- build and visual regression evidence: PENDING

## Readiness

`AS6_LIVING_SPACE_FRAMEWORK_FOUNDATION_READINESS=100%`

`AS6_LIVING_SPACE_FRAMEWORK_RUNTIME_READINESS=60%`
