# AS6 Universal Service Bus AEC P6

Failure classes:
- AS6_UNIVERSAL_SERVICE_BUS_DRIFT
- AS6_BUS_HANDLER_NOT_FOUND
- AS6_BUS_MESSAGE_INVALID
- AS6_DIRECT_MODULE_COUPLING_RISK
- AS6_AI_ACTION_BUS_GAP

AEC rules:
- Living Spaces should communicate through Universal Service Bus.
- AI Actions should publish commands through Universal Service Bus.
- Bus messages must have type and name.
- Bus handlers must be registered before dispatch.
