# AS6 Marketplace GA Freeze Manifest P35

GA status: AS6_MARKETPLACE_1_0_GA

Frozen components:
- frontend/src/as6/plugins/AS6PluginMarketplace.js
- frontend/src/as6/plugins/AS6PluginPackageManager.js
- frontend/src/as6/plugins/AS6PublicMarketplace.js
- frontend/src/as6/plugins/AS6DeveloperPortal.js
- frontend/src/as6/plugins/AS6MarketplaceAdministration.js
- frontend/src/as6/plugins/AS6MarketplaceProductionServices.js
- frontend/src/as6/plugins/AS6MarketplaceGA.js
- frontend/src/as6/plugins/AS6PluginTrust.js
- frontend/src/as6/plugins/AS6MarketplaceTrustPolicy.js

Freeze rule:
- New product features must be built above Platform V2 stable APIs.
- Core Marketplace API changes require diagnostics, governance, coverage and regression validation.
