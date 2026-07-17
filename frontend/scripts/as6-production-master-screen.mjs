import { chromium } from "playwright";
import fs from "node:fs/promises";

const baseUrl = process.env.AS6_BASE_URL || "https://www.as6.ru";
const outputDir = process.env.AS6_VISUAL_OUTPUT_DIR || "../runtime/as6-production-visual";
const targetUrl = `${baseUrl.replace(/\/$/, "")}/preview/living`;
const healthUrl = `${baseUrl.replace(/\/$/, "")}/api/health`;

await fs.mkdir(outputDir, { recursive: true });

const healthResponse = await fetch(healthUrl);
if (!healthResponse.ok) throw new Error(`Health check failed: ${healthResponse.status}`);
const health = await healthResponse.json();
if (health.status !== "OK") throw new Error(`Unexpected health payload: ${JSON.stringify(health)}`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));

const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 90000 });
if (!response || !response.ok()) throw new Error(`Master Screen route failed: ${response?.status() ?? "no response"}`);

const master = page.locator(".as6-master");
await master.waitFor({ state: "visible", timeout: 30000 });
await page.locator(".as6-master__focus").waitFor({ state: "visible", timeout: 30000 });
await page.locator(".as6-master__intent").waitFor({ state: "visible", timeout: 30000 });

const screenshotPath = `${outputDir}/as6-master-screen-production.png`;
await page.screenshot({ path: screenshotPath, fullPage: true });

const evidence = {
  status: "PASS",
  checkedAt: new Date().toISOString(),
  targetUrl,
  health,
  title: await page.title(),
  masterScreenVisible: await master.isVisible(),
  focusVisible: await page.locator(".as6-master__focus").isVisible(),
  intentVisible: await page.locator(".as6-master__intent").isVisible(),
  nodes: await page.locator(".as6-master__node").count(),
  consoleErrors,
  screenshotPath,
};

await fs.writeFile(`${outputDir}/evidence.json`, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
await browser.close();

if (consoleErrors.length) {
  throw new Error(`Browser console errors detected: ${consoleErrors.join(" | ")}`);
}

console.log("AS6_PRODUCTION_MASTER_SCREEN_VISUAL=PASS");
console.log(JSON.stringify(evidence));
