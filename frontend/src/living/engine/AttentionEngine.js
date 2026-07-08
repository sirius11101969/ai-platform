export const AS6_ATTENTION_LEVELS = {
  quiet: 0.18,
  supporting: 0.42,
  active: 0.72,
  primary: 1,
};

export function resolveAttentionMap({ nodes = [], activeNodeIds = [], primaryNodeId = null }) {
  const activeSet = new Set(activeNodeIds);

  return nodes.reduce((map, node) => {
    if (primaryNodeId && node.id === primaryNodeId) {
      map[node.id] = AS6_ATTENTION_LEVELS.primary;
      return map;
    }

    if (activeSet.has(node.id)) {
      map[node.id] = AS6_ATTENTION_LEVELS.active;
      return map;
    }

    map[node.id] = AS6_ATTENTION_LEVELS.quiet;
    return map;
  }, {});
}

export function getNodeAttention(nodeId, attentionMap) {
  return attentionMap[nodeId] ?? AS6_ATTENTION_LEVELS.quiet;
}
