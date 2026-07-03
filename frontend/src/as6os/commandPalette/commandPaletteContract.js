export const AS6_COMMAND_PALETTE_STAGE = 'AS6_EPIC010_SLICE05_COMMAND_PALETTE';

export function defineAS6Command(command) {
  if (!command || !command.id || !command.label) throw new Error('AS6_COMMAND_INVALID');
  return {
    groupId: 'workspace',
    order: 100,
    keywords: [],
    capabilities: [],
    availability: 'always',
    actionType: 'infrastructure',
    ...command,
  };
}

export function defineAS6CommandGroup(group) {
  if (!group || !group.id || !group.label) throw new Error('AS6_COMMAND_GROUP_INVALID');
  return {
    order: 100,
    commands: [],
    availability: 'always',
    ...group,
  };
}

export function defineAS6CommandCapability(capability) {
  if (!capability || !capability.id || !capability.owner) throw new Error('AS6_COMMAND_CAPABILITY_INVALID');
  return { availability: 'always', ...capability };
}
