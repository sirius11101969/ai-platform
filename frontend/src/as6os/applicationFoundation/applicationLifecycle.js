export const as6ApplicationLifecycleStages = ['registered', 'created', 'bootstrapped', 'running', 'stopped'];

export function createAS6ApplicationLifecycle(applicationId) {
  if (!applicationId) throw new Error('AS6_APPLICATION_LIFECYCLE_INVALID');
  return {
    applicationId,
    status: 'created',
    transitions: [{ status: 'created', ts: new Date().toISOString() }],
  };
}

export function transitionAS6ApplicationLifecycle(lifecycle, status) {
  if (!as6ApplicationLifecycleStages.includes(status)) throw new Error('AS6_APPLICATION_LIFECYCLE_DRIFT');
  lifecycle.status = status;
  lifecycle.transitions.push({ status, ts: new Date().toISOString() });
  return lifecycle;
}
