export const AS6_APPLICATION_INTEGRATION_STAGE = 'AS6_EPIC011_SLICE07_APPLICATION_INTEGRATION';

export function defineAS6IntegrationSubsystem(subsystem) {
  if (!subsystem || !subsystem.id || !subsystem.label || !subsystem.contractVersion) {
    throw new Error('AS6_APPLICATION_INTEGRATION_CONTRACT_MISMATCH');
  }

  return {
    dependencies: [],
    capabilities: [],
    bootstrap: true,
    health: true,
    scope: 'application-infrastructure',
    ...subsystem,
  };
}
