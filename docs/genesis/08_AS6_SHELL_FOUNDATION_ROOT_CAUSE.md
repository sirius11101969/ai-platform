# AS6 Shell Foundation Root Cause

AS6 Genesis Foundation created the architecture and directory structure, but the platform still lacks reusable shell components.

Root cause:
- New branded pages are currently implemented as isolated screens.
- Without AS6Shell, future Living Spaces may drift visually and structurally.
- The platform needs reusable Navigation, Context Bar, Workspace, Intelligence Rail and Pulse zones.

Resolution:
- Add non-invasive AS6Shell component foundation.
- Add placeholder platform zones.
- Do not connect to production routes yet.
- Do not change /crm, /command-center or /as6-one.
