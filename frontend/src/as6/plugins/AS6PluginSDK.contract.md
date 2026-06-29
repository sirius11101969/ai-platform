# AS6 Plugin SDK Contract V109

Stage: AS6_PLUGIN_SDK_V109

Purpose:
- Provide a safe Plugin SDK foundation for future AS6 modules.
- Allow plugins to register metadata, capabilities, permissions, routes, commands and events.
- Integrate Plugin SDK with Service Registry and Event Bus without modifying AS6Shell core.

Required:
- as6PluginRegistry.js exports plugin registry functions.
- as6PluginSDK.js exports create/activate/deactivate/query helpers.
- Plugin activation emits AS6_PLUGIN_ACTIVATED event.
- Plugin SDK validates Service Registry references.

Validation:
- AS6_PLUGIN_SDK_V109=PASS
