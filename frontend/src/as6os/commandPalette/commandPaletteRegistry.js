import { defineAS6Command, defineAS6CommandGroup, defineAS6CommandCapability } from './commandPaletteContract.js';

export const as6CommandGroups = [
  defineAS6CommandGroup({ id: 'workspace', label: 'Workspace', order: 10, commands: ['workspace.focus', 'workspace.openNavigation'] }),
  defineAS6CommandGroup({ id: 'system', label: 'System', order: 20, commands: ['system.openDiagnostics', 'system.openHealth'] }),
];

export const as6Commands = [
  defineAS6Command({ id: 'workspace.focus', groupId: 'workspace', label: 'Focus Workspace', order: 10, keywords: ['focus', 'workspace'], capabilities: ['workspace.focus'] }),
  defineAS6Command({ id: 'workspace.openNavigation', groupId: 'workspace', label: 'Open Navigation', order: 20, keywords: ['navigation', 'menu'], capabilities: ['workspace.navigation.view'] }),
  defineAS6Command({ id: 'system.openDiagnostics', groupId: 'system', label: 'Open Diagnostics', order: 10, keywords: ['diagnostics', 'health'], capabilities: ['system.diagnostics.view'] }),
  defineAS6Command({ id: 'system.openHealth', groupId: 'system', label: 'Open Health Snapshot', order: 20, keywords: ['health', 'snapshot'], capabilities: ['system.health.view'] }),
];

export const as6CommandCapabilities = [
  defineAS6CommandCapability({ id: 'workspace.focus', owner: 'workspace' }),
  defineAS6CommandCapability({ id: 'workspace.navigation.view', owner: 'workspace' }),
  defineAS6CommandCapability({ id: 'system.diagnostics.view', owner: 'system' }),
  defineAS6CommandCapability({ id: 'system.health.view', owner: 'system' }),
];

export const as6CommandPaletteRegistry = {
  groups: new Map(as6CommandGroups.map((group) => [group.id, group])),
  commands: new Map(as6Commands.map((command) => [command.id, command])),
  capabilities: new Map(as6CommandCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6CommandGroup(group) {
  const nextGroup = defineAS6CommandGroup(group);
  as6CommandPaletteRegistry.groups.set(nextGroup.id, nextGroup);
  return nextGroup;
}

export function registerAS6Command(command) {
  const nextCommand = defineAS6Command(command);
  as6CommandPaletteRegistry.commands.set(nextCommand.id, nextCommand);
  return nextCommand;
}

export function getAS6CommandGroups() {
  return Array.from(as6CommandPaletteRegistry.groups.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6Commands(groupId) {
  return Array.from(as6CommandPaletteRegistry.commands.values())
    .filter((command) => !groupId || command.groupId === groupId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
