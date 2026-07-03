import { getAS6ExtensionPoints, getAS6Extensions, getAS6ExtensionCapabilities } from './applicationExtensionRegistry.js';
import { validateAS6ExtensionPolicy } from './applicationExtensionPolicy.js';

export function resolveAS6ExtensionCompatibility() {
  const extensions = getAS6Extensions();
  extensions.forEach((extension) => validateAS6ExtensionPolicy(extension));
  return { status: 'compatible', extensionCount: extensions.length };
}

export function resolveAS6ExtensionCapabilities() {
  const extensions = getAS6Extensions();
  const capabilities = getAS6ExtensionCapabilities();
  const capabilityIds = new Set(capabilities.map((capability) => capability.id));

  for (const extension of extensions) {
    for (const capability of extension.capabilities || []) {
      if (!capabilityIds.has(capability)) throw new Error('AS6_EXTENSION_CAPABILITY_CONFLICT');
    }
  }

  return { extensions, capabilities };
}

export function createAS6ExtensionComposition() {
  const points = getAS6ExtensionPoints();
  const extensions = getAS6Extensions();
  const compatibility = resolveAS6ExtensionCompatibility();
  const capabilityGraph = resolveAS6ExtensionCapabilities();

  const pointIds = new Set(points.map((point) => point.id));
  for (const extension of extensions) {
    if (!pointIds.has(extension.pointId)) throw new Error('AS6_EXTENSION_RESOLUTION_FAILURE');
  }

  return {
    stage: 'AS6_EPIC011_SLICE05_APPLICATION_EXTENSION_POINTS',
    points,
    extensions,
    compatibility,
    capabilityGraph,
    composition: points.map((point) => ({
      pointId: point.id,
      extensions: extensions.filter((extension) => extension.pointId === point.id),
    })),
  };
}
