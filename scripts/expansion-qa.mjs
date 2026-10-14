import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
await fs.mkdir("docs/qa", { recursive: true });
await fs.mkdir("portfolio-assets/studio", { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  overflows: [],
  accessibility: [],
  screenshots: [],
  checked: 0,
};
async function inspect(label, width, height = 900, target = page) {
  await target.setViewportSize({ width, height });
  await target.evaluate(() => document.fonts.ready);
  const issues = await target.evaluate(() => {
    const bad = [];
    const intentional =
      ".ticker, .marquee, .marquee-track, .confetti, .hero-avatar, .avatar-orbit, .hero-star, .floating-reactions";
    for (const e of document.querySelectorAll("body *")) {
      if (!(e instanceof HTMLElement) || e.closest(intentional)) continue;
      const style = getComputedStyle(e),
        box = e.getBoundingClientRect();
      if (
        !box.width ||
        !box.height ||
        style.visibility === "hidden" ||
        style.display === "none"
      )
        continue;
      // Only rendered content participates. Hidden drawers and decorative rotated brand marks are inspected in their open state or visually.
      if (
        e.closest("[hidden]") ||
        e.getAttribute("aria-hidden") === "true" ||
        e.closest('[aria-hidden="true"]')
      )
        continue;
      if (box.right > innerWidth + 2 || box.left < -2)
        bad.push({
          kind: "viewport",
          tag: e.tagName,
          cls: e.className,
          text: e.textContent?.trim().slice(0, 65),
          left: box.left,
          right: box.right,
        });
      if (
        ["P", "H1", "H2", "H3", "BUTTON", "A", "LABEL", "B", "STRONG"].includes(
          e.tagName,
        ) &&
        e.scrollWidth > e.clientWidth + 3 &&
        style.overflowX === "visible" &&
        !e.querySelector(".star")
      )
        bad.push({
          kind: "content",
          tag: e.tagName,
          cls: e.className,
          text: e.textContent?.trim().slice(0, 65),
          client: e.clientWidth,
          scroll: e.scrollWidth,
        });
    }
    return { body: document.documentElement.scrollWidth, issues: bad };
  });
  report.checked++;
  if (issues.issues.length || issues.body > width)
    report.overflows.push({ label, width, height, ...issues });
}
async function capture(name) {
  await page.screenshot({
    path: `portfolio-assets/studio/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  report.screenshots.push(name);
}
async function axe(label) {
  const r = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.accessibility.push({
    label,
    violations: r.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
try {
  for (const route of [
    "/",
    "/games",
    "/how-it-works",
    "/for-teams",
    "/remote",
    "/pricing",
    "/resources",
    "/about",
    "/brand",
    "/campaign",
    "/case-study",
    "/games/hotwire",
    "/games/room-temperature",
    "/games/sellout",
    "/games/caption-this",
    "/games/odd-one-in",
    "/games/scribble-shift",
    "/host",
    "/join",
  ]) {
    await page.goto(`http://localhost:4310${route}`);
    await page.locator("h1, .brand-hero .logo").first().waitFor();
    for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1440])
      await inspect(route, w);
    if (
      [
        "/",
        "/games",
        "/for-teams",
        "/brand",
        "/campaign",
        "/case-study",
      ].includes(route)
    ) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await capture(route === "/" ? "homepage" : route.slice(1));
      await axe(route);
    }
  }
  await page.goto("http://localhost:4310/studio");
  await page
    .getByRole("heading", { name: "My boards.", exact: true })
    .waitFor();
  for (const w of [375, 430, 768, 1024, 1280, 1440]) await inspect("studio", w);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await capture("library");
  await page.setViewportSize({ width: 375, height: 844 });
  await capture("library-mobile-375");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await axe("Studio library");
  await page.getByRole("button", { name: "Make it mine" }).first().click();
  await page
    .getByLabel("Board title")
    .fill("A spectacularly competitive question board with a long title");
  await page.getByLabel("Give the room a question").fill("A".repeat(180));
  for (const letter of "ABCD")
    await page
      .getByLabel(`Answer ${letter}`, { exact: true })
      .fill(`${letter} ` + "A".repeat(78));
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "Add another answer" }).click();
    await page
      .getByLabel(`Answer ${"EF"[i]}`, { exact: true })
      .fill(`${"EF"[i]} ` + "A".repeat(78));
  }
  await page.getByLabel("Mark answer F correct").check();
  for (const w of [375, 430, 768, 1024, 1280, 1440])
    await inspect("editor maximum-length six answers", w);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await capture("editor-stress");
  await axe("Studio editor");
  await page.getByLabel("Board title").fill("Friday Side Quest");
  await page
    .getByLabel("Give the room a question")
    .fill("What is a group of flamingos called?");
  for (const [i, a] of [
    "A flamboyance",
    "A shuffle",
    "A cloud",
    "A committee",
    "A parade",
    "A chorus",
  ].entries())
    await page.getByLabel(`Answer ${"ABCDEF"[i]}`, { exact: true }).fill(a);
  await page.getByLabel("Mark answer A correct").check();
  await page
    .getByLabel("The little fact after the reveal")
    .fill("A flamboyance. Some birds were born for a brand identity.");
  await page.locator(".question-rules select").first().selectOption("60");
  await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await capture("editor");
  await page.getByRole("link", { name: "Preview", exact: true }).click();
  for (const w of [375, 430, 768, 1024, 1280, 1440])
    await inspect("preview", w);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Preview reveal" }).click();
  await capture("presenter-phone-preview");
  await axe("Studio preview");
  const authorBoard = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("ruckus-studio-v1")).find(
      (b) => b.title === "Friday Side Quest",
    ),
  );
  await page.getByRole("button", { name: "Play this board" }).click();
  await page.locator(".host-code b").waitFor();
  await page
    .getByRole("button", { name: "+ 8 demo players", exact: true })
    .click();
  const code = await page.locator(".host-code b").textContent();
  const phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  await phone.goto(`http://localhost:4310/join?room=${code}`);
  await phone.getByLabel("What should we call you?").fill("Captain Friday");
  await phone.getByRole("button", { name: "I’m in. Let’s go." }).click();
  for (const [w, h] of [
    [1024, 768],
    [1280, 720],
    [1366, 768],
    [1440, 810],
    [1920, 1080],
  ])
    await inspect("custom lobby", w, h);
  await page.setViewportSize({ width: 1440, height: 810 });
  await capture("live-lobby");
  await page.getByRole("button", { name: "Let’s make a ruckus" }).click();
  await page.getByRole("button", { name: "We’re ready" }).click();
  await phone.locator(".player-answer").first().waitFor();
  for (const [w, h] of [
    [1024, 768],
    [1280, 720],
    [1366, 768],
    [1440, 810],
    [1920, 1080],
  ])
    await inspect("custom six-answer host", w, h);
  await page.setViewportSize({ width: 1440, height: 810 });
  await capture("live-custom-question");
  await axe("Custom live host");
  for (const w of [320, 375, 390, 430])
    await inspect("custom phone", w, 844, phone);
  await phone.setViewportSize({ width: 390, height: 844 });
  await phone.screenshot({
    path: "portfolio-assets/studio/live-phone-answer.png",
    fullPage: true,
  });
  const phoneAxe = await new AxeBuilder({ page: phone })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  report.accessibility.push({
    label: "Custom phone",
    violations: phoneAxe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
  await phone
    .locator(".player-answer")
    .filter({ hasText: "A flamboyance" })
    .click();
  await page.getByRole("button", { name: "Close round" }).click();
  await capture("live-reveal");
  await page.getByRole("button", { name: "Next →" }).click();
  // QA uses the author’s local document, never a player payload, to drive real answer submissions.
  for (const q of authorBoard.questions.slice(1)) {
    const answer = q.answers[q.correctAnswer ?? 0];
    await phone.locator(".player-answer").filter({ hasText: answer }).click();
    await page.waitForTimeout(600);
    const close = page.getByRole("button", { name: "Close round" });
    if (await close.isVisible()) await close.click();
    await page.getByRole("button", { name: "Next →" }).click();
  }
  await page
    .getByRole("heading", { name: "The room, by the numbers." })
    .waitFor();
  for (const [w, h] of [
    [1024, 768],
    [1280, 720],
    [1366, 768],
    [1440, 810],
    [1920, 1080],
  ])
    await inspect("custom final summary", w, h);
  await page.setViewportSize({ width: 1440, height: 810 });
  await capture("session-results");
  await axe("Custom final summary");
  await phone.close();
  // Private contact sheets, deliberately not routed into the public product.
  await page.setViewportSize({ width: 1100, height: 1000 });
  await page.goto("http://localhost:4310");
  await page.setContent(
    `<html><body style="margin:30px;background:#f6f2e9;font-family:Arial"><h1>RUCKUS · AVATAR AUDIT</h1><p>32 / 48 / 80 / 120 pixels. Actual assets, no scaling applied to this sheet.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${Array.from({ length: 20 }, (_, i) => `<section style="border:1px solid #ccc;padding:12px"><b>${i.toString().padStart(2, "0")}</b><div style="display:flex;gap:15px;align-items:center">${[32, 48, 80, 120].map((s) => `<img src="http://localhost:4310/avatars/${i}.svg" width="${s}" height="${s}">`).join("")}</div></section>`).join("")}</div></body></html>`,
  );
  await page.locator("img").last().waitFor();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "docs/qa/avatar-contact-sheet.png",
    fullPage: true,
  });
  await page.setContent(
    `<html><body style="margin:30px;background:#f6f2e9;font-family:Arial"><h1>RUCKUS · CAPTION SCENE AUDIT</h1><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">${Array.from({ length: 15 }, (_, i) => `<section><b>Scene ${i}</b><img style="display:block;width:100%" src="http://localhost:4310/scenes/${i}.svg"></section>`).join("")}</div></body></html>`,
  );
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "docs/qa/caption-contact-sheet.png",
    fullPage: true,
  });
} finally {
  await fs.writeFile(
    "docs/qa/expansion-browser-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      checks: report.checked,
      overflowCases: report.overflows.length,
      accessibility: report.accessibility.filter((r) => r.violations.length),
    }),
  );
  await browser.close();
}

if (
  report.overflows.length ||
  report.accessibility.some((r) => r.violations.length)
)
  process.exitCode = 1;
