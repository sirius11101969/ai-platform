# AS6 V127 Root Cause

V126 changed CSS but visible result did not change because bundled later styles override imported polish CSS.
Rendered HTML confirms the correct targets: command-hero, command-sidebar, sidebar-favorites, copilot-hero, command-recommendations.
Repair: inject final route-scoped style at runtime as the last style element in document.head.
