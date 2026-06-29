# AS6 Plugin Loader Contract V111

Stage: AS6_PLUGIN_LOADER_V111

Purpose:
- Load, validate, resolve dependencies, activate, unload and reload AS6 plugins.
- Use Plugin SDK, Service Registry, Dependency Graph and Event Bus.
- Prevent direct plugin activation outside the loader.

Lifecycle:
- VALIDATING
- RESOLVING_DEPENDENCIES
- LOADING
- ACTIVE
- FAILED
- UNLOADED

Required:
- as6PluginLoader.js exports loadAS6Plugin.
- as6PluginLoader.js exports unloadAS6Plugin.
- as6PluginLoader.js exports loadAllAS6Plugins.
- as6PluginLoader.js exports reloadAS6Plugin.
- as6PluginLoader.js exports validateAS6PluginLoaderPolicy.

Validation:
- AS6_PLUGIN_LOADER_V111=PASS
