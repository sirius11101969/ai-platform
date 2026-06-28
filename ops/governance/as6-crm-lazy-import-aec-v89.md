# AS6 CRM Lazy Import AEC V89

Failure classes:
- AS6_CRM_DUPLICATE_DYNAMIC_STATIC_IMPORT_DRIFT
- AS6_CRM_DIRECT_ROUTE_ENTRY_DRIFT
- AS6_CRM_CHUNK_SPLIT_REGRESSION
- AS6_SALES_ADAPTER_ENTRY_BYPASS

AEC rules:
- CRM must enter through /as6-sales -> AS6SalesShellAdapter.
- App.jsx must not lazy import CRMPage directly.
- CRMWorkspacePage may own CRMPage composition.
- Build output must not contain the Vite duplicate dynamic/static CRMPage warning.
