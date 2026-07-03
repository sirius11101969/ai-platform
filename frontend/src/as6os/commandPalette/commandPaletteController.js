import { traceAS6WorkspaceNavigation } from '../workspaceNavigation/index.js';
import { resolveAS6CommandPaletteTree, flattenAS6CommandPaletteTree } from './commandPaletteResolver.js';

export const as6CommandPaletteState = {
  status: 'idle',
  query: '',
  activeCommandId: 'workspace.focus',
  traces: [],
};

export function traceAS6CommandPalette(event, payload = {}) {
  const record = { event, payload, ts: new Date().toISOString() };
  as6CommandPaletteState.traces.push(record);
  traceAS6WorkspaceNavigation('commandPalette.' + event, payload);
  return record;
}

export function searchAS6Commands(query = '') {
  as6CommandPaletteState.query = query;
  traceAS6CommandPalette('search.updated', { query });
  return getAS6CommandPaletteModel();
}

export function activateAS6Command(commandId) {
  const command = flattenAS6CommandPaletteTree(resolveAS6CommandPaletteTree()).find((item) => item.id === commandId);
  if (!command) throw new Error('AS6_COMMAND_NOT_FOUND');
  as6CommandPaletteState.activeCommandId = commandId;
  as6CommandPaletteState.status = 'active';
  traceAS6CommandPalette('command.activated', { commandId });
  return command;
}

export function getAS6CommandPaletteModel() {
  const tree = resolveAS6CommandPaletteTree(as6CommandPaletteState.query);
  return {
    status: as6CommandPaletteState.status,
    query: as6CommandPaletteState.query,
    activeCommandId: as6CommandPaletteState.activeCommandId,
    groups: tree,
    commands: flattenAS6CommandPaletteTree(tree),
  };
}

export function getAS6CommandPaletteHealthSnapshot() {
  const model = getAS6CommandPaletteModel();
  return {
    stage: 'AS6_EPIC010_SLICE05_COMMAND_PALETTE',
    commandPalette: {
      status: as6CommandPaletteState.status,
      query: as6CommandPaletteState.query,
      activeCommandId: as6CommandPaletteState.activeCommandId,
      groupCount: model.groups.length,
      commandCount: model.commands.length,
      traceCount: as6CommandPaletteState.traces.length,
    },
  };
}
