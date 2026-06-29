import {
  emitAS6BusEvent,
  queryAS6Bus,
  registerAS6BusHandler,
  runAS6BusCommand,
} from "./AS6UniversalServiceBus";

export function registerAS6LivingSpaceBusHandlers(spaceId, handlers = {}) {
  const results = [];

  for (const [name, handler] of Object.entries(handlers.events || {})) {
    results.push(registerAS6BusHandler("event", name, handler, { owner: spaceId }));
  }

  for (const [name, handler] of Object.entries(handlers.commands || {})) {
    results.push(registerAS6BusHandler("command", name, handler, { owner: spaceId }));
  }

  for (const [name, handler] of Object.entries(handlers.queries || {})) {
    results.push(registerAS6BusHandler("query", name, handler, { owner: spaceId }));
  }

  return results;
}

export function publishAS6SpaceEvent(spaceId, name, payload = {}) {
  return emitAS6BusEvent(name, payload, { spaceId });
}

export function executeAS6SpaceCommand(spaceId, name, payload = {}) {
  return runAS6BusCommand(name, payload, { spaceId });
}

export function askAS6SpaceQuery(spaceId, name, payload = {}) {
  return queryAS6Bus(name, payload, { spaceId });
}
