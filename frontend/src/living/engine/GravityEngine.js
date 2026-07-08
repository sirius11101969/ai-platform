const DEFAULT_RADIUS = 38;

export function resolveGravityLayout({ nodes = [], attentionMap = {}, radius = DEFAULT_RADIUS }) {
  const count = Math.max(nodes.length, 1);
  const centerX = 50;
  const centerY = 52;

  return nodes.reduce((layout, node, index) => {
    const attention = attentionMap[node.id] ?? 0;
    const angle = -90 + (360 / count) * index + (index % 2 === 0 ? -8 : 8);
    const distance = radius - attention * 7;
    const radians = (angle * Math.PI) / 180;

    layout[node.id] = {
      left: `${centerX + Math.cos(radians) * distance}%`,
      top: `${centerY + Math.sin(radians) * distance * 0.78}%`,
      distance,
      angle,
    };

    return layout;
  }, {});
}

export function getNodePosition(nodeId, layoutMap) {
  return layoutMap[nodeId] || { left: "50%", top: "50%", distance: 0, angle: 0 };
}
