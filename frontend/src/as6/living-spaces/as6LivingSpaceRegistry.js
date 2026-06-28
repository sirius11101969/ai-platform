export const AS6_LIVING_SPACE_REGISTRY_VERSION = "V90";

export const as6LivingSpaces = [
  {
    id: "as6-one",
    route: "/as6-one",
    name: "AS6 ONE",
    adapter: "AS6OneShellAdapter",
    adapterPath: "frontend/src/as6-one/AS6OneShellAdapter.jsx",
    shell: "AS6Shell",
    contextBarMode: "adaptive",
    intelligenceRailMode: "adaptive",
    businessLogicPolicy: "preserve-existing-page-logic",
    status: "active",
    authRequired: true,
  },
  {
    id: "as6-sales",
    route: "/as6-sales",
    name: "AS6 Sales",
    adapter: "AS6SalesShellAdapter",
    adapterPath: "frontend/src/as6-sales/AS6SalesShellAdapter.jsx",
    shell: "AS6Shell",
    contextBarMode: "adaptive",
    intelligenceRailMode: "adaptive",
    businessLogicPolicy: "preserve-existing-crm-logic",
    status: "active",
    authRequired: false,
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
