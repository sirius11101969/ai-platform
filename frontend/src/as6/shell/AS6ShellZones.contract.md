# AS6 Shell Zones Contract V87

Stage: AS6_CONTEXT_BAR_INTELLIGENCE_RAIL_CONTRACT_V87

Purpose:
- Keep Context Bar and Intelligence Rail as shell-level adaptive zones.
- Prevent Living Spaces from duplicating shell UI logic.
- Prepare CRM migration into /as6-sales without rewriting CRM business logic.

Shell zones:
- Context Bar: adaptive workspace context, route-aware, user-task-aware.
- Intelligence Rail: adaptive assistant/intelligence surface, route-aware, user-task-aware.

Required adapter policy:
- Every Living Space adapter must declare contextBarMode="adaptive".
- Every Living Space adapter must declare intelligenceRailMode="adaptive".
- Every Living Space adapter must preserve existing page business logic.
- Future CRM Living Space target remains /as6-sales.

Current validated adapter:
- /as6-one -> AS6OneShellAdapter -> AS6Shell.

Validation:
- AS6_CONTEXT_BAR_INTELLIGENCE_RAIL_CONTRACT_V87=PASS
