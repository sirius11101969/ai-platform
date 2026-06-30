import {
  getAS6MarketplaceNavigationItem,
  getAS6MarketplaceRouteDefinition,
  AS6MarketplacePage,
} from "../../plugins/marketplace-route";

export const AS6_DYNAMIC_SHELL_REGISTRY_VERSION = "P16";

const dynamicRoutes = new Map();
const dynamicNavigation = new Map();

export function registerAS6DynamicShellRoute(route) {
  if (!route?.path) return { ok: false, error: "AS6_DYNAMIC_ROUTE_PATH_MISSING" };
  if (!route?.component) return { ok: false, error: "AS6_DYNAMIC_ROUTE_COMPONENT_MISSING" };

  dynamicRoutes.set(route.path, {
    status: "registered",
    version: AS6_DYNAMIC_SHELL_REGISTRY_VERSION,
    ...route,
  });

  return { ok: true, path: route.path };
}

export function registerAS6DynamicShellNavigation(item) {
  if (!item?.id) return { ok: false, error: "AS6_DYNAMIC_NAV_ID_MISSING" };
  if (!item?.path) return { ok: false, error: "AS6_DYNAMIC_NAV_PATH_MISSING" };

  dynamicNavigation.set(item.id, {
    status: "registered",
    version: AS6_DYNAMIC_SHELL_REGISTRY_VERSION,
    ...item,
  });

  return { ok: true, id: item.id };
}

export function bootstrapAS6DynamicShellRegistry() {
  registerAS6DynamicShellRoute({
    ...getAS6MarketplaceRouteDefinition(),
    element: AS6MarketplacePage,
  });

  registerAS6DynamicShellNavigation(getAS6MarketplaceNavigationItem());

  return getAS6DynamicShellState();
}

export function getAS6DynamicRoutes() {
  return [...dynamicRoutes.values()];
}

export function getAS6DynamicNavigation() {
  return [...dynamicNavigation.values()].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6DynamicShellState() {
  return {
    version: AS6_DYNAMIC_SHELL_REGISTRY_VERSION,
    routeCount: dynamicRoutes.size,
    navigationCount: dynamicNavigation.size,
    routes: getAS6DynamicRoutes(),
    navigation: getAS6DynamicNavigation(),
  };
}

export function validateAS6DynamicShellRegistryPolicy() {
  const state = getAS6DynamicShellState();
  const failures = [];

  if (!state.routes.find((route) => route.path === "/marketplace")) failures.push("marketplace_route_missing");
  if (!state.navigation.find((item) => item.id === "as6-marketplace")) failures.push("marketplace_navigation_missing");

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_DYNAMIC_SHELL_REGISTRY_VERSION,
  };
}
