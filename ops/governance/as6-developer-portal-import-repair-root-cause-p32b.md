# AS6 Developer Portal Import Repair P32B

Root cause: Developer Portal imported Platform V2 SDK helpers from legacy plugins/as6PluginSDK.js instead of sdk/plugin/AS6PluginSDK.js.

Repair: import defineAS6Plugin and validateAS6PluginSDKCompatibility from frontend/src/as6/sdk/plugin/AS6PluginSDK.js.
