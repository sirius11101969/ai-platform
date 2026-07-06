# AS6 Event Bus Contract V101

Stage: AS6_EVENT_BUS_V101

Purpose:
- Provide a shared event system for AS6 Runtime.
- Prepare AI Copilot, Plugin SDK, workspace sync and automation.
- Prevent duplicated event listener logic across shell modules.

Exports:
- emitAS6Event(eventName, payload, meta)
- onAS6Event(eventName, handler)
- onceAS6Event(eventName, handler)
- offAS6Event(eventName, handler)
- getAS6EventHistory(limit)
- clearAS6EventHistory()
- getAS6EventBusState()
- createAS6RuntimeEventBridge(dispatchAS6Runtime)
- validateAS6EventBusPolicy()

Validation:
- AS6_EVENT_BUS_V101=PASS
