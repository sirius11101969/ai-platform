# AS6 Real Mission Control Shell Rollout V114

Base commit: dfda1a7.

Purpose: physically mount the AS6 Command Center brand shell across legacy non-command-center pages.

Real visible changes:
- Adds Command Center nav entry to all legacy pages.
- Adds AS6 branded sidebar to all non-command-center pages.
- Adds AS6 welcome header, live-ready/API chips, search, notifications and profile actions.
- Shifts old page content under the unified shell.
- Prevents legacy AI-OS shell drift.

Failure classes:
- REAL_MISSION_CONTROL_SHELL_MISSING
- LEGACY_AI_OS_SHELL_DRIFT
- COMMAND_CENTER_NAV_MISSING
- GLOBAL_AS6_SIDEBAR_MISSING
- GLOBAL_AS6_HEADER_MISSING
- SHELL_CONTENT_OFFSET_GAP
- VISUAL_MIGRATION_FALSE_POSITIVE
- NON_COMMAND_CENTER_PAGE_SHELL_GAP
