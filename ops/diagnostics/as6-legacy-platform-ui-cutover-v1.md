# AS6 Legacy Platform UI Cutover v1

## Status
Implemented in source; build and production deployment evidence pending.

## Diagnostic finding
The old platform UI remained active because `frontend/src/App.jsx` still imported legacy shells, dozens of legacy page components and their global CSS layers, and owned many public routes. Even after the new Living Product foundation was added, old route owners and global styles could still render or visually override the new interface.

## Root cause
Migration was additive instead of exclusive: new Living routes were added, but old route ownership, imports and global style imports were not removed from the application entry point.

## Change
- `frontend/src/App.jsx` is now a minimal Russian-first public and Living Product router.
- `/app` renders `LivingProductPreviewPage`.
- `/preview/living` renders the same Living Product implementation.
- `/as6-living-preview` keeps the framework preview for comparison.
- Legacy platform routes redirect to `/app` and no longer import or render old UI components.
- Legacy global CSS layers are no longer imported by `App.jsx`.
- Public website, blog, authentication and payment-success routes remain.

## Added failure classes
- `AS6_LEGACY_PLATFORM_ROUTE_OWNER_PRESENT`
- `AS6_LEGACY_PLATFORM_GLOBAL_STYLE_IMPORT_PRESENT`
- `AS6_LEGACY_PLATFORM_COMPONENT_IMPORT_PRESENT`
- `AS6_LIVING_PRODUCT_APP_ROUTE_BYPASS`
- `AS6_PLATFORM_PARALLEL_UI_DRIFT`
- `AS6_PLATFORM_UI_DEAD_CODE_DELETION_GAP`
- `AS6_PLATFORM_UI_BUILD_VALIDATION_GAP`
- `AS6_PLATFORM_UI_DEPLOYMENT_DRIFT`

## Required checks
1. `App.jsx` must not import legacy application shells or legacy business pages.
2. `App.jsx` must not import legacy Mission Control, workspace, sidebar, header, right-rail, CRM workspace or dark-shell global CSS.
3. `/app` and `/preview/living` must resolve to the Living Product.
4. Legacy route URLs must redirect to `/app` without rendering old UI.
5. Build must prove no missing imports or runtime errors.
6. A dependency graph must identify now-unreachable legacy UI files before physical deletion.
7. Old UI files may be physically deleted only after build, route tests and rollback evidence pass.
8. Production deployment must be verified in a browser and by build fingerprint.

## Diagnostic additions
Added explicit detection coverage for legacy route ownership, legacy global CSS leakage, old component imports, parallel UI drift, incomplete dead-code deletion, build-validation gaps and deployment drift.
