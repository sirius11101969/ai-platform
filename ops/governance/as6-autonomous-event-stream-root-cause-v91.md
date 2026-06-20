# AS6 V91 Root Cause

Base commit: 3c037bb.
V90 added Mission Control Layout Engine and raised UX readiness to 99%.
Remaining UX gap: Mission Control needs explicit autonomous event stream and AI copilot recommendation rail as reusable global components.
Repair/prevention: add Global Event Stream and AI Copilot Rail components, mount globally, add diagnostics/control/governance, and register all event/copilot failure classes.
