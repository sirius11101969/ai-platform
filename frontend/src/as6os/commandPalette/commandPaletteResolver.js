import { getAS6CommandGroups, getAS6Commands } from './commandPaletteRegistry.js';

export function resolveAS6CommandPaletteTree(query = '') {
  const normalizedQuery = query.trim().toLowerCase();

  return getAS6CommandGroups().map((group) => ({
    ...group,
    commands: getAS6Commands(group.id).filter((command) => {
      if (!normalizedQuery) return true;
      return command.label.toLowerCase().includes(normalizedQuery)
        || command.id.toLowerCase().includes(normalizedQuery)
        || command.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
    }),
  })).filter((group) => group.commands.length > 0);
}

export function flattenAS6CommandPaletteTree(tree = resolveAS6CommandPaletteTree()) {
  return tree.flatMap((group) => group.commands.map((command) => ({ ...command, groupLabel: group.label })));
}
