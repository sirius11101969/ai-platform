import { as6LivingSpaces } from "./as6LivingSpaceRegistry";

export function getAS6LivingSpaceEngineState() {
  return {
    spaces: as6LivingSpaces.filter((space) => space.status === "active" && space.engineEnabled !== false),
    version: "V92",
  };
}

export function getAS6LivingSpaceMenuItems() {
  return getAS6LivingSpaceEngineState()
    .spaces
    .map((space) => ({
      id: space.id,
      route: space.route,
      label: space.menuLabel || space.name,
      group: space.menuGroup || "default",
      order: Number.isFinite(space.menuOrder) ? space.menuOrder : 999,
      authRequired: Boolean(space.authRequired),
    }))
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

export function getAS6ActiveLivingSpace(pathname) {
  return getAS6LivingSpaceEngineState().spaces.find((space) => space.route === pathname) || null;
}

export function validateAS6LivingSpaceEnginePolicy() {
  const failures = [];

  for (const space of as6LivingSpaces) {
    if (!space.id) failures.push("missing_id");
    if (!space.route) failures.push(`${space.id || "unknown"}_missing_route`);
    if (!space.adapter) failures.push(`${space.id || "unknown"}_missing_adapter`);
    if (space.contextBarMode !== "adaptive") failures.push(`${space.id}_context_bar_not_adaptive`);
    if (space.intelligenceRailMode !== "adaptive") failures.push(`${space.id}_intelligence_rail_not_adaptive`);
    if (!space.businessLogicPolicy) failures.push(`${space.id}_business_logic_policy_missing`);
    if (!space.menuLabel) failures.push(`${space.id}_menu_label_missing`);
    if (!space.menuGroup) failures.push(`${space.id}_menu_group_missing`);
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}
