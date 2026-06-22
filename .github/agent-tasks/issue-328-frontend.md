# AS6 Agent Task

Source issue: #328
Agent: frontend

## Task

Issue #328: AS6 Command Center global wildcard CSS pseudo-element caused horizontal strip

Detected error for AS6 Diagnostics Registry.

Failure class: GLOBAL_WILDCARD_CSS_PSEUDOELEMENT_COLLISION

Root cause:
A global CSS selector in frontend/src/styles/as6-mission-control.css used wildcard class matching with decorative pseudo-elements. Selectors with class contains metric/stat matched the Command Center element goal-stats and rendered a decorative pseudo-element line.

Impact:
A visible horizontal neon strip appeared on the Command Center page and broke the visual etalon.

Fix commit: 2bc246a

Fix summary:
- Removed unsafe wildcard pseudo-element selectors from as6-mission-control.css.
- Added Command Center protection for goal-stats pseudo-elements.
- Removed stale broken V175 import from frontend/src/main.jsx.

Prevention controls to register:
- Diagnostic check for global wildcard selectors using before/after pseudo-elements in shared theme files.
- Failure class registration: GLOBAL_WILDCARD_CSS_PSEUDOELEMENT_COLLISION.
- Coverage registration: CSS_WILDCARD_PSEUDOELEMENT_COLLISION.
- Rule: decorative pseudo-elements must be explicitly scoped to page/module, never broadly applied with class wildcard selectors in shared CSS.

Status:
Build PASS. Deploy PASS. Health OK. Secret scan PASS. Visual issue resolved by commit 2bc246a.

AS6 rules:
- Work through PR only.
- Do not mutate production.
- Do not expose secrets.
- Follow diagnostics-first workflow.
- If a recurring issue is found, recommend or add a diagnostic.

## AS6 Rules

- PR only
- No production mutation without diagnostics
- No secret exposure
- Diagnostics-first workflow
- Add recurring checks to diagnostics