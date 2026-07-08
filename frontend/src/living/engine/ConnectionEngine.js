export function resolveConnections({ nodes = [], activeNodeIds = [], attentionMap = {} }) {
  const activeSet = new Set(activeNodeIds);

  return nodes.map((node) => {
    const active = activeSet.has(node.id);
    const attention = attentionMap[node.id] ?? 0;

    return {
      id: `core-to-${node.id}`,
      nodeId: node.id,
      active,
      strength: active ? Math.max(0.68, attention) : Math.max(0.12, attention * 0.45),
      pulse: active,
    };
  });
}
