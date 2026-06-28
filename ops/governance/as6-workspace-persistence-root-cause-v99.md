# AS6 Workspace Persistence Root Cause V99

Root cause: V98 added Universal Workspace Manager, but persistent multi-session Workspace objects, export/import and versioned storage are not yet separated as a reusable storage layer.

Risk: future Workspace features can duplicate localStorage logic inside Shell, Command Palette, Navigation, Context Bar or Intelligence Rail.

Repair: add AS6 Workspace Persistence & Multi-Session Engine as a dedicated storage API with versioned sessions, export/import, clone, rename, delete and validation.
