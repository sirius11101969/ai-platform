# AS6 Universal Widget Runtime Root Cause P7

Root cause: Platform V2 has Living Spaces, AI Context, AI Actions and Universal Service Bus, but product modules cannot yet be represented as reusable widgets with a common lifecycle.

Risk: dashboards, CRM panels, AI panels and future modules can become hardcoded UI blocks instead of composable workspace widgets.

Repair: add Universal Widget Runtime, Widget Registry, React bridge and default CRM/AI widget definitions.
