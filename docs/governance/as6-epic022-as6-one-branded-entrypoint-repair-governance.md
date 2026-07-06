# AS6 EPIC022 AS6 ONE Branded Entrypoint Repair Governance

Stage: AS6_EPIC022_AS6_ONE_BRANDED_LANDING_AND_ROUTE_REPAIR

Root cause:

- AS6_ONE_BRANDED_ENTRYPOINT_NOT_CONNECTED

Failure classes:

- AS6_PRODUCTION_ROUTE_NOT_VISIBLE_GAP
- AS6_LANDING_OLD_BRAND_DRIFT
- AS6_CRM_ONE_ROUTE_DEPLOYMENT_GAP

Rules:

- `/` must render the existing AS6 ONE branded shell.
- `/as6-crm` must be an explicit route to the existing CRM ONE shell.
- `/crm` is not a new primary CRM surface; it renders the same legacy rollback shell as `/as6-sales`.
- nginx SPA fallback must keep backend `/api` proxying intact.
- Old CRM pages may remain only as rollback paths.

Validation:

- Frontend production build must pass.
- Local preview routes `/`, `/as6-crm`, `/crm`, `/as6-sales` must return the SPA entrypoint.
- Chromium rendered DOM must confirm AS6 ONE on `/` and CRM ONE on `/as6-crm`.
