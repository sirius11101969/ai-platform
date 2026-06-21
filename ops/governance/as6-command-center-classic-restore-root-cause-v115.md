# AS6 V115 Root Cause

User wants https://www.as6.ru/command-center restored to the clean classic AS6 Command Center shown in the reference screenshot.
Root cause: later global Mission Control overlays added top status bar and Autonomous Cockpit on Command Center, changing the preferred classic layout.
Repair: add a targeted Command Center Classic Restore layer that hides only the unwanted global overlay/cockpit on /command-center without touching other pages.
