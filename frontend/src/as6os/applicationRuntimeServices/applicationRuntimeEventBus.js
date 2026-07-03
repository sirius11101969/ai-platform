export const as6RuntimeEventBusState = {
  events: [],
  subscribers: new Map(),
};

export function publishAS6RuntimeEvent(type, payload = {}) {
  if (!type) throw new Error('AS6_RUNTIME_EVENT_ROUTING_FAILURE');
  const event = { type, payload, ts: new Date().toISOString() };
  as6RuntimeEventBusState.events.push(event);
  const subscribers = as6RuntimeEventBusState.subscribers.get(type) || [];
  subscribers.forEach((subscriber) => subscriber(event));
  return event;
}

export function subscribeAS6RuntimeEvent(type, handler) {
  if (!type || typeof handler !== 'function') throw new Error('AS6_RUNTIME_EVENT_ROUTING_FAILURE');
  const subscribers = as6RuntimeEventBusState.subscribers.get(type) || [];
  subscribers.push(handler);
  as6RuntimeEventBusState.subscribers.set(type, subscribers);
  return () => {
    as6RuntimeEventBusState.subscribers.set(type, subscribers.filter((item) => item !== handler));
  };
}
