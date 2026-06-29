# AS6 Plugin Registry & Discovery Engine Contract P13

Stage: AS6_PLATFORM_V2_PLUGIN_REGISTRY_DISCOVERY_P13

Purpose:
- Discover available plugins.
- Validate SDK compatibility.
- Detect duplicate plugin IDs.
- Keep a registry state for Marketplace and Developer Console.

Required:
- createAS6PluginDiscoveryIndex
- getAS6DiscoverablePlugins
- getAS6InvalidPlugins
- refreshAS6PluginRegistry
- getAS6PluginRegistryState
- getAS6RegisteredPluginIds
- findAS6PluginInRegistry
- validateAS6PluginRegistryPolicy
