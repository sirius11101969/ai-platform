# AS6 EPIC024 Public Brand Website Foundation AEC

Stage: AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION

Decision:

- Accept public brand website foundation.

Accepted architecture:

- `/` is the public AS6 brand website.
- `/app` is the AS6 ONE product workspace.
- `/as6-crm` is the CRM workspace inside the application.
- `/blog` and `/blog/:slug` provide local post structure without CMS.
- `/docs`, `/pricing`, `/about`, and `/contact` are public website routes.

Constraints:

- Do not make `/` a CRM page.
- Do not make `/` an internal dashboard.
- Do not change CRM business logic.
- Do not add CMS or backend blog storage in this stage.
- Do not delete legacy routes.

AEC_RESULT=ACCEPTED
