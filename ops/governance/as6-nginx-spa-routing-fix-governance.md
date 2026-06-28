# AS6 Nginx SPA Routing Fix Governance

- Rule: React SPA routes must be served through index.html fallback.
- Rule: Nginx production root must point to the built frontend dist directory.
- Rule: Nginx config changes must be backed up before modification.
- Failure class: nginx-spa-route-fallback-missing.
- AEC rule: frontend-route-requires-nginx-index-html-fallback.
