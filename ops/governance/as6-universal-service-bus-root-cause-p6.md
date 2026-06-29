# AS6 Universal Service Bus Root Cause P6

Root cause: AS6 Platform V2 now has Living Space Runtime, AI Context Engine and AI Action Engine, but product modules still lack a shared event/command/query communication layer.

Risk: CRM, AI, Finance, Projects and future Living Spaces can drift into direct imports and tight coupling.

Repair: add Universal Service Bus with event, command and query routing plus Living Space bridge and AI Action integration.
