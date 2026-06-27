# AS6 CRM V2 Protected Route Fix Root Cause

- Root cause: /crm-v2 was registered as a public route, unlike production workspace pages such as /crm.
- Effect: direct opening of /crm-v2 may fall outside authenticated workspace flow and appear as returning to landing.
- Resolution: wrap /crm-v2 with ProtectedRoute, matching the working /crm route pattern.
- Page changed: /crm-v2.
- Page not changed: /crm.
