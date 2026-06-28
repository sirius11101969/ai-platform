# AS6 Living Space Registry AEC V90

Stage: AS6_LIVING_SPACE_REGISTRY_V90

Failure classes:
- AS6_LIVING_SPACE_REGISTRY_DRIFT
- AS6_MANUAL_ROUTE_DRIFT
- AS6_LIVING_SPACE_ADAPTER_POLICY_DRIFT
- AS6_LIVING_SPACE_CONTEXT_RAIL_POLICY_DRIFT
- AS6_LIVING_SPACE_BUSINESS_LOGIC_POLICY_MISSING

AEC rules:
- Every Living Space must be registered in as6LivingSpaceRegistry.js.
- Every Living Space must declare route, adapter and shell policy.
- Every Living Space must keep Context Bar and Intelligence Rail adaptive.
- Every Living Space must declare business logic preservation policy.
- Until registry-driven routing is implemented, App.jsx routes must match registry routes.
