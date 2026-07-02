import { getAS6WorkspaceNavigationGroups, getAS6WorkspaceNavigationItems } from './navigationRegistry.js';

export function resolveAS6WorkspaceNavigationTree() {
  return getAS6WorkspaceNavigationGroups().map((group) => ({
    ...group,
    items: getAS6WorkspaceNavigationItems(group.id),
  }));
}

export function flattenAS6WorkspaceNavigationTree(tree = resolveAS6WorkspaceNavigationTree()) {
  return tree.flatMap((group) => group.items.map((item) => ({ ...item, groupLabel: group.label })));
}
