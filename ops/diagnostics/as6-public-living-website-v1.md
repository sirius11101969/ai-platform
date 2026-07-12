# AS6 Public Living Website v1

Status: IMPLEMENTED_IN_CODE / DEPLOYMENT_PENDING

## Diagnostics

The production root currently serves the legacy dark public website and unknown or undeployed client routes fall through to the root landing experience. The approved Living Space brand language was not represented on the public website.

## Root causes

1. Public routes were owned by `AS6PublicWebsite.jsx`, which used a dark grid, card-based composition and a conventional SaaS landing-page structure.
2. `/preview/living` did not exist in the main router.
3. `/as6-living-preview` existed in source but the deployed frontend did not expose the current build.
4. Deployment evidence and SPA route validation were missing.

## Structure added

- `frontend/src/pages/AS6PublicLivingWebsite.jsx`
- `frontend/src/pages/AS6PublicLivingWebsite.css`
- `/preview/living` route in `frontend/src/App.jsx`
- public root, blog, article and information routes migrated to Living brand components

## Diagnostics added

- detect legacy dark public shell ownership on `/`;
- detect public-card-grid drift from Living Space visual language;
- detect missing `/preview/living` alias;
- detect preview route redirect to `/`;
- detect deployed-build drift from repository `main`;
- detect SPA fallback or reverse-proxy redirect drift;
- detect missing blog article route;
- detect public website without reduced-motion support;
- detect production publication without rollback evidence.

## Failure classes

- `AS6_PUBLIC_LIVING_WEBSITE_MISSING`
- `AS6_PUBLIC_LEGACY_DARK_SHELL_DRIFT`
- `AS6_PUBLIC_CARD_GRID_DRIFT`
- `AS6_LIVING_PREVIEW_ALIAS_MISSING`
- `AS6_LIVING_PREVIEW_ROOT_REDIRECT_DRIFT`
- `AS6_PUBLIC_DEPLOYED_BUILD_DRIFT`
- `AS6_PUBLIC_SPA_FALLBACK_DRIFT`
- `AS6_PUBLIC_BLOG_ROUTE_DRIFT`
- `AS6_PUBLIC_ACCESSIBILITY_MOTION_GAP`
- `AS6_PUBLIC_ROLLBACK_GAP`

## Controls

1. `/`, `/blog`, `/blog/:slug`, `/about`, `/docs`, `/pricing`, and `/contact` must use the Living public brand implementation.
2. `/preview/living` and `/as6-living-preview` must remain public preview routes and must not redirect to `/`.
3. Production publication requires build, route tests, HTTP 200 verification, visual smoke evidence, secret scan, production health and rollback evidence.
4. The old `AS6PublicWebsite.jsx` remains available as rollback until the new public website passes production validation.
5. Public visual language must inherit the Master Screen atmosphere, typography, light, geometry and calm motion.

## Current evidence

- new public website React structure: PASS
- new public website Living CSS: PASS
- root/blog/info router ownership: PASS
- `/preview/living` source route: PASS
- rollback source preserved: PASS
- build evidence: PENDING
- deployment evidence: PENDING
- public URL HTTP 200 and render evidence: PENDING

## Readiness

`AS6_PUBLIC_LIVING_WEBSITE_CODE_READINESS=100%`

`AS6_PUBLIC_LIVING_WEBSITE_PRODUCTION_READINESS=55%`
