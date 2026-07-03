import { defineAS6IntegrationSubsystem } from './applicationIntegrationContract.js';

export const as6IntegrationSubsystems = [
  defineAS6IntegrationSubsystem({
    id: 'application.foundation',
    label: 'Application Foundation',
    contractVersion: '1.0.0',
    capabilities: ['foundation'],
  }),
  defineAS6IntegrationSubsystem({
    id: 'application.host',
    label: 'Application Host',
    contractVersion: '1.0.0',
    dependencies: ['application.foundation'],
    capabilities: ['host'],
  }),
  defineAS6IntegrationSubsystem({
    id: 'application.shell',
    label: 'Application Shell',
    contractVersion: '1.0.0',
    dependencies: ['application.host'],
    capabilities: ['shell'],
  }),
  defineAS6IntegrationSubsystem({
    id: 'application.runtimeServices',
    label: 'Application Runtime Services',
    contractVersion: '1.0.0',
    dependencies: ['application.shell'],
    capabilities: ['runtime.services'],
  }),
  defineAS6IntegrationSubsystem({
    id: 'application.extensionPoints',
    label: 'Application Extension Points',
    contractVersion: '1.0.0',
    dependencies: ['application.runtimeServices'],
    capabilities: ['extension.points'],
  }),
  defineAS6IntegrationSubsystem({
    id: 'application.services',
    label: 'Application Services',
    contractVersion: '1.0.0',
    dependencies: ['application.extensionPoints'],
    capabilities: ['application.services'],
  }),
];

export const as6ApplicationIntegrationRegistry = {
  subsystems: new Map(as6IntegrationSubsystems.map((subsystem) => [subsystem.id, subsystem])),
};

export function getAS6IntegrationSubsystems() {
  return Array.from(as6ApplicationIntegrationRegistry.subsystems.values());
}
