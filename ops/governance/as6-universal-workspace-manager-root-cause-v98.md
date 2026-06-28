# AS6 Universal Workspace Manager Root Cause V98

Root cause: AS6Shell now has Navigation, Context Bar, Intelligence Rail, responsive layout and Global Command Palette, but each shell surface can still evolve separate workspace/session logic.

Risk: recent spaces, pinned spaces, history and active workspace state can become duplicated across Navigation, Command Palette, Context Bar and Intelligence Rail.

Repair: add AS6 Universal Workspace Manager as a shared API for active workspace, recent workspaces, pinned workspaces, workspace history and local session persistence.
