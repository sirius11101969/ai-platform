# AS6 Plugin SDK Root Cause V109

Root cause: V108 added Service Registry, but AS6 still lacks a formal extension API for future modules, plugins and external integrations.

Risk: new modules can modify Shell, Runtime, Command Palette or Service Registry directly instead of using a stable extension interface.

Repair: add AS6 Plugin SDK with registry, activation lifecycle, Service Registry validation and Event Bus integration.
