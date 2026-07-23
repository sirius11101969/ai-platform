import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.env.AS6_ROOT || path.resolve(import.meta.dirname, "../..");
const modulePath = path.join(root, "frontend/src/living/product-v2/livingBackground.js");
const master = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/AS6MasterScreen.jsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "frontend/src/living/product-v2/AS6MasterScreenReference.css"), "utf8");
const background = await import(pathToFileURL(modulePath));

const values = new Map();
global.window = {
  localStorage: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  },
};

assert.deepEqual(background.LIGHT_BACKGROUND_MODES, ["brand", "clean"]);
assert.equal(background.DEFAULT_LIGHT_BACKGROUND, "brand");
assert.equal(background.normalizeLightBackground("unknown"), "brand");
assert.equal(background.readLightBackground("workspace-a"), "brand");
assert.equal(background.persistLightBackground("workspace-a", "clean"), "clean");
assert.equal(background.readLightBackground("workspace-a"), "clean");
assert.equal(background.readLightBackground("workspace-b"), "brand");

assert.match(master, /data-light-background=\{lightBackground\}/);
assert.match(master, /className="as6-master__brand-background"/);
assert.match(master, /\{theme === "light" && \(/);
assert.match(master, /persistLightBackground\(workspaceId/);
assert.match(styles, /\[data-theme="light"\]\[data-light-background="brand"\] \.as6-master__brand-background/);
assert.match(styles, /\.as6-master__brand-background \{[\s\S]*?z-index: 0;[\s\S]*?pointer-events: none;/);
assert.match(styles, /\[data-theme="light"\]\[data-light-background="clean"\][\s\S]*?background: #ffffff;/);
assert.doesNotMatch(styles, /\[data-theme="dark"\][^{]*brand-background/);
assert.doesNotMatch(styles, /#(?:ffd|ffe|fff0|f7e|f8e|f9e|fae)/i);

console.log("AS6_LIGHT_BRAND_BACKGROUND_DEFAULT=PASS");
console.log("AS6_LIGHT_BACKGROUND_WORKSPACE_ISOLATION=PASS");
console.log("AS6_LIGHT_BACKGROUND_CLEAN_FALLBACK=PASS");
console.log("AS6_LIGHT_BACKGROUND_DARK_THEME_ISOLATION=PASS");
console.log("AS6_LIGHT_BACKGROUND_POINTER_SAFETY=PASS");
console.log("AS6_LIGHT_BACKGROUND_NO_WARM_CAST=PASS");
