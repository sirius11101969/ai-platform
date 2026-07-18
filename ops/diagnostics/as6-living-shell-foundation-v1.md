# AS6 Living Shell Foundation v1

## Diagnostics

Screen 1 was an accepted visual reference but its business content, identity, language and contextual rails were hard-coded. Moving directly to screen 2 would duplicate these decisions and force later rework.

## Root cause

- the center goal and both rails did not share a single state snapshot;
- RU/EN controls were decorative;
- workspace switching did not use the existing workspace API;
- profile identity had no persisted display name or avatar;
- company branding and white-label mode had no canonical data contract;
- loading, stale and error state were not represented at shell level;
- the production frontend release recreated nginx and briefly interrupted traffic.

## Implemented contract

- one immutable shell snapshot controls the central priority, left prepared context, right explanation context, graph notes and intent;
- AI Priority Inbox is the first live priority source; the accepted investor scenario remains the safe fallback;
- profile display name, avatar and locale are persisted on the user;
- company name, logo and branding mode are persisted on the workspace;
- brand modes: platform, co-branded and company-only;
- real RU/EN catalog for Screen 1, settings and shared chrome;
- actual workspace selection through the existing workspace storage contract;
- dedicated settings screen for name, avatar, company logo, brand mode and language;
- additive, idempotent database migration;
- existing Screen 1 geometry and visual hierarchy remain the reference baseline;
- hashed frontend assets are copied first and index.html is replaced last, so nginx is not recreated.

## Atomic state rule

The center and both rails must always be derived from the same snapshot ID. A screen may not fetch or rank these regions independently.

## Failure classes

- AS6_HARDCODED_MASTER_PRIORITY_GAP=FIXED
- AS6_CONTEXT_RAIL_STATE_DRIFT=FIXED
- AS6_DECORATIVE_LOCALE_SWITCH_GAP=FIXED
- AS6_PROFILE_AVATAR_PERSISTENCE_GAP=FIXED
- AS6_WORKSPACE_WHITE_LABEL_CONTRACT_GAP=FIXED
- AS6_WORKSPACE_SWITCHER_PLACEHOLDER_GAP=FIXED
- AS6_FRONTEND_NGINX_RECREATE_GAP=FIXED
- AS6_SINGLE_BACKEND_ROLLING_AVAILABILITY_GAP=OPEN
- AS6_EXTERNAL_POST_DEPLOY_VISUAL_VALIDATION_GAP=OPEN

## Screen 2 entry gate

Screen 2 must consume createLivingShellSnapshot, the shared locale catalog, workspace identity and route navigation. It must not introduce a second header, profile model, brand model, locale state or priority selection path.

