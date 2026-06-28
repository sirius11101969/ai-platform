# AS6 Event Bus AEC V101

Failure classes:
- AS6_EVENT_BUS_DRIFT
- AS6_EVENT_LISTENER_DUPLICATION_RISK
- AS6_RUNTIME_EVENT_BRIDGE_GAP
- AS6_EVENT_HISTORY_GAP
- AS6_EVENT_HANDLER_ISOLATION_GAP

AEC rules:
- Runtime events must use AS6 Event Bus.
- Event handlers must not break AS6 Runtime.
- Wildcard event subscription must remain available for Runtime bridge.
- Event history must be bounded.
- Future Copilot/Plugin modules must use Event Bus instead of isolated listeners.
