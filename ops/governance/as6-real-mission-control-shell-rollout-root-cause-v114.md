# AS6 V114 Root Cause

Base commit: dfda1a7.
Screenshot evidence shows Command Center uses the AS6 brand shell, but Dashboard and other pages still show the legacy AI-OS shell.
Root cause: V97-V113 added governance, diagnostics and style contracts, but did not physically mount the same AS6 Mission Control sidebar/header shell across non-command-center pages.
Repair/prevention: add real global AS6 Mission Control Shell adapter, force the Command Center nav entry onto legacy pages, shift page content under the unified shell, and add diagnostics preventing visual shell drift.
