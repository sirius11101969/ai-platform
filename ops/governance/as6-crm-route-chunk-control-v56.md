# AS6 CRM Route Chunk Control V56

- CRMPage.jsx and AiWorkersPage.jsx must be lazy-loaded from App.jsx.
- CRM and AI Workers must have explicit Vite manual chunks.
- Static imports for heavy CRM and AI Workers pages are forbidden.
- Suspense fallback is required for lazy routes.
- Build and production health validation are mandatory.
