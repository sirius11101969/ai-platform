# AS6 V100 Root Cause

Base commit: 53d9dd2.
V99 migrated real page components to 85% shell migration coverage.
Remaining gap: direct page rewrite needs explicit page-level markers, shell adapter framework and diagnostics so CRM, Dashboard, Revenue and Workers are governed as AS6UnifiedPageShell pages.
Repair/prevention: add direct page rewrite framework, migrate real page files with safe markers, register diagnostics/control/governance and rewrite drift classes.
