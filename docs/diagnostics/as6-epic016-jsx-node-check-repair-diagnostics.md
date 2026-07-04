# AS6 EPIC016 JSX Node Check Repair Diagnostics

DIAGNOSTIC=AS6_EPIC016_CRM_FOLLOWUPS_UI_WIRING_JSX_NODE_CHECK_REPAIR
RESULT=PASS
PROJECT_READINESS=99%

## Root Cause

The first UI wiring cycle attempted node --check on a JSX file. Node.js in this environment does not accept .jsx as a direct syntax-check target, so JSX validation must be performed through the frontend build pipeline.

## Failure Class Added

AS6_JSX_NODE_CHECK_UNSUPPORTED_EXTENSION_GAP — Node.js cannot be used as the direct syntax checker for .jsx files in this environment.

## Prevention Control

Do not run node --check directly on .jsx files; validate JSX through npm frontend build or a JSX-aware parser.
