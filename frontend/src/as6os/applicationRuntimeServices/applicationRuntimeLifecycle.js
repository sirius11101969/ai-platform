export function initializeAS6RuntimeService(service) {
  if (!service || !service.id) throw new Error('AS6_RUNTIME_SERVICE_CONTRACT_MISMATCH');
  return { serviceId: service.id, status: 'initialized', ts: new Date().toISOString() };
}

export function disposeAS6RuntimeService(service) {
  if (!service || !service.id) throw new Error('AS6_RUNTIME_SERVICE_CONTRACT_MISMATCH');
  return { serviceId: service.id, status: 'disposed', ts: new Date().toISOString() };
}
