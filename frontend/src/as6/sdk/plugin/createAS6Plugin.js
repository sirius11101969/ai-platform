import { createAS6PluginTemplate } from "./AS6PluginSDK";

export function createAS6WidgetPlugin({ id, title, publisher, widget }) {
  return { ...createAS6PluginTemplate(id, title, publisher), widgets: [widget], capabilities: widget?.capability ? [widget.capability] : [] };
}

export function createAS6AIActionPlugin({ id, title, publisher, action }) {
  return { ...createAS6PluginTemplate(id, title, publisher), aiActions: [action], capabilities: action?.capability ? [action.capability] : [] };
}

export function createAS6BusPlugin({ id, title, publisher, handler }) {
  return { ...createAS6PluginTemplate(id, title, publisher), busHandlers: [handler] };
}
