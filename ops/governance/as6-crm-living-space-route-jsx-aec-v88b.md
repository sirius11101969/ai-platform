# AS6 CRM Living Space Route JSX AEC V88B

Failure classes:
- AS6_ROUTE_JSX_NESTING_DRIFT
- AS6_ROUTE_PATCHER_PARTIAL_ELEMENT_MATCH
- AS6_CRM_WORKSPACE_ROUTE_CORRUPTION
- AS6_SALES_ROUTE_INSERTION_SYNTAX_DRIFT

AEC rules:
- Route insertion must not match partially closed JSX elements.
- /crm-workspace and /as6-sales must be sibling Route elements.
- Build validation is mandatory after route patching.
