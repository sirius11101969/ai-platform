# AS6 Living Auth Boundary v1

## Diagnostics
The primary Living Space routes were reachable without a centralized auth boundary, while a legacy guard still read the obsolete as6-token key.

## Root Cause
Authentication had multiple sources of truth and the login flow did not preserve the requested protected destination.

## Change
- protect /app and /app/* through the current AuthContext;
- redirect unauthenticated access to /login with a safe next parameter;
- restore only destinations beginning with /app after login;
- reconcile AS6RouteAuth with getAuthToken();
- remove the obsolete as6-token lookup;
- add a permanent prevention control.

## Failure classes
- AS6_PRIMARY_APP_ROUTE_UNGUARDED
- AS6_LEGACY_AUTH_TOKEN_KEY_DRIFT
- AS6_AUTH_GUARD_SOURCE_OF_TRUTH_DIVERGENCE
- AS6_UNAUTHENTICATED_APP_DIRECT_ACCESS_GAP
- AS6_AUTH_RETURN_DESTINATION_MISSING
- AS6_BROWSER_ROUTE_AUTH_VALIDATION_GAP

## Validation repair v2
The auth boundary source change passed build and its own control, but the previous exact-route control still required unguarded route elements.

### Additional root cause
A valid security wrapper changed the route element contract without reconciling the older route-ownership control in the same cycle.

### Additional failure classes
- AS6_EXACT_ROUTE_CONTROL_AUTH_WRAPPER_DRIFT
- AS6_VALID_AUTH_BOUNDARY_BLOCKED_BY_LEGACY_CONTROL
- AS6_SILENT_CONTROL_CONTRACT_FAILURE
- AS6_AUTH_BOUNDARY_NOT_COMMITTED_AFTER_VALIDATION

## v3 control reconciliation
The legacy post-login control required only the old static /app destination. It now accepts the safe requestedDestination contract and continues to verify token and workspace persistence.

### Additional failure classes
- AS6_POST_LOGIN_CONTROL_SAFE_DESTINATION_DRIFT
- AS6_VALID_AUTH_BOUNDARY_BLOCKED_BY_LITERAL_DESTINATION_CONTROL
- AS6_SILENT_POST_LOGIN_CONTROL_FAILURE
- AS6_AUTH_BOUNDARY_VALIDATED_NOT_COMMITTED
