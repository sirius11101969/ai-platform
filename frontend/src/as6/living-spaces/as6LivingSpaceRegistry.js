export const AS6_LIVING_SPACE_REGISTRY_VERSION = "V90";

export const as6LivingSpaces = [
  {
    id: "as6-one",
    route: "/as6-one",
    name: "AS6 ONE",
    menuLabel: "AS6 ONE",
    menuGroup: "core",
    menuOrder: 10,
    adapter: "AS6OneShellAdapter",
    adapterPath: "frontend/src/as6-one/AS6OneShellAdapter.jsx",
    shell: "AS6Shell",
    contextBarMode: "adaptive",
    intelligenceRailMode: "adaptive",
    businessLogicPolicy: "preserve-existing-page-logic",
    engineEnabled: true,
    status: "alias",
    authRequired: false,
    redirectTo: "/app",
    architectureRule: "AS6_APP_WORKSPACE_MUST_BE_UNDER_APP_ROUTE",
  },
  {
    id: "as6-crm",
    route: "/as6-crm",
    name: "AS6 CRM",
    menuLabel: "AS6 CRM",
    menuGroup: "business",
    menuOrder: 20,
    adapter: "AS6CrmShellAdapter",
    adapterPath: "frontend/src/as6-crm/AS6CrmShellAdapter.jsx",
    shell: "AS6Shell",
    contextBarMode: "adaptive",
    intelligenceRailMode: "adaptive",
    businessLogicPolicy: "reuse-existing-crm-api-and-runtime-no-legacy-ui",
    engineEnabled: true,
    status: "active",
    authRequired: false,
    rollbackRoute: "/as6-sales",
    architectureRule: "AS6_SINGLE_PUBLIC_CRM_ENTRYPOINT_RULE",
  },
  {
    id: "as6-sales",
    route: "/as6-sales",
    name: "AS6 Sales",
    menuLabel: "AS6 Sales Rollback",
    menuGroup: "business",
    menuOrder: 90,
    adapter: "AS6SalesShellAdapter",
    adapterPath: "frontend/src/as6-sales/AS6SalesShellAdapter.jsx",
    shell: "AS6Shell",
    contextBarMode: "adaptive",
    intelligenceRailMode: "adaptive",
    businessLogicPolicy: "preserve-existing-crm-logic",
    engineEnabled: true,
    status: "active",
    authRequired: false,
    rollbackFor: "/as6-crm",
  },
];

export function getAS6LivingSpaces() {
  return as6LivingSpaces;
}

export function getAS6LivingSpaceByRoute(route) {
  return as6LivingSpaces.find((space) => space.route === route) || null;
}

export function getAS6LivingSpaceById(id) {
  return as6LivingSpaces.find((space) => space.id === id) || null;
}
