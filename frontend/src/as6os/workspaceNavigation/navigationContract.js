export const AS6_WORKSPACE_NAVIGATION_STAGE = 'AS6_EPIC010_SLICE03_WORKSPACE_NAVIGATION';

export function defineAS6NavigationGroup(group) {
  if (!group || !group.id || !group.label) throw new Error('AS6_NAVIGATION_GROUP_INVALID');
  return { order: 100, items: [], availability: 'always', capabilities: [], ...group };
}

export function defineAS6NavigationItem(item) {
  if (!item || !item.id || !item.label || !item.groupId) throw new Error('AS6_NAVIGATION_ITEM_INVALID');
  return { order: 100, slotId: 'workspace.sidebar.navigation', availability: 'always', capabilities: [], ...item };
}

export function defineAS6NavigationCapability(capability) {
  if (!capability || !capability.id || !capability.owner) throw new Error('AS6_NAVIGATION_CAPABILITY_INVALID');
  return { availability: 'always', ...capability };
}
