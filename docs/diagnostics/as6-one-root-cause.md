# AS6 ONE Root Cause

## Diagnostics
The existing CRM routes are production-protected and must not be replaced before visual owner approval.

## Root Cause
AS6 needs a premium Autonomous Enterprise Lifeform interface for review, while `/crm` and `/crm-v2` must remain stable.

## Change Plan
Add a separate React page and isolated CSS, route it through `/as6-one`, `/crm-enterprise`, and `/crm-v3`, and use a local static data layer until real CRM data is explicitly connected.
