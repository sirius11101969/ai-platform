# AS6 Universal Service Bus Contract P6

Stage: AS6_PLATFORM_V2_UNIVERSAL_SERVICE_BUS_P6

Purpose:
- Provide a shared event/command/query bus for Living Spaces, AI Actions and services.
- Prevent direct module coupling between product spaces.
- Give future Tenant Boundary and Plugin Marketplace one governed communication layer.

Required:
- registerAS6BusHandler
- dispatchAS6BusMessage
- emitAS6BusEvent
- runAS6BusCommand
- queryAS6Bus
- getAS6BusState

Message types:
- event
- command
- query
