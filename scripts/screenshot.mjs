import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("docs", { recursive: true });

const browser = await chromium.launch();

const desktop = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await desktop.goto("http://localhost:3000", { waitUntil: "networkidle" });
await desktop.screenshot({ path: "docs/screenshot-desktop.png", fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 420, height: 900 } });
await mobile.goto("http://localhost:3000", { waitUntil: "networkidle" });
await mobile.screenshot({ path: "docs/screenshot-mobile.png" });

await browser.close();
console.log("Screenshots saved to docs/");
