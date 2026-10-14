import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
await page.goto(
  pathToFileURL(path.resolve("portfolio-assets/cover.html")).href,
);
await page.screenshot({
  path: "portfolio-assets/cover-1280x960.png",
  animations: "disabled",
});
await browser.close();
