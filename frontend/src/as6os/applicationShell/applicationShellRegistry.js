import { defineAS6ApplicationShell, defineAS6ApplicationRegion, defineAS6ApplicationSlot } from './applicationShellContract.js';

export const as6ApplicationShells = [
  defineAS6ApplicationShell({
    id: 'as6.application.shell.default',
    label: 'AS6 Application Shell',
    regions: ['application.main', 'application.side', 'application.tools'],
    slots: ['application.main.primary', 'application.side.context', 'application.tools.actions'],
  }),
];

export const as6ApplicationRegions = [
  defineAS6ApplicationRegion({ id: 'application.main', label: 'Main Application Region', order: 10, slots: ['application.main.primary'] }),
  defineAS6ApplicationRegion({ id: 'application.side', label: 'Context Region', order: 20, slots: ['application.side.context'] }),
  defineAS6ApplicationRegion({ id: 'application.tools', label: 'Tools Region', order: 30, slots: ['application.tools.actions'] }),
];

export const as6ApplicationSlots = [
  defineAS6ApplicationSlot({ id: 'application.main.primary', regionId: 'application.main', order: 10 }),
  defineAS6ApplicationSlot({ id: 'application.side.context', regionId: 'application.side', order: 10 }),
  defineAS6ApplicationSlot({ id: 'application.tools.actions', regionId: 'application.tools', order: 10 }),
];

export const as6ApplicationShellRegistry = {
  shells: new Map(as6ApplicationShells.map((shell) => [shell.id, shell])),
  regions: new Map(as6ApplicationRegions.map((region) => [region.id, region])),
  slots: new Map(as6ApplicationSlots.map((slot) => [slot.id, slot])),
};

export function getAS6ApplicationShells() {
  return Array.from(as6ApplicationShellRegistry.shells.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6ApplicationRegions() {
  return Array.from(as6ApplicationShellRegistry.regions.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6ApplicationSlots(regionId) {
  return Array.from(as6ApplicationShellRegistry.slots.values()).filter((slot) => !regionId || slot.regionId === regionId).sort((a, b) => (a.order || 0) - (b.order || 0));
}
