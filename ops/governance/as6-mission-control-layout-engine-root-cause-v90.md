# AS6 V90 Root Cause

Base commit: 27b73f5.
V89 added the Global Command Palette and raised UX readiness to 97%.
Remaining UX gap: platform pages still need one Mission Control layout engine for cockpit context, right rail, event stream and executive summary.
Repair/prevention: add AS6 Mission Control Layout Engine component and CSS, mount globally, and register diagnostics/controls/governance to prevent cross-page layout drift.
