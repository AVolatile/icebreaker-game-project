import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { io } from "socket.io-client";
import fs from "node:fs/promises";
const frontend = process.env.SPLIT_FRONTEND || "http://localhost:4313";
const backend = process.env.SPLIT_BACKEND || "http://localhost:4314";
const report = { frontend, backend, checks: [] };
const health = await fetch(`${backend}/health`);
assert.equal(health.status, 200);
assert.equal((await health.json()).service, "ruckus");
report.checks.push("separate backend health");
for (const origin of [frontend, "https://untrusted.example"]) {
  const res = await fetch(`${backend}/socket.io/?EIO=4&transport=polling`, {
    headers: { Origin: origin },
  });
  if (origin === frontend) {
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), frontend);
  } else assert.equal(res.status, 403);
}
report.checks.push(
  "polling accepts configured origin and rejects untrusted origin",
);
const untrusted = io(backend, {
  transports: ["websocket"],
  extraHeaders: { Origin: "https://untrusted.example" },
  reconnection: false,
});
await new Promise((resolve, reject) => {
  untrusted.once("connect", () =>
    reject(new Error("Untrusted WebSocket accepted")),
  );
  untrusted.once("connect_error", resolve);
});
untrusted.disconnect();
report.checks.push("WebSocket origin rejection");
const poll = io(backend, {
  transports: ["polling"],
  extraHeaders: { Origin: frontend },
  reconnection: false,
});
await new Promise((ok, no) => {
  poll.once("connect", ok);
  poll.once("connect_error", no);
});
poll.disconnect();
report.checks.push("polling-only connection");
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let liveRequests = 0;
page.on("request", (r) => {
  if (r.url().includes("/socket.io")) liveRequests++;
});
try {
  for (const route of [
    "/",
    "/games/hotwire",
    "/studio",
    "/studio/boards/new",
  ]) {
    await page.goto(`${frontend}${route}`);
    await page.locator("main").waitFor();
    assert.equal(
      await page.locator("body").evaluate((e) => e.scrollWidth <= innerWidth),
      true,
    );
  }
  assert.equal(liveRequests, 0);
  report.checks.push("deep links and marketing/Studio avoid sockets");
  await page.goto(`${frontend}/host?game=hotwire`);
  await page.getByRole("button", { name: "Open the room" }).click();
  await page.locator(".host-code b").waitFor();
  const code = await page.locator(".host-code b").textContent();
  await page
    .getByRole("button", { name: "+ 8 demo players", exact: true })
    .click();
  await page.reload();
  await page.locator(".host-code b").waitFor();
  assert.equal(await page.locator(".host-code b").textContent(), code);
  const phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const phone = await phoneContext.newPage();
  phone.on("pageerror", (e) => errors.push(e.message));
  await phone.goto(`${frontend}/join?room=${code}`);
  await phone.getByLabel("What should we call you?").fill("Split Phone");
  await phone.getByRole("button", { name: "I’m in. Let’s go." }).click();
  await phone
    .getByRole("heading", { name: "Split Phone, you’re in." })
    .waitFor();
  await phone.reload();
  await phone
    .getByRole("heading", { name: "Split Phone, you’re in." })
    .waitFor();
  await page.getByRole("button", { name: "Let’s make a ruckus" }).click();
  await page.getByRole("button", { name: "We’re ready" }).click();
  await phone.locator(".player-answer").first().click();
  report.checks.push(
    "independent host/phone origins connect, refresh, join, start and submit",
  );
  // Inspect the server-returned URL through the host capability. It must remain a frontend address.
  const identity = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("ruckus-session")),
  );
  const inspector = io(backend, {
    transports: ["websocket"],
    extraHeaders: { Origin: frontend },
    reconnection: false,
  });
  await new Promise((ok, no) => {
    inspector.once("connect", ok);
    inspector.once("connect_error", no);
  });
  const restored = await new Promise((ok) =>
    inspector.emit("room:resume", identity, ok),
  );
  assert.equal(restored.state.joinUrl, `${frontend}/join?room=${code}`);
  assert.ok(!JSON.stringify(restored.state).includes("correctAnswer"));
  await new Promise((ok) =>
    inspector.emit("host:action", { action: "end" }, ok),
  );
  inspector.disconnect();
  report.checks.push("join URL uses frontend, payload has no answer key");
  await phoneContext.close();
  assert.deepEqual(errors, []);
  report.checks.push("no browser runtime errors");
} finally {
  await fs.mkdir("docs/qa", { recursive: true });
  await fs.writeFile(
    "docs/qa/split-production-report.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
console.log(JSON.stringify(report));
