# AS6 V86 Root Cause

Base commit: e43c5f8.
V85 introduced global AS6 Mission Control visual tokens and raised UX readiness to 85%.
Remaining UX gap: pages still need a unified workspace layer for compact density, visual hierarchy, sticky cockpit behavior, cross-page command-center feel, better mobile spacing and less debug-like presentation.
Repair/prevention: add AS6 Mission Control Workspace layer, import it globally, and add diagnostics/control/governance to prevent workspace UX drift.
