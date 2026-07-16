# AS6 Canonical Reference Reset v1

## Diagnostics
The old LivingShellV2 remained the production runtime owner and wrapped the canonical engine with obsolete sidebar, topbar, spacing and background contracts.

## Root Cause
Canonical content was treated as an inner page instead of becoming the application root. This made pixel-reference matching structurally impossible.

## Change
- replace the application runtime owner with LivingCanonicalApp;
- remove LivingShellV2 and its CSS from the frontend source;
- remove obsolete Documents page CSS;
- preserve real-data adapters and canonical engine;
- establish a 1536x1024 reference baseline with responsive scaling;
- add canonical chrome, atmosphere, profile/logout and route handling;
- add permanent controls preventing old sidebar/topbar return.

## Failure classes
- AS6_LEGACY_SHELL_REMAINS_RUNTIME_OWNER
- AS6_REFERENCE_COMPOSITION_WRAPPED_BY_OLD_UI
- AS6_PIXEL_REFERENCE_VIEWPORT_CONTRACT_MISSING
- AS6_CANONICAL_BACKGROUND_ASSET_CONTRACT_GAP
- AS6_OBSOLETE_SIDEBAR_TOPBAR_INTERFERENCE
- AS6_REFERENCE_LAYOUT_REGRESSION_CONTROL_GAP

## Canonical reset closure v4
- AS6_WORKSPACE_ISOLATION_COPY_MARKER_DRIFT=FIXED
- AS6_WORKSPACE_ISOLATION_CONTROL_WRONG_LAYER=FIXED
- AS6_VALID_CANONICAL_RESET_BLOCKED_BY_UI_COPY=FIXED
- AS6_CANONICAL_RESET_COMMIT_DEPLOYMENT_PENDING=FIXED
