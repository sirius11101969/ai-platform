const AS6_EVENT_BUS_VERSION = "V101";
const listeners = new Map();
const eventHistory = [];
const MAX_HISTORY = 100;

function normalizeEventName(eventName) {
  return String(eventName || "AS6_EVENT_UNKNOWN").trim() || "AS6_EVENT_UNKNOWN";
}

function createEventEnvelope(eventName, payload = {}, meta = {}) {
  return {
    id: `as6-event-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: normalizeEventName(eventName),
    payload,
    meta,
    timestamp: new Date().toISOString(),
    version: AS6_EVENT_BUS_VERSION,
  };
}

function addHistory(event) {
  eventHistory.unshift(event);

  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.length = MAX_HISTORY;
  }

  return event;
}

export function emitAS6Event(eventName, payload = {}, meta = {}) {
  const event = addHistory(createEventEnvelope(eventName, payload, meta));
  const handlers = listeners.get(event.name) || new Set();
  const wildcardHandlers = listeners.get("*") || new Set();

  [...handlers, ...wildcardHandlers].forEach((handler) => {
    try {
      handler(event);
    } catch {
      // Event handlers must not break AS6 Runtime.
    }
  });

  return event;
}

export function onAS6Event(eventName, handler) {
  const name = normalizeEventName(eventName);

  if (typeof handler !== "function") {
    return () => {};
  }

  if (!listeners.has(name)) {
    listeners.set(name, new Set());
  }

  listeners.get(name).add(handler);

  return () => offAS6Event(name, handler);
}

export function onceAS6Event(eventName, handler) {
  const unsubscribe = onAS6Event(eventName, (event) => {
    unsubscribe();
    handler(event);
  });

  return unsubscribe;
}

export function offAS6Event(eventName, handler) {
  const name = normalizeEventName(eventName);

  if (!listeners.has(name)) {
    return false;
  }

  return listeners.get(name).delete(handler);
}

export function getAS6EventHistory(limit = MAX_HISTORY) {
  return eventHistory.slice(0, limit);
}

export function clearAS6EventHistory() {
  eventHistory.length = 0;
  return eventHistory;
}

export function getAS6EventBusState() {
  return {
    version: AS6_EVENT_BUS_VERSION,
    listenerTypes: Array.from(listeners.keys()),
    listenerCount: Array.from(listeners.values()).reduce((total, set) => total + set.size, 0),
    historyCount: eventHistory.length,
  };
}

export function createAS6RuntimeEventBridge(dispatchAS6Runtime) {
  if (typeof dispatchAS6Runtime !== "function") {
    return () => {};
  }

  return onAS6Event("*", (event) => {
    if (event.meta?.skipRuntimeBridge) {
      return;
    }

    dispatchAS6Runtime({
      type: "AS6_RUNTIME_EVENT",
      event,
    });
  });
}

export function validateAS6EventBusPolicy() {
  const state = getAS6EventBusState();
  const failures = [];

  if (state.version !== AS6_EVENT_BUS_VERSION) failures.push("version_mismatch");
  if (!Array.isArray(state.listenerTypes)) failures.push("listener_types_not_array");
  if (typeof state.listenerCount !== "number") failures.push("listener_count_not_number");
  if (typeof state.historyCount !== "number") failures.push("history_count_not_number");

  return {
    ok: failures.length === 0,
    failures,
  };
}
