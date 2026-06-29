import { emitAS6BusEvent } from "../bus";

export const AS6_WIDGET_RUNTIME_VERSION = "P7";

const widgetRegistry = new Map();

export function registerAS6Widget(widget) {
  if (!widget?.id) return { ok: false, error: "AS6_WIDGET_ID_MISSING" };
  if (!widget?.title) return { ok: false, error: "AS6_WIDGET_TITLE_MISSING" };
  if (!widget?.spaceId) return { ok: false, error: "AS6_WIDGET_SPACE_ID_MISSING" };

  widgetRegistry.set(widget.id, {
    status: "registered",
    version: AS6_WIDGET_RUNTIME_VERSION,
    ...widget,
  });

  emitAS6BusEvent("widget.registered", { widgetId: widget.id, spaceId: widget.spaceId });

  return { ok: true, widgetId: widget.id };
}

export function activateAS6Widget(widgetId, context = {}) {
  const widget = widgetRegistry.get(widgetId);
  if (!widget) return { ok: false, error: "AS6_WIDGET_NOT_FOUND", widgetId };

  const nextWidget = {
    ...widget,
    status: "active",
    context,
    activatedAt: new Date().toISOString(),
  };

  widgetRegistry.set(widgetId, nextWidget);
  emitAS6BusEvent("widget.activated", { widgetId, context });

  return { ok: true, widget: nextWidget };
}

export function deactivateAS6Widget(widgetId) {
  const widget = widgetRegistry.get(widgetId);
  if (!widget) return { ok: false, error: "AS6_WIDGET_NOT_FOUND", widgetId };

  const nextWidget = {
    ...widget,
    status: "inactive",
  };

  widgetRegistry.set(widgetId, nextWidget);
  emitAS6BusEvent("widget.deactivated", { widgetId });

  return { ok: true, widget: nextWidget };
}

export function getAS6WidgetById(widgetId) {
  return widgetRegistry.get(widgetId) || null;
}

export function getAS6Widgets() {
  return [...widgetRegistry.values()];
}

export function getAS6WidgetsBySpace(spaceId) {
  return getAS6Widgets().filter((widget) => widget.spaceId === spaceId);
}

export function getAS6WidgetRuntimeState() {
  return {
    version: AS6_WIDGET_RUNTIME_VERSION,
    widgetCount: widgetRegistry.size,
    widgets: getAS6Widgets(),
  };
}

export function validateAS6WidgetRuntimePolicy() {
  const failures = [];

  if (typeof registerAS6Widget !== "function") failures.push("register_missing");
  if (typeof activateAS6Widget !== "function") failures.push("activate_missing");
  if (typeof deactivateAS6Widget !== "function") failures.push("deactivate_missing");
  if (typeof getAS6Widgets !== "function") failures.push("list_missing");

  return {
    ok: failures.length === 0,
    failures,
    version: AS6_WIDGET_RUNTIME_VERSION,
  };
}
