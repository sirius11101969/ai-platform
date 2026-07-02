import { traceAS6WorkspaceLayout } from '../workspaceLayout/index.js';
import { resolveAS6WorkspaceNavigationTree, flattenAS6WorkspaceNavigationTree } from './navigationResolver.js';

export const as6WorkspaceNavigationState = {
  activeItemId: 'workspace.home',
  status: 'idle',
  traces: [],
};

export function traceAS6WorkspaceNavigation(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6WorkspaceNavigationState.traces.push(record);
  traceAS6WorkspaceLayout('navigation.' + event, payload);
  return record;
}

export function activateAS6WorkspaceNavigationItem(itemId) {
  const found = flattenAS6WorkspaceNavigationTree().find((item) => item.id === itemId);
  if (!found) throw new Error('AS6_NAVIGATION_ITEM_NOT_FOUND');
  as6WorkspaceNavigationState.activeItemId = itemId;
  as6WorkspaceNavigationState.status = 'active';
  traceAS6WorkspaceNavigation('item.activated', { itemId });
  return found;
}

export function getAS6WorkspaceNavigationModel() {
  const tree = resolveAS6WorkspaceNavigationTree();
  return {
    activeItemId: as6WorkspaceNavigationState.activeItemId,
    groups: tree,
    items: flattenAS6WorkspaceNavigationTree(tree),
  };
}

export function getAS6WorkspaceNavigationHealthSnapshot() {
  const model = getAS6WorkspaceNavigationModel();
  return {
    stage: 'AS6_EPIC010_SLICE03_WORKSPACE_NAVIGATION',
    navigation: {
      status: as6WorkspaceNavigationState.status,
      activeItemId: as6WorkspaceNavigationState.activeItemId,
      groupCount: model.groups.length,
      itemCount: model.items.length,
      traceCount: as6WorkspaceNavigationState.traces.length,
    },
  };
}
