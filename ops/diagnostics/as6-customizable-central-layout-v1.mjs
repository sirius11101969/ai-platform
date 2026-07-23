import {
  centralConnectionPath,
  createDefaultCentralLayout,
  moveCentralLayoutItem,
  normalizeCentralLayout,
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
if (Object.keys(defaults).length !== 8) throw new Error("Six business nodes, the central goal, and the control dock are required");

const moved = moveCentralLayoutItem(defaults, "sales", 99, -10);
if (moved.sales.x !== 94 || moved.sales.y !== 6) throw new Error("Canvas boundary guard failed");

const normalized = normalizeCentralLayout({ finance: { x: 25.25, y: 61.66 } });
if (normalized.finance.x !== 25.3 || normalized.finance.y !== 61.7) throw new Error("Coordinate normalization failed");

persistCentralLayout("workspace-a", moved);
persistCentralLayout("workspace-b", defaults);
if (readCentralLayout("workspace-a").sales.x !== 94) throw new Error("Workspace A persistence failed");
if (readCentralLayout("workspace-b").sales.x !== 20) throw new Error("Workspace isolation failed");
if (readCentralLayout("workspace-a").controls.y !== 92) throw new Error("Control dock persistence failed");

const safeFocus = moveCentralLayoutItem(defaults, "focus", 0, 0);
if (safeFocus.focus.x !== 28 || safeFocus.focus.y !== 26) throw new Error("Central focus safe-area guard failed");

const safeControls = moveCentralLayoutItem(defaults, "controls", 100, 0);
if (safeControls.controls.x !== 92 || safeControls.controls.y !== 24) throw new Error("Control dock safe-area guard failed");

const path = centralConnectionPath({ from: "sales", to: "finance" }, moved);
if (!/^M9[01]\./.test(path)) throw new Error("Dynamic connection path failed");
if (path.startsWith("M94 6 ") || path.endsWith(" 16 58")) throw new Error("Connection endpoints must stop before node centers");

console.log("AS6_CENTRAL_LAYOUT_BOUNDARY_GUARD=PASS");
console.log("AS6_CENTRAL_LAYOUT_WORKSPACE_ISOLATION=PASS");
console.log("AS6_CENTRAL_FOCUS_SAFE_AREA=PASS");
console.log("AS6_CENTRAL_CONTROL_DOCK_SAFE_AREA=PASS");
console.log("AS6_CENTRAL_LAYOUT_DYNAMIC_CONNECTIONS=PASS");
console.log("AS6_CENTRAL_CONNECTION_ENDPOINT_CLEARANCE=PASS");
console.log("AS6_CUSTOMIZABLE_CENTRAL_LAYOUT_V1=PASS");
