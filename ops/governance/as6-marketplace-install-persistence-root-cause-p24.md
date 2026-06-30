# AS6 Marketplace Install Persistence Root Cause P24

Root cause: Plugin install/enable/disable/remove state existed only in memory.

Repair: add runtime persistence and restore helpers for plugin install state.
