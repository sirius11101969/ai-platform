export function resolvePanelTree(registry) {
  const regions = registry.listRegions();
  const slots = registry.listSlots();
  const panels = registry.listPanels();
  return regions.map((region) => {
    const regionSlots = slots.filter((slot) => slot.region === region.id);
    return {
      ...region,
      slots: regionSlots.map((slot) => ({
        ...slot,
        panels: panels.filter((panel) => panel.region === region.id && panel.slot === slot.id && panel.visible),
      })),
    };
  });
}

export function resolvePanelHealth(registry) {
  const regions = registry.listRegions();
  const slots = registry.listSlots();
  const panels = registry.listPanels();
  const slotKeys = panels.map((panel) => `${panel.region}:${panel.slot}:${panel.id}`);
  return {
    regions: regions.length,
    slots: slots.length,
    panels: panels.length,
    hasRightRail: regions.some((region) => region.id === "rightRail"),
    hasDuplicatePanelPlacements: new Set(slotKeys).size !== slotKeys.length,
  };
}
