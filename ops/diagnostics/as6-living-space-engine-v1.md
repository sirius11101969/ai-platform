# AS6 Living Space Engine v1

## Diagnostics
Living product spaces were hard-coded in one shell and new spaces required duplicated interface construction.

## Root Cause
Navigation metadata, state selection and visual composition had no shared executable registry and engine contract.

## Change
- added one registry for twelve product spaces;
- added a reusable spatial engine;
- preserved specialized Home, AI, CRM, Projects, Documents and Knowledge states;
- added executable Focus, Sales, Finance, Team, Marketing and Analytics spaces;
- added responsive and reduced-motion behavior.

## Failure classes
- AS6_LIVING_SPACE_ENGINE_MISSING
- AS6_SPACE_DEFINITION_HARDCODED_IN_SHELL
- AS6_NEW_SPACE_LAYOUT_DUPLICATION_RISK
- AS6_SPACE_VISUAL_GRAMMAR_REUSE_GAP
- AS6_SPACE_REGISTRY_COVERAGE_GAP
- AS6_TWELVE_SPACE_ROADMAP_NOT_EXECUTABLE
