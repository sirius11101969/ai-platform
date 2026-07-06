# AS6 Runtime Orchestrator Contract V100

Stage: AS6_RUNTIME_ORCHESTRATOR_V100

Purpose:
- Centralize Runtime API for AS6Shell.
- Prepare AI Copilot, Event Bus, Plugin SDK and synchronization.
- Prevent duplicated state logic across Navigation, Context Bar, Intelligence Rail, Command Palette and Workspace modules.

Exports:
- getAS6RuntimeState()
- dispatchAS6Runtime(action)
- setAS6RuntimeLivingSpace(pathname)
- setAS6RuntimeWorkspace(workspace)
- setAS6RuntimeContext(context)
- setAS6RuntimeSelection(selection)
- restoreAS6Runtime()
- subscribeAS6Runtime(listener)
- getAS6RuntimeSnapshot()
- exportAS6RuntimeSnapshot()
- importAS6RuntimeSnapshot(jsonText)
- validateAS6RuntimePolicy()

Validation:
- AS6_RUNTIME_ORCHESTRATOR_V100=PASS
