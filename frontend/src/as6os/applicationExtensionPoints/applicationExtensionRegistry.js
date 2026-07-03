import { defineAS6ExtensionPoint, defineAS6Extension, defineAS6ExtensionCapability } from './applicationExtensionContract.js';

export const as6ExtensionPoints = [
  defineAS6ExtensionPoint({
    id: 'application.shell.region',
    label: 'Application Shell Region Extension Point',
    contractVersion: '1.0.0',
    allowedCapabilities: ['extension.region'],
  }),
  defineAS6ExtensionPoint({
    id: 'application.runtime.service',
    label: 'Application Runtime Service Extension Point',
    contractVersion: '1.0.0',
    allowedCapabilities: ['extension.service'],
  }),
];

export const as6Extensions = [
  defineAS6Extension({
    id: 'as6.extension.region.default',
    pointId: 'application.shell.region',
    contractVersion: '1.0.0',
    capabilities: ['extension.region'],
  }),
  defineAS6Extension({
    id: 'as6.extension.service.default',
    pointId: 'application.runtime.service',
    contractVersion: '1.0.0',
    capabilities: ['extension.service'],
  }),
];

export const as6ExtensionCapabilities = [
  defineAS6ExtensionCapability({ id: 'extension.region', type: 'region', owner: 'as6.extension.region.default' }),
  defineAS6ExtensionCapability({ id: 'extension.service', type: 'service', owner: 'as6.extension.service.default' }),
];

export const as6ExtensionRegistry = {
  points: new Map(as6ExtensionPoints.map((point) => [point.id, point])),
  extensions: new Map(as6Extensions.map((extension) => [extension.id, extension])),
  capabilities: new Map(as6ExtensionCapabilities.map((capability) => [capability.id, capability])),
};

export function getAS6ExtensionPoints() {
  return Array.from(as6ExtensionRegistry.points.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6Extensions() {
  return Array.from(as6ExtensionRegistry.extensions.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getAS6ExtensionCapabilities() {
  return Array.from(as6ExtensionRegistry.capabilities.values()).sort((a, b) => a.id.localeCompare(b.id));
}
