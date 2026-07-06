# AS6 EPIC024 Public Brand Website Foundation Diagnostics

Stage: AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION

Diagnostics:

- `frontend/src/App.jsx` route `/` renders `AS6PublicHomePage`.
- `frontend/src/App.jsx` route `/app` renders `AS6OneShellAdapter`.
- `frontend/src/App.jsx` routes `/blog`, `/blog/:slug`, `/docs`, `/pricing`, `/about`, and `/contact` are registered.
- `frontend/src/App.jsx` route `/crm` still redirects to `/as6-crm`.
- `frontend/src/as6/living-spaces/as6LivingSpaceRegistry.js` keeps `/as6-crm` as the application CRM workspace.
- `frontend/src/as6/living-spaces/as6LivingSpaceRegistry.js` redirects legacy `/as6-one` to `/app`.
- Blog content is local in `frontend/src/pages/AS6PublicWebsite.jsx`.
- CMS/backend integration was not added.

Root cause:

- AS6_PUBLIC_WEBSITE_ENTRYPOINT_MISSING

Failure classes:

- AS6_LANDING_APP_MIXED_WITH_PUBLIC_SITE_GAP
- AS6_BLOG_CONTENT_ENGINE_MISSING_GAP
- AS6_PUBLIC_BRAND_NAVIGATION_GAP

Result:

- AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION_DIAGNOSTICS=PASS
