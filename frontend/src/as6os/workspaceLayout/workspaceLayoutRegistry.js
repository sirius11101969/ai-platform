import { defineAS6WorkspaceRegion, defineAS6WorkspaceSlot, AS6_WORKSPACE_REGION_IDS } from './workspaceLayoutContract.js';

export const as6WorkspaceLayoutRegions = [
  defineAS6WorkspaceRegion({ id: AS6_WORKSPACE_REGION_IDS.header, label: 'Header', order: 10, slots: ['workspace.header.primary'] }),
  defineAS6WorkspaceRegion({ id: AS6_WORKSPACE_REGION_IDS.sidebar, label: 'Sidebar', order: 20, slots: ['workspace.sidebar.navigation'] }),
  defineAS6WorkspaceRegion({ id: AS6_WORKSPACE_REGION_IDS.main, label: 'Main', order: 30, slots: ['workspace.main.content'] }),
  defineAS6WorkspaceRegion({ id: AS6_WORKSPACE_REGION_IDS.rightRail, label: 'Right Rail', order: 40, slots: ['workspace.rightRail.assistant'] }),
  defineAS6WorkspaceRegion({ id: AS6_WORKSPACE_REGION_IDS.footer, label: 'Footer', order: 50, slots: ['workspace.footer.status'], availability: 'optional' }),
];

export const as6WorkspaceLayoutSlots = [
  defineAS6WorkspaceSlot({ id: 'workspace.header.primary', regionId: AS6_WORKSPACE_REGION_IDS.header, order: 10 }),
  defineAS6WorkspaceSlot({ id: 'workspace.sidebar.navigation', regionId: AS6_WORKSPACE_REGION_IDS.sidebar, order: 10 }),
  defineAS6WorkspaceSlot({ id: 'workspace.main.content', regionId: AS6_WORKSPACE_REGION_IDS.main, order: 10 }),
  defineAS6WorkspaceSlot({ id: 'workspace.rightRail.assistant', regionId: AS6_WORKSPACE_REGION_IDS.rightRail, order: 10 }),
  defineAS6WorkspaceSlot({ id: 'workspace.footer.status', regionId: AS6_WORKSPACE_REGION_IDS.footer, order: 10, availability: 'optional' }),
];

export const as6WorkspaceLayoutRegistry = {
  regions: new Map(as6WorkspaceLayoutRegions.map((region) => [region.id, region])),
  slots: new Map(as6WorkspaceLayoutSlots.map((slot) => [slot.id, slot])),
};

export function registerAS6WorkspaceRegion(region) {
  const nextRegion = defineAS6WorkspaceRegion(region);
  as6WorkspaceLayoutRegistry.regions.set(nextRegion.id, nextRegion);
  return nextRegion;
}

export function registerAS6WorkspaceSlot(slot) {
  const nextSlot = defineAS6WorkspaceSlot(slot);
  as6WorkspaceLayoutRegistry.slots.set(nextSlot.id, nextSlot);
  return nextSlot;
}

export function getAS6WorkspaceRegions() {
  return Array.from(as6WorkspaceLayoutRegistry.regions.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6WorkspaceSlots(regionId) {
  return Array.from(as6WorkspaceLayoutRegistry.slots.values())
    .filter((slot) => !regionId || slot.regionId === regionId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
