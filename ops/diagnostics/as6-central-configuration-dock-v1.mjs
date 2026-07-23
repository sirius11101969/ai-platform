import {
  CENTRAL_LAYOUT_BOUNDS,
  createDefaultCentralLayout,
  moveCentralLayoutItem,
  persistCentralLayout,
  readCentralLayout,
} from "../../frontend/src/living/product-v2/centralWorkspaceLayout.js";

const values = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  },
};

const defaults = createDefaultCentralLayout();
if (!defaults.controls) throw new Error("Movable control dock is required");
if (CENTRAL_LAYOUT_BOUNDS.focus.minY < 24) throw new Error("Central goal can collide with the screen header");

const boundedFocus = moveCentralLayoutItem(defaults, "focus", -50, -50);
if (boundedFocus.focus.x !== 28 || boundedFocus.focus.y !== 26) throw new Error("Focus safe-area bounds failed");

const boundedDock = moveCentralLayoutItem(defaults, "controls", 150, -50);
if (boundedDock.controls.x !== 92 || boundedDock.controls.y !== 24) throw new Error("Dock safe-area bounds failed");

persistCentralLayout("company-a", boundedDock);
persistCentralLayout("company-b", defaults);
if (readCentralLayout("company-a").controls.x !== 92) throw new Error("Dock position persistence failed");
if (readCentralLayout("company-b").controls.x !== 50) throw new Error("Dock workspace isolation failed");

console.log("AS6_CENTRAL_FOCUS_HEADER_CLEARANCE=PASS");
console.log("AS6_CENTRAL_CONTROL_DOCK_BOUNDARY=PASS");
console.log("AS6_CENTRAL_CONTROL_DOCK_PERSISTENCE=PASS");
console.log("AS6_CENTRAL_CONTROL_DOCK_WORKSPACE_ISOLATION=PASS");
console.log("AS6_CENTRAL_CONFIGURATION_DOCK_V1=PASS");
