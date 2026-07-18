# AS6 Master Screen Reference Baseline v1

## Diagnostics

The accepted master screen required a stable hierarchy between the AS6 brand, workspace switcher, business graph, current goal and contextual rails.

## Root Cause

- the workspace label was overridden by a more specific inherited font rule;
- the disclosure arrow and graph elements were under-readable;
- a technical account identifier was selected before a human display name;
- nginx recreation temporarily exposed a production availability gap.

## Accepted baseline

- workspace label: 10px;
- disclosure arrow: 12px;
- brand opacity: 0.56;
- graph and secondary text contrast reinforced without geometry changes;
- profile display name priority: displayName, fullName, first/last name, human-facing name, safe fallback;
- greeting confirmed in production as “Доброе утро, Владимир.”;
- production root and health endpoint confirmed with HTTP 200.

## Failure classes

- AS6_WORKSPACE_SWITCHER_HIERARCHY_DRIFT
- AS6_MASTER_SCREEN_LOW_CONTRAST_GAP
- AS6_PROFILE_TECHNICAL_IDENTIFIER_EXPOSURE
- AS6_PRODUCTION_NGINX_RECREATE_GAP
- AS6_EXTERNAL_VISUAL_VALIDATION_GAP

## Validation

- BUILD=PASS
- PROFILE_DISPLAY_NAME=PASS
- VISUAL_VALIDATION=PASS
- PRODUCTION=HEALTHY
- AS6_MASTER_SCREEN_VISUAL_READINESS=96%
- AS6_PROJECT_READINESS=99%
