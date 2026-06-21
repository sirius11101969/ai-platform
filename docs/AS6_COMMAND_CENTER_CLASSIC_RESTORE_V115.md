# AS6 Command Center Classic Restore V115

Purpose: restore /command-center to the clean classic AS6 interface shown in the user reference screenshot.

Removes only from /command-center:
- top AS6 Mission Control global status overlay
- Autonomous Cockpit right overlay
- extra global shell padding

Does not rewrite Dashboard, CRM, Revenue or backend logic.

Failure classes:
- COMMAND_CENTER_CLASSIC_RESTORE_MISSING
- COMMAND_CENTER_TOP_OVERLAY_DRIFT
- COMMAND_CENTER_AUTONOMOUS_COCKPIT_DRIFT
- COMMAND_CENTER_CLASSIC_LAYOUT_PADDING_DRIFT
- COMMAND_CENTER_REFERENCE_STYLE_GAP
