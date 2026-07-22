import {
  CENTRAL_STYLE_COLORS,
  CENTRAL_STYLE_GLYPHS,
  createDefaultCentralStyle,
  persistCentralStyle,
  readCentralStyle,
  resetCentralStyleItem,
  updateCentralStyleItem,
} from "../../frontend/src/living/product-v2/centralWorkspaceStyle.js";

const values = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  },
};

const defaults = createDefaultCentralStyle();
if (Object.keys(defaults).length !== 6) throw new Error("Six business node styles are required");

const bounded = updateCentralStyleItem(defaults, "sales", { iconScale: 5, labelScale: 0.1 });
if (bounded.sales.iconScale !== 1.4 || bounded.sales.labelScale !== 0.85) throw new Error("Style bounds failed");

const invalid = updateCentralStyleItem(defaults, "sales", { color: "red", glyph: "unknown" });
if (!CENTRAL_STYLE_COLORS.includes(invalid.sales.color) || !CENTRAL_STYLE_GLYPHS.includes(invalid.sales.glyph)) throw new Error("Style whitelist failed");

const customized = updateCentralStyleItem(defaults, "team", { color: CENTRAL_STYLE_COLORS[3], glyph: "diamond", iconScale: 1.25 });
persistCentralStyle("workspace-a", customized);
persistCentralStyle("workspace-b", defaults);
if (readCentralStyle("workspace-a").team.glyph !== "diamond") throw new Error("Workspace A style persistence failed");
if (readCentralStyle("workspace-b").team.glyph !== "original") throw new Error("Workspace style isolation failed");

const reset = resetCentralStyleItem(customized, "team");
if (reset.team.glyph !== "original" || reset.team.iconScale !== 1) throw new Error("Selected style reset failed");

console.log("AS6_CENTRAL_STYLE_BOUNDARY_GUARD=PASS");
console.log("AS6_CENTRAL_STYLE_VALUE_WHITELIST=PASS");
console.log("AS6_CENTRAL_STYLE_WORKSPACE_ISOLATION=PASS");
console.log("AS6_CENTRAL_STYLE_RESET=PASS");
console.log("AS6_CUSTOMIZABLE_CENTRAL_STYLE_V1=PASS");
