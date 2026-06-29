# AS6 Plugin Marketplace / Extension Runtime Contract P10

Stage: AS6_PLATFORM_V2_PLUGIN_MARKETPLACE_RUNTIME_P10

Purpose:
- Make AS6 Platform V2 extensible without changing platform core.
- Allow plugins to register widgets, AI actions, bus handlers and future Living Spaces.
- Prepare Plugin Marketplace and Extension SDK.

Required:
- validateAS6PluginManifest
- installAS6Plugin
- enableAS6Plugin
- disableAS6Plugin
- removeAS6Plugin
- publishAS6MarketplacePlugin
- installAS6MarketplacePlugin
- validateAS6PluginPolicy

Plugin may provide:
- livingSpaces
- widgets
- aiActions
- busHandlers
- permissions
- capabilities
