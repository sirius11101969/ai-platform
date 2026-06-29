export const AS6_UNIVERSAL_SERVICE_BUS_VERSION = "P6";

const handlers = new Map();
const busLog = [];

function key(type, name) {
  return `${type}:${name}`;
}

export function registerAS6BusHandler(type, name, handler, options = {}) {
  if (!type || !name || typeof handler !== "function") {
    return { ok: false, error: "AS6_BUS_HANDLER_INVALID" };
  }

  handlers.set(key(type, name), {
    type,
    name,
    handler,
    owner: options.owner || "unknown",
    risk: options.risk || "low",
    registeredAt: new Date().toISOString(),
  });

  return { ok: true, type, name };
}

export async function dispatchAS6BusMessage(message = {}) {
  const { type, name, payload = {}, context = {} } = message;

  if (!type || !name) {
    return { ok: false, error: "AS6_BUS_MESSAGE_INVALID" };
  }

  const entry = handlers.get(key(type, name));

  if (!entry) {
    return { ok: false, error: "AS6_BUS_HANDLER_NOT_FOUND", type, name };
  }

  const result = await entry.handler({ payload, context, message });

  busLog.push({
    type,
    name,
    owner: entry.owner,
    at: new Date().toISOString(),
    ok: true,
  });

  return {
    ok: true,
    type,
    name,
    owner: entry.owner,
    result,
  };
}

export function emitAS6BusEvent(name, payload = {}, context = {}) {
  return dispatchAS6BusMessage({ type: "event", name, payload, context });
}

export function runAS6BusCommand(name, payload = {}, context = {}) {
  return dispatchAS6BusMessage({ type: "command", name, payload, context });
}

export function queryAS6Bus(name, payload = {}, context = {}) {
  return dispatchAS6BusMessage({ type: "query", name, payload, context });
}

export function getAS6BusState() {
  return {
    version: AS6_UNIVERSAL_SERVICE_BUS_VERSION,
    handlerCount: handlers.size,
    handlers: [...handlers.values()].map(({ handler, ...meta }) => meta),
    log: busLog.slice(-50),
  };
}

export function validateAS6UniversalServiceBusPolicy() {
  const failures = [];

  if (typeof registerAS6BusHandler !== "function") failures.push("register_missing");
  if (typeof dispatchAS6BusMessage !== "function") failures.push("dispatch_missing");
  if (typeof emitAS6BusEvent !== "function") failures.push("event_missing");
  if (typeof runAS6BusCommand !== "function") failures.push("command_missing");
  if (typeof queryAS6Bus !== "function") failures.push("query_missing");

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_UNIVERSAL_SERVICE_BUS_VERSION,
  };
}
