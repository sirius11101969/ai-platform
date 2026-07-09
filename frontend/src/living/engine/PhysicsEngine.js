import { resolveAttentionMap } from "./AttentionEngine.js";
import { resolveEnergyMap } from "./EnergyEngine.js";
import { resolveGravityLayout } from "./GravityEngine.js";
import { resolveConnections } from "./ConnectionEngine.js";

export function resolveLivingPhysics({ state, nodes }) {
  const attentionMap = resolveAttentionMap({
    nodes,
    activeNodeIds: state?.activeNodeIds || [],
    primaryNodeId: state?.primaryNodeId || null,
  });

  const energyMap = resolveEnergyMap({ nodes, attentionMap });
  const layoutMap = resolveGravityLayout({ nodes, attentionMap });
  const connections = resolveConnections({ nodes, activeNodeIds: state?.activeNodeIds || [], attentionMap });

  return {
    attentionMap,
    energyMap,
    layoutMap,
    connections,
  };
}
