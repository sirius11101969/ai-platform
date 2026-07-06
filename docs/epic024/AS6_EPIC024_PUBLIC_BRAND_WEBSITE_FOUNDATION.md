# AS6 EPIC024 Public Brand Website Foundation

Stage: AS6_EPIC024_PUBLIC_BRAND_WEBSITE_FOUNDATION

Root cause:

- AS6_PUBLIC_WEBSITE_ENTRYPOINT_MISSING

## Implemented Public Routes

- `/` renders the public AS6 brand website.
- `/blog` renders a local blog index.
- `/blog/:slug` renders local demo blog posts through slug structure.
- `/docs` renders public documentation foundation.
- `/pricing` renders public pricing foundation.
- `/about` renders public project foundation.
- `/contact` renders public contact foundation.
- `/app` renders the AS6 ONE product workspace.
- `/as6-crm` remains the CRM workspace inside the application.

## Website Foundation

- Public navigation: Products, Blog, Docs, Pricing, About, Contact.
- CTA: Open App -> `/app`.
- CRM link -> `/as6-crm`.
- Hero: AI Operating System for Business.
- Product cards: CRM, AI Assistant, Revenue, Analytics, Automation, Documents.
- Blog foundation: local post array, image cards, slug routes, no CMS and no backend.

## Constraints

- `/` is not CRM.
- `/` is not an internal dashboard.
- CRM business logic was not changed.
- Existing legacy routes were not deleted.

NEXT_STAGE=AS6_EPIC024_PUBLIC_WEBSITE_VISUAL_VALIDATION
