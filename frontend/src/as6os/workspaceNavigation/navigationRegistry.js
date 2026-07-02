import { defineAS6NavigationGroup, defineAS6NavigationItem, defineAS6NavigationCapability } from './navigationContract.js';

export const as6WorkspaceNavigationGroups = [
  defineAS6NavigationGroup({ id: 'workspace', label: 'Workspace', order: 10, items: ['workspace.home', 'workspace.layout'] }),
  defineAS6NavigationGroup({ id: 'system', label: 'System', order: 20, items: ['system.diagnostics', 'system.health'] }),
];

export const as6WorkspaceNavigationItems = [
  defineAS6NavigationItem({ id: 'workspace.home', groupId: 'workspace', label: 'Home', order: 10, path: '/workspace', capabilities: ['workspace.view'] }),
  defineAS6NavigationItem({ id: 'workspace.layout', groupId: 'workspace', label: 'Layout', order: 20, path: '/workspace/layout', capabilities: ['workspace.layout.view'] }),
  defineAS6NavigationItem({ id: 'system.diagnostics', groupId: 'system', label: 'Diagnostics', order: 10, path: '/workspace/diagnostics', capabilities: ['system.diagnostics.view'] }),
  defineAS6NavigationItem({ id: 'system.health', groupId: 'system', label: 'Health', order: 20, path: '/workspace/health', capabilities: ['system.health.view'] }),
];

export const as6WorkspaceNavigationCapabilities = [
  defineAS6NavigationCapability({ id: 'workspace.view', owner: 'workspace' }),
  defineAS6NavigationCapability({ id: 'workspace.layout.view', owner: 'workspace' }),
  defineAS6NavigationCapability({ id: 'system.diagnostics.view', owner: 'system' }),
  defineAS6NavigationCapability({ id: 'system.health.view', owner: 'system' }),
];

export const as6WorkspaceNavigationRegistry = {
  groups: new Map(as6WorkspaceNavigationGroups.map((group) => [group.id, group])),
  items: new Map(as6WorkspaceNavigationItems.map((item) => [item.id, item])),
  capabilities: new Map(as6WorkspaceNavigationCapabilities.map((capability) => [capability.id, capability])),
};

export function registerAS6WorkspaceNavigationGroup(group) {
  const nextGroup = defineAS6NavigationGroup(group);
  as6WorkspaceNavigationRegistry.groups.set(nextGroup.id, nextGroup);
  return nextGroup;
}

export function registerAS6WorkspaceNavigationItem(item) {
  const nextItem = defineAS6NavigationItem(item);
  as6WorkspaceNavigationRegistry.items.set(nextItem.id, nextItem);
  return nextItem;
}

export function getAS6WorkspaceNavigationGroups() {
  return Array.from(as6WorkspaceNavigationRegistry.groups.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getAS6WorkspaceNavigationItems(groupId) {
  return Array.from(as6WorkspaceNavigationRegistry.items.values()).filter((item) => !groupId || item.groupId === groupId).sort((a, b) => (a.order || 0) - (b.order || 0));
}
