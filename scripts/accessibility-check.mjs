import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
let failed = false;
for (const route of [
  "/",
  "/host",
  "/join",
  "/games",
  "/brand",
  "/campaign",
  "/case-study",
]) {
  await page.goto(`http://localhost:4310${route}`);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    route,
    JSON.stringify(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ),
  );
  if (result.violations.length) failed = true;
}
await browser.close();
if (failed) process.exitCode = 1;
