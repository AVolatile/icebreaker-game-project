import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
await page.goto("http://localhost:4310");
await page.screenshot({
  path: "portfolio-assets/homepage-1440.png",
  fullPage: true,
  animations: "disabled",
});
for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("http://localhost:4310");
  console.log(
    width,
    await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll("body *")]
        .filter(
          (e) =>
            e.getBoundingClientRect().right > innerWidth + 1 &&
            getComputedStyle(e).position !== "fixed",
        )
        .slice(-10)
        .map((e) => ({
          tag: e.tagName,
          cls: e.className,
          x: e.getBoundingClientRect().x,
          w: e.getBoundingClientRect().width,
        })),
    })),
  );
  if (width === 390)
    await page.screenshot({
      path: "portfolio-assets/homepage-mobile-390.png",
      fullPage: true,
      animations: "disabled",
    });
}
await browser.close();
