# AS6 Runtime Orchestrator Root Cause V100

Root cause: V92-V99 created Living Space Engine, Navigation, Context Bar, Intelligence Rail, Command Palette, Workspace Manager and Workspace Persistence, but Runtime state is not yet exposed through one orchestrator API.

Risk: future AI Copilot, Event Bus, Plugin SDK and Workspace synchronization can duplicate state access across Shell surfaces.

Repair: add AS6 Runtime Orchestrator as a central runtime API for state, dispatch, subscribe, snapshot and restore.
