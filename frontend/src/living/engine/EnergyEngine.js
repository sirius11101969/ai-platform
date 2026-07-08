export function resolveEnergyMap({ nodes = [], attentionMap = {}, baseEnergy = 0.24 }) {
  return nodes.reduce((map, node) => {
    const attention = attentionMap[node.id] ?? 0;
    const semanticBoost = node.energyBias ?? 0;
    map[node.id] = Math.max(0, Math.min(1, baseEnergy + attention * 0.72 + semanticBoost));
    return map;
  }, {});
}

export function getEnergyClass(energy = 0) {
  if (energy >= 0.92) return "primary";
  if (energy >= 0.68) return "active";
  if (energy >= 0.42) return "supporting";
  return "quiet";
}
