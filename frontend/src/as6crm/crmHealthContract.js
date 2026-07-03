export const as6CrmHealthContract = {
  required: [
    'status',
    'moduleCount',
    'entityCount',
    'capabilityCount',
    'platformMutation',
    'traceCount',
  ],
};

export function getAS6CrmHealthContract() {
  return { ...as6CrmHealthContract };
}
