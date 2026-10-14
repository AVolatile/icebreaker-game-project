import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch();
const hostContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  }),
  phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
const host = await hostContext.newPage(),
  phone = await phoneContext.newPage();
let failed = false;
const scan = async (page, label) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    label,
    JSON.stringify(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ),
  );
  if (result.violations.length) failed = true;
};
try {
  await host.goto("http://localhost:4311/host?game=hotwire");
  await host.getByRole("button", { name: "Open the room" }).click();
  await expect(host.locator(".host-code b")).toBeVisible();
  await host
    .getByRole("button", { name: "+ 8 demo players", exact: true })
    .click();
  await host
    .getByRole("button", { name: "+ 12 demo players", exact: true })
    .click();
  await host
    .getByRole("button", { name: "+ 12 demo players", exact: true })
    .click();
  await expect(host.locator(".lobby-player")).toHaveCount(30);
  const startBox = await host
    .getByRole("button", { name: "Let’s make a ruckus" })
    .boundingBox();
  if (!startBox || startBox.y + startBox.height > 656)
    throw new Error("Start button overlaps presenter toolbar at 1280×720.");
  await scan(host, "30-player host lobby");
  await host.getByRole("button", { name: "Host controls H" }).click();
  await host.getByRole("button", { name: "Remove Maya", exact: true }).click();
  await host.getByRole("button", { name: "Close host controls" }).click();
  const code = await host.locator(".host-code b").textContent();
  await phone.goto(`http://localhost:4311/join?room=${code}`);
  await phone.getByLabel("What should we call you?").fill("Anthony");
  await phone.getByRole("button", { name: "I’m in. Let’s go." }).click();
  await expect(phone.locator(".player-lobby")).toBeVisible();
  await scan(phone, "Player lobby");
  await host.getByRole("button", { name: "Let’s make a ruckus" }).click();
  await host.getByRole("button", { name: "We’re ready" }).click();
  await expect(phone.locator(".player-answers")).toBeVisible();
  await scan(host, "Host active trivia");
  await scan(phone, "Phone answer controls");
  await host.getByRole("button", { name: "Host controls H" }).click();
  await host.getByRole("button", { name: "End this room" }).click();
  await scan(host, "End-room dialog");
  await host.getByRole("button", { name: "End room", exact: true }).click();
} finally {
  await browser.close();
}
if (failed) process.exitCode = 1;
