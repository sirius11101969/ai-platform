export const AS6_MARKETPLACE_NAVIGATION_VERSION = "P15";

export const as6MarketplaceNavigationItem = {
  id: "as6-marketplace",
  title: "Marketplace",
  path: "/marketplace",
  icon: "extensions",
  group: "platform",
  order: 900,
  capability: "plugins",
  description: "Manage AS6 plugins, SDK compatibility and Developer Console.",
};

export function getAS6MarketplaceNavigationItem() {
  return as6MarketplaceNavigationItem;
}

export function getAS6MarketplaceRouteDefinition() {
  return {
    path: as6MarketplaceNavigationItem.path,
    title: as6MarketplaceNavigationItem.title,
    component: "AS6MarketplacePage",
    version: AS6_MARKETPLACE_NAVIGATION_VERSION,
  };
}
