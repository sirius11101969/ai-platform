# AS6 V88 Root Cause

Base commit: 2b3159e.
V87 completed frontend architecture audit and raised UX readiness to 93%.
Remaining UX gap: the project needs a reusable global status layer visible across pages, not only page-specific cards.
Repair/prevention: add AS6 Global Health Bar component with production, diagnostics, governance, registry, UX and autonomy status, mounted once globally.
