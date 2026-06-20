# AS6 Frontend Dead Code Control V64

- Frontend dead-code cleanup requires ownership diagnostics before deletion.
- Probable unused pages, components, CSS selectors, and legacy CSS blocks must be reported first.
- No UI/CSS/layout deletion is allowed without diagnostic evidence and validation.
- Route splitting, WebP branding, and duplicate top logo guards must remain valid.
- Build and production health validation are mandatory.
