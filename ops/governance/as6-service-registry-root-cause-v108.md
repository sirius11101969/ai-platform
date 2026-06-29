# AS6 Service Registry Root Cause V108

Root cause: AS6 has Runtime, Event Bus, Workspace and Living Spaces, but product services are still spread across pages, command lists and routes.

Risk: service metadata can be duplicated across Navigation, Command Palette, Workspace, permissions and future Plugin SDK.

Repair: add AS6 Service Registry and Service Engine as the single source of truth for product services.
