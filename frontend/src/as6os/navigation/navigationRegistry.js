export const AS6_NAVIGATION_STAGE = 'AS6_EPIC009_SLICE03_NAVIGATION_FRAMEWORK';

export const as6NavigationItems = [
  { id: 'workspace', label: 'Workspace', path: '/workspace', module: 'as6.workspace', order: 10 },
  { id: 'modules', label: 'Modules', path: '/modules', module: 'as6.modules', order: 20 },
  { id: 'diagnostics', label: 'Diagnostics', path: '/diagnostics', module: 'as6.diagnostics', order: 30 },
];

export const as6NavigationRegistry = new Map(as6NavigationItems.map((item) => [item.id, item]));

export function registerAS6NavigationItem(item) {
  if (!item || !item.id || !item.label || !item.path) {
    throw new Error('AS6_NAVIGATION_ITEM_INVALID');
  }
  as6NavigationRegistry.set(item.id, item);
  return as6NavigationRegistry.get(item.id);
}

export function getAS6NavigationItems() {
  return Array.from(as6NavigationRegistry.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function resolveAS6NavigationItem(id) {
  return as6NavigationRegistry.get(id) || null;
}
