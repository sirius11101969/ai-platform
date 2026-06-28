# AS6 ONE Shell Real Wiring AEC V86

Stage: AS6_ONE_SHELL_REAL_WIRING_V86

Diagnostic additions:
- Detect actual /as6-one route file.
- Detect AS6Shell component file.
- Detect AS6OnePage business-logic component file.
- Validate AS6OneShellAdapter.jsx exists.
- Validate adapter imports AS6Shell and AS6OnePage.
- Validate route references AS6OneShellAdapter.
- Validate Living Space target /as6-sales remains present.

Failure classes:
- AS6_ONE_SHELL_ROUTE_WIRING_DRIFT
- AS6_ONE_BUSINESS_LOGIC_REWRITE_DRIFT
- AS6_ONE_LIVING_SPACE_TARGET_MISSING
- AS6_ONE_CONTEXT_RAIL_ADAPTIVITY_GAP

AEC rules:
- /as6-one must route through AS6OneShellAdapter.
- AS6OnePage business logic must stay in the original page component.
- AS6Shell remains the single shell boundary for AS6 ONE.
- /as6-sales remains the future CRM Living Space target.
