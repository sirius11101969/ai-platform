# AS6 EPIC024 Public Brand Website Foundation Governance

Stage: AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION

Root cause:

- AS6_PUBLIC_WEBSITE_ENTRYPOINT_MISSING

Failure classes:

- AS6_LANDING_APP_MIXED_WITH_PUBLIC_SITE_GAP
- AS6_BLOG_CONTENT_ENGINE_MISSING_GAP
- AS6_PUBLIC_BRAND_NAVIGATION_GAP

Architecture rules:

- AS6_ROOT_MUST_BE_PUBLIC_BRAND_WEBSITE
- AS6_APP_WORKSPACE_MUST_BE_UNDER_APP_ROUTE
- AS6_BLOG_MUST_SUPPORT_SEO_POST_STRUCTURE

Policy:

- `/` must remain a public branded AS6 website, not CRM and not an internal dashboard.
- AS6 ONE application workspace must live under `/app`.
- CRM application workspace remains under `/as6-crm`.
- Blog routes must preserve slug-ready structure for future SEO content.
- CMS/backend blog integration requires a separate approved stage.
