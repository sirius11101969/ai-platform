# AS6 Event Bus Root Cause V101

Root cause: V100 added Runtime Orchestrator, but Runtime events are not yet exposed through a dedicated event bus for AI Copilot, Plugin SDK, navigation, workspace sync and future automation.

Risk: future modules can create isolated event listeners and duplicate event handling across Shell surfaces.

Repair: add AS6 Event Bus with emit/on/off/once/history/clear APIs and Runtime bridge foundation.
