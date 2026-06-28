# AS6 CRM Living Space Route JSX Root Cause V88B

Root cause: V88 route insertion matched the /crm-workspace route before its JSX element was fully closed, so /as6-sales was inserted inside the CRMWorkspacePage element.

Repair: normalize the affected route block into two valid sibling routes:
- /crm-workspace -> CRMWorkspacePage
- /as6-sales -> AS6SalesShellAdapter
