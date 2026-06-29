import { getAS6Services, getAS6ServiceById } from "../services/as6ServiceRegistry";
import { getAS6Plugins } from "../plugins/as6PluginRegistry";

export const AS6_SERVICE_DEPENDENCY_GRAPH_VERSION = "V110";

export const as6ServiceDependencyGraph = [
  {
    id: "crm",
    dependsOn: ["as6-one", "revenue"],
    pluginDependencies: [],
    reason: "CRM Living Space depends on workspace shell and revenue analytics.",
  },
  {
    id: "pipeline-copilot",
    dependsOn: ["crm", "ai-workers"],
    pluginDependencies: [],
    reason: "Pipeline automation depends on CRM data and AI Workers.",
  },
  {
    id: "revenue",
    dependsOn: ["dashboard"],
    pluginDependencies: [],
    reason: "Revenue module depends on dashboard analytics foundation.",
  },
  {
    id: "command-center",
    dependsOn: ["ai-workers", "dashboard"],
    pluginDependencies: [],
    reason: "Command Center coordinates AI workers and operational dashboards.",
  },
];

export function getAS6ServiceDependencyGraph() {
  return as6ServiceDependencyGraph;
}

export function getAS6ServiceDependencies(serviceId) {
  return as6ServiceDependencyGraph.find((node) => node.id === serviceId)?.dependsOn || [];
}

export function getAS6ServiceDependents(serviceId) {
  return as6ServiceDependencyGraph
    .filter((node) => node.dependsOn.includes(serviceId))
    .map((node) => node.id);
}

export function getAS6PluginDependencies(serviceId) {
  return as6ServiceDependencyGraph.find((node) => node.id === serviceId)?.pluginDependencies || [];
}

export function resolveAS6ServiceDependencyNode(serviceId) {
  const service = getAS6ServiceById(serviceId);
  const dependencies = getAS6ServiceDependencies(serviceId);
  const dependents = getAS6ServiceDependents(serviceId);
  const pluginDependencies = getAS6PluginDependencies(serviceId);

  return {
    service,
    dependencies,
    dependents,
    pluginDependencies,
  };
}

export function validateAS6ServiceDependencyGraphPolicy() {
  const failures = [];
  const services = getAS6Services();
  const plugins = getAS6Plugins();
  const serviceIds = new Set(services.map((service) => service.id));
  const pluginIds = new Set(plugins.map((plugin) => plugin.id));

  for (const node of as6ServiceDependencyGraph) {
    if (!node.id) failures.push("dependency_node_missing_id");
    if (!serviceIds.has(node.id)) failures.push(`${node.id}_service_not_registered`);
    if (!Array.isArray(node.dependsOn)) failures.push(`${node.id}_depends_on_not_array`);
    if (!Array.isArray(node.pluginDependencies)) failures.push(`${node.id}_plugin_dependencies_not_array`);

    for (const dependency of node.dependsOn || []) {
      if (!serviceIds.has(dependency)) failures.push(`${node.id}_missing_service_dependency_${dependency}`);
    }

    for (const pluginDependency of node.pluginDependencies || []) {
      if (!pluginIds.has(pluginDependency)) failures.push(`${node.id}_missing_plugin_dependency_${pluginDependency}`);
    }
  }

  return {
    ok: failures.length === 0,
    failures,
    nodeCount: as6ServiceDependencyGraph.length,
    version: AS6_SERVICE_DEPENDENCY_GRAPH_VERSION,
  };
}
