# AS6 CRM Living Space Adapter AEC V88

Stage: AS6_CRM_LIVING_SPACE_ADAPTER_V88

Failure classes:
- AS6_CRM_LIVING_SPACE_ROUTE_DRIFT
- AS6_CRM_BUSINESS_LOGIC_REWRITE_RISK
- AS6_CRM_SHELL_ADAPTER_MISSING
- AS6_CRM_CONTEXT_RAIL_POLICY_GAP
- AS6_SALES_ROUTE_REGRESSION

AEC rules:
- /as6-sales must route through AS6SalesShellAdapter.
- AS6SalesShellAdapter must wrap existing CRM page logic with AS6Shell.
- CRM business logic must remain in the existing CRM page/component files.
- Context Bar and Intelligence Rail must remain adaptive shell-level zones.
- /as6-sales must build successfully before push.
