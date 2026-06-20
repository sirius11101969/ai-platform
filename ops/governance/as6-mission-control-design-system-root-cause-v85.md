# AS6 V85 Root Cause

Base commit: 72a8af7.
Project readiness is 100%, but UI screenshots show visual drift between Command Center, Dashboard, CRM, Workforce, Approval, Execution and Executive Brain.
Root cause: pages use inconsistent layout density, cards, gradients, spacing, typography and status patterns instead of one AS6 Mission Control design system.
Repair/prevention: add global AS6 Mission Control UI system, import it once, add diagnostics/control/governance to prevent future UI design drift.
