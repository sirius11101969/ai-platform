# AS6 EPIC025 Public Brand Experience Governance

Stage: AS6_EPIC025_PUBLIC_BRAND_EXPERIENCE

Root cause:

- AS6_PUBLIC_BRAND_EXPERIENCE_WEAK

Failure classes:

- AS6_PUBLIC_SITE_LOW_VISUAL_IMPACT_GAP
- AS6_BLOG_VISUAL_CONTENT_GAP
- AS6_PUBLIC_CTA_CLARITY_GAP

Architecture rules:

- AS6_PUBLIC_HOME_MUST_BE_BRAND_WEBSITE
- AS6_APP_MUST_STAY_UNDER_APP_ROUTE
- AS6_BLOG_MUST_BE_VISUAL_AND_SEO_READY

Policy:

- `/` must remain public brand website UX.
- `/app` must remain the AS6 ONE workspace entrypoint.
- `/as6-crm` must remain the CRM workspace route.
- Public blog cards must retain visual content, category, date, and slug structure.
- Public brand CSS must stay scoped and must not mutate CRM business logic.
