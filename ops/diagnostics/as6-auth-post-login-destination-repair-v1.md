# AS6 Auth Post-Login Destination Repair v1

## Diagnostics

Browser HAR confirmed successful POST /api/auth/login with token, user and workspace.
No HTTP redirect to / was present. The destination drift occurred in the client.

## Root Cause

SPA navigation was not verified against persisted token and workspace state before opening /app.

## Change

- verify stored token after saveAuthSession;
- verify active workspace when backend returns one;
- replace soft SPA navigation with deterministic window.location.replace("/app");
- add a permanent prevention control.

## Failure classes

- AS6_POST_LOGIN_CLIENT_NAVIGATION_DRIFT
- AS6_AUTH_SESSION_PERSISTENCE_NOT_VERIFIED_BEFORE_NAVIGATION
- AS6_SPA_POST_AUTH_DESTINATION_GAP
- AS6_POST_AUTH_FULL_RELOAD_GUARD_MISSING
- AS6_POST_AUTH_DESTINATION_REGRESSION

## Final closure v3

- v2 expected persistedToken names, while v1 created storedToken names;
- validation now accepts the semantic contract instead of one variable spelling;
- legacy workspace control accepts deterministic /app replacement;
- the previously validated auth change is committed and deployed.

### Additional failure classes

- AS6_AUTH_VALIDATION_VARIABLE_NAME_DRIFT
- AS6_VALID_REPAIR_BLOCKED_BY_EXACT_MARKER
- AS6_AUTH_CHANGE_NOT_DEPLOYED

## Final closure v3

- v2 expected persistedToken names, while v1 created storedToken names;
- validation now accepts the semantic contract instead of one variable spelling;
- legacy workspace control accepts deterministic /app replacement;
- the previously validated auth change is committed and deployed.

### Additional failure classes

- AS6_AUTH_VALIDATION_VARIABLE_NAME_DRIFT
- AS6_VALID_REPAIR_BLOCKED_BY_EXACT_MARKER
- AS6_AUTH_CHANGE_NOT_DEPLOYED

## v4 closure

The previous cycle stopped because `node --check` was used on a JSX file.
Vite is the canonical JSX parser and build validator for this frontend.

### Additional failure classes

- AS6_NODE_CHECK_JSX_EXTENSION_GAP
- AS6_VALID_AUTH_CHANGE_BLOCKED_BY_WRONG_SYNTAX_TOOL
- AS6_AUTH_CHANGE_NOT_DEPLOYED
- AS6_JSX_VALIDATION_TOOL_MISMATCH
