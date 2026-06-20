# AS6 UI Refactor Roadmap V87

Project readiness: 100%
UX readiness before V87: 92%
Expected UX readiness after executing V88-V92: 96-98%

## Next stages

### V88 Global Health Bar
- Add one reusable health strip across all major pages.
- Show Production, Diagnostics, Governance, Registry, AI Workforce and CRM status.

### V89 Command Palette
- Add Ctrl+K command launcher.
- Search CRM, dashboards, diagnostics, workforce, approvals and commands.

### V90 Copilot Rail
- Add reusable right-side AS6 Copilot panel.
- Contextual recommendations per page.

### V91 Realtime Event Stream
- Add compact activity/timeline component.
- Surface deploys, diagnostics, approvals, AI actions and incidents.

### V92 Widget Layout Engine
- Add reusable widget grid and compact dashboard cards.
- Prepare role-based layouts and personalization.

## Guardrails
- No blind CSS-over-CSS changes after V87.
- Every new UI component must be registered in diagnostics, coverage, governance, state and detected errors.
- Build, health, enforcement guard and secret scan must pass before push.
